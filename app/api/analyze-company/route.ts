import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

const SYSTEM_PROMPT = `You are Saudi Arabia's most elite brand strategist and marketing consultant. You have 20 years of experience working with the Kingdom's top brands, deep knowledge of Saudi consumer behavior, cultural nuances, Vision 2030, and the Gulf market. You speak both Arabic and English fluently.

Your task is to analyze a brand and return a structured JSON brand DNA analysis.

Return ONLY valid JSON, no markdown, no explanation outside the JSON. Structure:
{
  "brandPersonality": {
    "innovation": 0-100,
    "trust": 0-100,
    "energy": 0-100,
    "elegance": 0-100,
    "boldness": 0-100,
    "summary": "2 sentence brand personality description"
  },
  "contentPillars": [
    { "name": "pillar name", "nameAr": "Arabic name", "description": "what to post", "percentage": 25 }
  ],
  "audienceInsights": {
    "primaryAge": "18-34",
    "interests": ["interest1", "interest2", "interest3"],
    "saudiSpecific": "One insight specific to Saudi/Gulf audience",
    "bestPostingTimes": [
      { "day": "Tuesday-Thursday", "time": "8pm-10pm", "reason": "why" }
    ]
  },
  "contentMix": {
    "educational": 25,
    "promotional": 20,
    "engagement": 30,
    "storytelling": 15,
    "entertainment": 10
  },
  "platformStrategy": {
    "primary": "platform name",
    "secondary": "platform name",
    "rationale": "why these platforms for this brand in Saudi"
  },
  "toneGuide": {
    "doUse": ["tone trait 1", "tone trait 2", "tone trait 3"],
    "avoid": ["what to never say", "what to avoid"],
    "exampleCaption": "Write one example Instagram caption for this brand"
  },
  "vision2030Alignment": "How this brand aligns with Saudi Vision 2030 (1-2 sentences)"
}

If outputLanguage is "ar", write summary, descriptions, exampleCaption, and saudiSpecific in Arabic (Saudi/Jeddah-appropriate tone where natural).`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, outputLanguage = "en" } = body;
    if (!company || !company.name) {
      return NextResponse.json(
        { error: "Company data required" },
        { status: 400 }
      );
    }

    // Trim description to avoid exceeding token limits
    const companyTrimmed = { ...company };
    if (typeof companyTrimmed.description === "string" && companyTrimmed.description.length > 2000) {
      companyTrimmed.description = companyTrimmed.description.slice(0, 2000) + "...";
    }
    // Remove any nested brand_analysis to avoid circular bloat
    delete companyTrimmed.brand_analysis;

    const userMessage = `Company data:\n${JSON.stringify(companyTrimmed, null, 2)}\n\nOutput language: ${outputLanguage}. Return JSON only.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, analysis: parsed });
  } catch (e) {
    console.error("analyze-company", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
