import OpenAI from "openai";
import axios from "axios";
import { env } from "../../config/env";

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

const clients: Record<string, OpenAI> = {};

function getClient(apiKey?: string): OpenAI {
  const key = apiKey || env.nvidiaApiKey;
  if (!clients[key]) {
    clients[key] = new OpenAI({
      apiKey: key,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });
  }
  return clients[key];
}

export interface NvidiaChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface NvidiaChatOptions {
  model: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stream?: boolean;
  apiKey?: string;
}

export async function nvidiaChatCompletion(
  messages: NvidiaChatMessage[],
  options: NvidiaChatOptions
): Promise<string> {
  const openai = getClient(options.apiKey);

  const completion = await openai.chat.completions.create({
    model: options.model,
    messages,
    temperature: options.temperature ?? 1,
    top_p: options.topP ?? 0.95,
    max_tokens: options.maxTokens ?? 16384,
    stream: false as const,
  });

  const choice = (completion as OpenAI.ChatCompletion).choices[0];
  const reasoning = (choice?.message as any)?.reasoning || (choice?.message as any)?.reasoning_content;

  let output = "";
  if (reasoning) output += reasoning + "\n";
  output += choice?.message?.content || "";
  return output;
}

export async function nvidiaGenerateText(
  systemPrompt: string,
  userPrompt: string,
  model: string = "deepseek-ai/deepseek-v4-flash",
  options?: Partial<NvidiaChatOptions>
): Promise<string> {
  return nvidiaChatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { model, ...options }
  );
}

export async function nvidiaChatCompletionStream(
  messages: NvidiaChatMessage[],
  options: NvidiaChatOptions,
  onChunk: (content: string) => void
): Promise<void> {
  const openai = getClient(options.apiKey);

  const stream = await openai.chat.completions.create({
    model: options.model,
    messages,
    temperature: options.temperature ?? 1,
    top_p: options.topP ?? 1,
    max_tokens: options.maxTokens ?? 16384,
    seed: 42,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) onChunk(content);
  }
}

export async function nvidiaGenerateTextStream(
  systemPrompt: string,
  userPrompt: string,
  onChunk: (content: string) => void,
  model: string = "z-ai/glm-5.2",
  options?: Partial<NvidiaChatOptions>
): Promise<void> {
  return nvidiaChatCompletionStream(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { model, ...options },
    onChunk
  );
}

export async function nvidiaAxiosChat(
  messages: NvidiaChatMessage[],
  options: NvidiaChatOptions
): Promise<string> {
  const apiKey = options.apiKey || env.nvidiaApiKey;

  const response = await axios.post(
    `${NVIDIA_BASE_URL}/chat/completions`,
    {
      model: options.model,
      messages,
      max_tokens: options.maxTokens ?? 16384,
      seed: 0,
      stream: false,
      temperature: options.temperature ?? 1,
      top_p: options.topP ?? 1,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    }
  );

  const choice = response.data?.choices?.[0];
  const reasoning = choice?.message?.reasoning || choice?.message?.reasoning_content;

  let output = "";
  if (reasoning) output += reasoning + "\n";
  output += choice?.message?.content || "";
  return output;
}

export async function nvidiaAxiosChatStream(
  messages: NvidiaChatMessage[],
  options: NvidiaChatOptions,
  onChunk: (content: string) => void
): Promise<void> {
  const apiKey = options.apiKey || env.nvidiaApiKey;

  const response = await axios.post(
    `${NVIDIA_BASE_URL}/chat/completions`,
    {
      model: options.model,
      messages,
      max_tokens: options.maxTokens ?? 16384,
      seed: 0,
      stream: true,
      temperature: options.temperature ?? 1,
      top_p: options.topP ?? 1,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "text/event-stream",
      },
      responseType: "stream",
    }
  );

  response.data.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    if (text.startsWith("data: ")) {
      const json = text.slice(6).trim();
      if (json === "[DONE]") return;
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content || "";
        if (content) onChunk(content);
      } catch {}
    }
  });

  return new Promise((resolve, reject) => {
    response.data.on("end", resolve);
    response.data.on("error", reject);
  });
}

// ============================================================================
// NVIDIA NEMOTON-3-EMBED-1B — Embedding Model for RAG/Search
// ============================================================================

export async function nvidiaEmbed(
  input: string | string[],
  options?: { apiKey?: string; model?: string }
): Promise<number[][]> {
  const apiKey = options?.apiKey || env.nvidiaApiKey;
  const model = options?.model || "nvidia/nemotron-3-embed-1b";

  const response = await axios.post(
    `${NVIDIA_BASE_URL}/embeddings`,
    {
      model,
      input,
      encoding_format: "float",
      input_type: "query",
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  const sortedData = response.data.data.sort(
    (a: any, b: any) => a.index - b.index
  );
  return sortedData.map((item: any) => item.embedding);
}

export async function nvidiaEmbedQuery(
  query: string,
  options?: { apiKey?: string; model?: string }
): Promise<number[]> {
  const embeddings = await nvidiaEmbed(query, options);
  return embeddings[0];
}
