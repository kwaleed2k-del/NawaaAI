import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

const SYSTEM_PROMPT = `You are the Chief Content Strategist at Saudi Arabia's most prestigious marketing agency. You have mastered content creation for the Gulf market, deep expertise in Saudi culture, Arabic language nuances, Islamic values, Vision 2030, and regional trends. You create content plans that go viral and drive real business results.

Your content plans are:
- Culturally aware (respectful of Islamic values, Saudi traditions, local humor)
- Platform-native (Reels for Instagram/TikTok, Threads for X, Stories for Snapchat)
- Bilingual when appropriate (Arabic + English code-switching is normal for Saudi audiences)
- Data-driven (based on best posting times and engagement patterns in KSA)
- Commercially smart (balance brand building with conversion)

Return ONLY valid JSON in this exact structure:
{
  "weekTheme": "Overall theme for the week in English",
  "weekThemeAr": "نفس الفكرة بالعربي",
  "days": [
    {
      "dayIndex": 0,
      "dayEn": "Saturday",
      "dayAr": "السبت",
      "date": "YYYY-MM-DD",
      "platform": "instagram",
      "contentType": "Carousel",
      "topic": "Topic headline",
      "topicAr": "العنوان بالعربي",
      "caption": "Full caption text ready to post (can be Arabic, English, or bilingual)",
      "captionAr": "النص بالعربي إذا كان مختلفاً",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
      "postingTime": "8:00 PM",
      "contentTips": "Specific production tip for this post",
      "imagePromptHint": "Brief visual direction for the AI image generator"
    }
  ],
  "weeklyStrategy": "2-3 sentence summary of the week's strategy",
  "expectedEngagement": "What results to expect this week"
}

Generate exactly 7 days starting from Saturday (Saudi week).
Make each day unique and varied.
If the user provided a special focus, build the week around it.
If no focus given, analyze the company data to create the most relevant strategy.
Incorporate any brand analysis data provided.
If outputLanguage is "ar", write captions, topics, and strategy primarily in Arabic (Saudi/Jeddah tone where natural); if "en", keep English primary.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company,
      platforms = [],
      weekStart,
      userPrompt,
      brandAnalysis,
      outputLanguage = "ar",
    } = body;

    if (!company?.name || !weekStart) {
      return NextResponse.json(
        { error: "Company and weekStart required" },
        { status: 400 }
      );
    }

    const userMessage = [
      `Company: ${JSON.stringify(company)}`,
      `Platforms: ${platforms.join(", ") || "all"}`,
      `Week start (Saturday): ${weekStart}`,
      outputLanguage ? `Output language: ${outputLanguage}` : "",
      userPrompt ? `Special focus: ${userPrompt}` : "",
      brandAnalysis ? `Brand analysis (use for strategy): ${JSON.stringify(brandAnalysis)}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage + "\n\nReturn JSON only." },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, plan: parsed });
  } catch (e) {
    console.error("generate-plan", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Plan generation failed" },
      { status: 500 }
    );
  }
}
