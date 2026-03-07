import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { genAI } from "@/lib/gemini";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const PROMPT_BUILDER_SYSTEM = `You are the world's most skilled AI image prompt engineer. You specialize in creating prompts for marketing content for Saudi Arabian brands. You understand brand identity, visual marketing, cultural sensitivity, and what makes content go viral on social media.

Given a company's brand data, content day details, and style direction, create 4 distinct but cohesive image generation prompts that will produce scroll-stopping social media visuals.

Rules:
- Each prompt must incorporate the brand's color palette naturally
- Prompts must be culturally appropriate for Saudi Arabia (no alcohol, modest clothing when people shown, halal context)
- Each of the 4 prompts should show a different visual angle/composition of the same concept
- Prompts should specify: subject, lighting, composition, color grading, mood, style
- Prompts should end with technical specs: "social media marketing photography, 1:1 square format, professional quality, commercially viable"
- Do NOT include text/typography in image prompts

Style translation:
- "lifestyle": warm golden-hour light, real people in authentic Saudi settings, natural product integration
- "graphic": flat design elements, strong geometric Saudi patterns, vivid brand colors
- "luxury": negative space, single hero element, dramatic lighting, marble/gold/premium textures
- "heritage": mashrabiya shadows, geometric Islamic patterns, traditional elements modernized

Return ONLY JSON:
{
  "prompts": [
    { "id": 1, "style_label": "Hero Shot", "prompt": "full detailed prompt here" },
    { "id": 2, "style_label": "Lifestyle", "prompt": "full detailed prompt here" },
    { "id": 3, "style_label": "Detail", "prompt": "full detailed prompt here" },
    { "id": 4, "style_label": "Mood", "prompt": "full detailed prompt here" }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company,
      dayContent,
      style = "lifestyle",
      additionalInstructions,
      outputLanguage = "ar",
    } = body;

    if (!company?.name || !dayContent?.topic) {
      return NextResponse.json(
        { error: "Company and dayContent (topic) required" },
        { status: 400 }
      );
    }

    const userMsg = [
      `Company: ${JSON.stringify(company)}`,
      `Content: ${JSON.stringify(dayContent)}`,
      `Style: ${style}`,
      `Output language for any text in scene: ${outputLanguage}`,
      additionalInstructions ? `Extra: ${additionalInstructions}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    // Step 1: Use GPT-4o to build image prompts
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: PROMPT_BUILDER_SYSTEM },
        { role: "user", content: userMsg + "\n\nReturn JSON only." },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    const prompts = parsed.prompts ?? [];

    // Step 2: Generate images with Gemini (Nano Banana Pro)
    const supabase = await createServerSupabaseClient();
    const images: { id: number; style_label: string; url?: string; prompt_used: string }[] = [];

    for (const p of prompts.slice(0, 4)) {
      try {
        const response = await genAI.models.generateContent({
          model: "gemini-2.5-flash-preview-image-generation",
          contents: p.prompt,
          config: {
            responseModalities: ["IMAGE"],
            imageConfig: {
              aspectRatio: "1:1",
            },
          },
        });

        // Extract base64 image from response
        const parts = response.candidates?.[0]?.content?.parts ?? [];
        const imagePart = parts.find((part: { inlineData?: { data: string; mimeType: string } }) => part.inlineData);

        if (imagePart?.inlineData) {
          const base64Data = imagePart.inlineData.data;
          const mimeType = imagePart.inlineData.mimeType || "image/png";
          const ext = mimeType.includes("jpeg") ? "jpg" : "png";
          const fileName = `generated/${company.id || "unknown"}/${Date.now()}-${p.id}.${ext}`;

          // Upload to Supabase Storage
          const buffer = Buffer.from(base64Data, "base64");
          const { error: uploadError } = await supabase.storage
            .from("logos")
            .upload(fileName, buffer, {
              contentType: mimeType,
              upsert: true,
            });

          if (uploadError) {
            console.warn("Upload failed for image", p.id, uploadError.message);
            // Fallback: return as data URI
            images.push({
              id: p.id,
              style_label: p.style_label || `Style ${p.id}`,
              url: `data:${mimeType};base64,${base64Data}`,
              prompt_used: p.prompt,
            });
            continue;
          }

          const { data: publicUrlData } = supabase.storage
            .from("logos")
            .getPublicUrl(fileName);

          images.push({
            id: p.id,
            style_label: p.style_label || `Style ${p.id}`,
            url: publicUrlData.publicUrl,
            prompt_used: p.prompt,
          });
        }
      } catch (imgErr) {
        console.warn("Image gen failed for", p.id, imgErr);
      }
    }

    return NextResponse.json({
      success: true,
      images,
    });
  } catch (e) {
    console.error("generate-images", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Image generation failed" },
      { status: 500 }
    );
  }
}
