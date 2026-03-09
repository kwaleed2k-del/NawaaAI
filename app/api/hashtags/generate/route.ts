import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { authenticateRequest, checkRateLimit } from "@/lib/api-auth";

const SYSTEM = `You are a Saudi social media expert specializing in hashtag strategy for the Gulf market. Generate highly relevant, trending hashtags for KSA audiences. Mix Arabic and English hashtags.

CRITICAL — Tailor hashtags to the specified platform:
- Instagram: Mix broad discovery, niche community, and trending explore-page tags. 10-15 per set.
- TikTok: Focus on trending challenges, viral tags, FYP-related. 5-8 punchy tags per set.
- X (Twitter): Conversation-driving, trending topic tags. 3-5 concise tags per set.
- LinkedIn: Professional industry hashtags, thought-leadership tags. 5-8 per set.
- Snapchat: Location-based, event, trending topic tags. 3-5 per set.

Return ONLY valid JSON:
{
  "broad": ["#tag1", "#tag2", ...],
  "niche": ["#tag1", ...],
  "saudi": ["#السعودية", "#tag2", ...]
}
broad = high reach, niche = targeted, saudi = Saudi/local. Adjust count per platform as specified above.`;

export async function POST(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest();
  if (authError) return authError;
  const rl = checkRateLimit(user!.id, "/api/hashtags/generate");
  if (rl) return rl;

  try {
    const { topic, platform = "instagram" } = await request.json();
    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic required" }, { status: 400 });
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Topic: ${topic.trim()}. Platform: ${platform}. Return JSON only.` },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });
    const text = completion.choices[0]?.message?.content?.trim() || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    if (!parsed.broad && !parsed.niche && !parsed.saudi) {
      return NextResponse.json({ error: "AI response missing hashtag sets. Please try again." }, { status: 500 });
    }
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
