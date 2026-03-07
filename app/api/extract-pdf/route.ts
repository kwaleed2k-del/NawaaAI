import { NextRequest, NextResponse } from "next/server";
import { genAI } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64,
              },
            },
            {
              text: `Extract the key company information from this PDF document. Focus on:
- Company description and mission
- Products/services offered
- Target market/audience
- Unique value proposition
- Any brand values or tone of voice mentioned

Return a clean, well-structured summary text (NOT JSON). Use clear paragraphs. Keep it comprehensive but concise — aim for 300-800 words. Write in the same language as the document.`,
            },
          ],
        },
      ],
    });

    const text = response.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 500 });
    }

    return NextResponse.json({ success: true, text });
  } catch (e) {
    console.error("extract-pdf error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "PDF extraction failed" },
      { status: 500 }
    );
  }
}
