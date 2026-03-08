import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

async function scrapeUrl(url: string): Promise<string | null> {
  try {
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = "https://" + finalUrl;

    const res = await fetch(finalUrl, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
      },
      redirect: "follow",
    });

    if (!res.ok) return null;
    const html = await res.text();

    // Extract meta tags first (useful for social profiles)
    const metaTags: string[] = [];
    const metaRegex = /<meta[^>]*(?:name|property|content)=[^>]*>/gi;
    let match;
    while ((match = metaRegex.exec(html)) !== null) {
      const tag = match[0];
      const content = tag.match(/content="([^"]*)"/i)?.[1];
      const name = tag.match(/(?:name|property)="([^"]*)"/i)?.[1];
      if (content && name) {
        metaTags.push(`${name}: ${content}`);
      }
    }

    // Extract JSON-LD structured data (often has follower counts, post data)
    const jsonLdBlocks: string[] = [];
    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        const summary = JSON.stringify(parsed, null, 0).slice(0, 1500);
        jsonLdBlocks.push(summary);
      } catch { /* skip invalid JSON-LD */ }
    }

    // Extract visible text
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const parts = [];
    if (metaTags.length > 0) parts.push("META TAGS:\n" + metaTags.slice(0, 20).join("\n"));
    if (jsonLdBlocks.length > 0) parts.push("STRUCTURED DATA:\n" + jsonLdBlocks.join("\n"));
    parts.push("PAGE TEXT:\n" + text.slice(0, 3000));

    return parts.join("\n\n") || null;
  } catch {
    return null;
  }
}

/* Scrape social media profile page */
async function scrapeSocialProfile(handle: string, platform: string): Promise<string | null> {
  if (!handle) return null;
  const cleanHandle = handle.replace(/^@/, "").trim();
  if (!cleanHandle) return null;

  const urls: Record<string, string[]> = {
    instagram: [
      `https://www.instagram.com/${cleanHandle}/`,
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${cleanHandle}`,
    ],
    twitter: [
      `https://x.com/${cleanHandle}`,
      `https://twitter.com/${cleanHandle}`,
    ],
    tiktok: [
      `https://www.tiktok.com/@${cleanHandle}`,
    ],
    snapchat: [
      `https://www.snapchat.com/add/${cleanHandle}`,
    ],
    linkedin: [
      `https://www.linkedin.com/company/${cleanHandle}/`,
    ],
  };

  const platformUrls = urls[platform.toLowerCase()] || urls.instagram || [];

  for (const url of platformUrls) {
    const data = await scrapeUrl(url);
    if (data && data.length > 100) {
      return data.slice(0, 3000);
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, companyDescription, competitors, outputLanguage } =
      body;

    if (!companyName || !competitors?.length) {
      return NextResponse.json(
        { error: "Company name and at least one competitor are required" },
        { status: 400 }
      );
    }

    if (competitors.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 competitors allowed" },
        { status: 400 }
      );
    }

    // Scrape both websites AND social media profiles in parallel
    const scrapedData = await Promise.all(
      competitors.map(
        async (c: { name: string; handle?: string; platform?: string; websiteUrl?: string }) => {
          const [websiteData, socialData] = await Promise.all([
            c.websiteUrl ? scrapeUrl(c.websiteUrl) : Promise.resolve(null),
            c.handle ? scrapeSocialProfile(c.handle, c.platform || "instagram") : Promise.resolve(null),
          ]);

          const parts = [];
          if (websiteData) parts.push(`WEBSITE DATA:\n${websiteData}`);
          else parts.push("WEBSITE DATA: Could not scrape or no URL provided");

          if (socialData) parts.push(`SOCIAL MEDIA PROFILE DATA (${c.platform || "instagram"}):\n${socialData}`);
          else parts.push(`SOCIAL MEDIA PROFILE DATA: Could not scrape ${c.handle || "no handle"} on ${c.platform || "instagram"}`);

          return { name: c.name, data: parts.join("\n\n") };
        }
      )
    );

    const competitorContext = scrapedData
      .map((s) => `═══ ${s.name} ═══\n${s.data}`)
      .join("\n\n");

    const langInstruction =
      outputLanguage === "ar"
        ? "CRITICAL: You MUST respond entirely in Arabic. Every single word, insight, recommendation, and label must be in Arabic. Do NOT mix English."
        : "Respond in English.";

    const systemPrompt = `You are a world-class competitive intelligence strategist and senior brand consultant with 20+ years of experience in the Saudi/GCC market. You have deep expertise in social media analytics, brand positioning, content strategy, and digital marketing across MENA.

${langInstruction}

You will receive REAL SCRAPED DATA from competitor websites and social media profiles. Use this data to provide FACTUAL, DATA-DRIVEN analysis.

CRITICAL HONESTY RULES:
- If you found real data from scraping (follower counts, bio text, post descriptions, meta tags), reference it explicitly and mark it as VERIFIED
- If you could NOT scrape a profile or website, clearly state that the data point is an ESTIMATE based on your knowledge of the brand/industry
- NEVER present estimated data as if it were verified. Use phrases like "Based on industry benchmarks..." or "Estimated from public information..." for unverified claims
- If the scraped data contains real numbers (followers, engagement, posts), USE THEM. Do not make up different numbers
- Scores should reflect the ACTUAL quality you observe from the scraped data, not generic numbers

Return a JSON object with this EXACT structure. Every string field must be DETAILED and LENGTHY (2-5 sentences minimum per field). Do NOT give one-word or one-sentence answers. Go deep.

{
  "executiveSummary": "Write 4-5 detailed paragraphs. Reference SPECIFIC observations from the scraped data. Mention actual content themes, messaging, and positioning you found. If data was limited, acknowledge that and provide your best strategic assessment.",

  "brandAssessment": {
    "strengths": ["Detailed strength based on OBSERVED data — cite what you found (2+ sentences each)", "At least 5 strengths"],
    "weaknesses": ["Detailed weakness based on OBSERVED gaps or issues (2+ sentences each)", "At least 5 weaknesses"],
    "opportunities": ["Specific market opportunity with how to capture it (2+ sentences each)", "At least 4 opportunities"],
    "threats": ["Specific competitive threat with urgency level (2+ sentences each)", "At least 4 threats"],
    "overallScore": 72,
    "marketPosition": "A detailed 3-sentence assessment referencing actual observations from the data"
  },

  "competitors": [
    {
      "name": "Competitor Name",
      "handle": "@handle",
      "platform": "instagram",
      "postingFrequency": "If scraped data shows post counts or dates, reference them. Otherwise clearly state this is estimated. Include benchmarks.",
      "contentTypes": ["Reels/Short video", "Carousel", "Stories"],
      "contentThemes": ["Based on actual content observed from scraping"],
      "captionStyle": "Describe what you ACTUALLY observed in their content/website. If not scraped, say estimated.",
      "hashtagStrategy": "Based on observed hashtags from scraping, or estimated if not available",
      "engagementLevel": "Use real numbers if found in scraped data. If estimated, clearly mark as estimate.",
      "visualStyle": "Based on actual website/profile observations",
      "audienceProfile": "Based on scraped meta data, content language, and observable targeting",
      "contentCalendar": "Based on observed content patterns or estimated from industry knowledge",
      "paidStrategy": "Based on observable paid indicators from scraping",
      "strengths": ["5 specific strengths based on OBSERVED data"],
      "weakPoints": ["5 specific weak points based on OBSERVED gaps"],
      "threatLevel": 7,
      "overallScore": 72,
      "keyInsight": "The most important insight from the ACTUAL scraped data. Be specific. 2-3 sentences.",
      "stealThisMove": "A specific tactic observed from their actual content/website that the brand should adapt"
    }
  ],

  "comparisonMatrix": {
    "categories": ["Posting Frequency", "Content Quality", "Engagement Rate", "Visual Branding", "Hashtag Strategy", "Audience Growth", "Community Building", "Innovation & Creativity", "Saudi Cultural Fit", "Storytelling"],
    "yourBrand": [65, 70, 60, 75, 55, 60, 50, 65, 70, 55],
    "competitors": {
      "CompetitorName": [70, 65, 75, 60, 80, 70, 65, 55, 75, 60]
    }
  },

  "winningStrategy": {
    "immediate": [
      {"action": "Specific action based on gaps found in competitor analysis. 2-3 sentences.", "priority": "high", "impact": "high", "kpi": "Measurable KPI"},
      "Provide 4-5 immediate actions"
    ],
    "shortTerm": [
      {"action": "2-4 week initiative. Be specific.", "priority": "high", "impact": "high", "kpi": "Measurable KPI"},
      "Provide 4-5 short-term actions"
    ],
    "longTerm": [
      {"action": "1-3 month strategic initiative.", "priority": "medium", "impact": "high", "kpi": "Measurable KPI"},
      "Provide 4-5 long-term actions"
    ],
    "contentGaps": ["Content gap identified from actual competitor analysis. 5+ gaps."],
    "differentiators": ["Positioning opportunity based on competitor weaknesses found. 5+ differentiators."],
    "quickWins": ["3-5 things executable TODAY based on observed competitor gaps"],
    "contentSeries": [
      {"name": "Series name", "description": "Concept based on gaps found in competitor content.", "platform": "Platform"}
    ]
  },

  "saudiMarketInsights": {
    "trendAlignment": "Based on observed content patterns and Saudi market knowledge",
    "vision2030Relevance": "How the brand connects to Vision 2030 themes",
    "culturalFit": "Assessment based on observed language use, cultural references in scraped data",
    "localOpportunities": "Saudi market opportunities based on competitor gaps observed",
    "ramadanStrategy": "Ramadan content strategy based on competitor patterns"
  }
}

CRITICAL RULES:
1. Return ONLY valid JSON — no markdown, no code blocks, no comments
2. Every text field must be DETAILED (2-5 sentences minimum)
3. ALWAYS distinguish between VERIFIED (from scraped data) and ESTIMATED data
4. Scores must be realistic and differentiated — use the full 0-100 range based on actual quality observed
5. Actions must be IMMEDIATELY ACTIONABLE
6. Provide at least 4-5 items for each array field
7. Be SPECIFIC to the Saudi/GCC market`;

    const userPrompt = `Produce a data-driven competitive analysis for this brand:

BRAND TO ANALYZE:
- Company: ${companyName}
- Description: ${companyDescription || "Not provided — infer from industry context"}

COMPETITORS TO ANALYZE:
${competitors.map((c: { name: string; handle?: string; platform?: string; websiteUrl?: string }) => `- ${c.name} | Handle: ${c.handle || "N/A"} | Platform: ${c.platform || "N/A"} | Website: ${c.websiteUrl || "N/A"}`).join("\n")}

══════════════════════════════════════
REAL SCRAPED DATA FROM COMPETITOR WEBSITES & SOCIAL PROFILES:
══════════════════════════════════════
${competitorContext}
══════════════════════════════════════

IMPORTANT: The above is REAL data scraped from their websites and social media profiles. Use it to provide accurate, factual analysis. If certain profiles could not be scraped, acknowledge that and provide estimates clearly marked as such. Never present guesses as facts.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    let analysisData;
    try {
      const cleaned = content
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      analysisData = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: content },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, analysis: analysisData });
  } catch (error) {
    console.error("Competitor analysis error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
