import { env } from "../../config/env";
import type { ChatModelId } from "./openrouter";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: Error) => void;
}

export async function streamChat(
  messages: ChatMessage[],
  model: ChatModelId,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  try {
    const body: Record<string, unknown> = {
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    };

    const res = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.openrouterApiKey}`,
        "HTTP-Referer": env.frontendUrl,
        "X-Title": "Adyapan AI",
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: { message: res.statusText } }));
      throw new Error(errData.error?.message ?? `HTTP ${res.status}: ${res.statusText}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body stream");

    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            callbacks.onChunk(delta);
          }
        } catch {
          // skip unparseable lines
        }
      }
    }

    callbacks.onDone(fullText);
  } catch (error: any) {
    if (error.name === "AbortError") {
      callbacks.onDone("");
      return;
    }
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
  }
}
