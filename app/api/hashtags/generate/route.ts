import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

const SYSTEM = `You are a Saudi social media expert specializing in hashtag strategy for the Gulf market. Generate highly relevant, trending hashtags for KSA audiences. Mix Arabic and English hashtags. Return ONLY valid JSON:
{
  "broad": ["#tag1", "#tag2", ...],
  "niche": ["#tag1", ...],
  "saudi": ["#السعودية", "#tag2", ...]
}
Each array 8-12 hashtags. broad = high reach, niche = targeted, saudi = Saudi/local.`;

export async function POST(request: NextRequest) {
  try {
    const { topic, platform = "instagram" } = await request.json();
    if (!topic) {
      return NextResponse.json({ error: "Topic required" }, { status: 400 });
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Topic: ${topic}. Platform: ${platform}. Return JSON only.` },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });
    const text = completion.choices[0]?.message?.content?.trim() || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    return NextResponse.json({
      success: true,
      sets: {
        broad: parsed.broad ?? [],
        niche: parsed.niche ?? [],
        saudi: parsed.saudi ?? [],
      },
    });
  } catch (e) {
    console.error("hashtags/generate", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
