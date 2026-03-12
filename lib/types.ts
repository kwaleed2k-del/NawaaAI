/* ══ Shared types used across client and server ══ */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
}
