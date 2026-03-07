import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export function getGeminiModel(modelId = "gemini-2.0-flash-exp") {
  return genAI.getGenerativeModel({ model: modelId });
}
