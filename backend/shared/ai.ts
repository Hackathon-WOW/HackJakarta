/**
 * Provider-agnostic LLM client using the OpenAI-compatible Chat Completions API.
 * Works with any free provider by setting env vars — no code change:
 *   Groq (free):   AI_BASE_URL=https://api.groq.com/openai/v1                       AI_MODEL=llama-3.3-70b-versatile
 *   Gemini (free): AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai  AI_MODEL=gemini-2.0-flash
 *   Ollama (local):AI_BASE_URL=http://localhost:11434/v1   AI_API_KEY=ollama          AI_MODEL=llama3.2
 * If AI_BASE_URL/AI_MODEL are unset, callers fall back to data-driven templates.
 */
const BASE_URL = (process.env.AI_BASE_URL || '').replace(/\/$/, '');
const API_KEY = process.env.AI_API_KEY || '';
const MODEL = process.env.AI_MODEL || '';

export const isAIConfigured = (): boolean => Boolean(BASE_URL && MODEL);

export const aiInfo = () => ({ configured: isAIConfigured(), model: MODEL || null });

export class AIUnavailable extends Error {}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Send a chat completion. Throws AIUnavailable if no provider is configured or the call fails,
 * so callers can degrade gracefully to templates.
 */
export async function chat(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number; json?: boolean } = {},
): Promise<string> {
  if (!isAIConfigured()) throw new AIUnavailable('No AI provider configured');

  const body: any = {
    model: MODEL,
    messages,
    temperature: opts.temperature ?? 0.6,
    max_tokens: opts.maxTokens ?? 1200,
  };
  if (opts.json) body.response_format = { type: 'json_object' };

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45_000),
    });
  } catch (e) {
    throw new AIUnavailable(`AI request failed: ${(e as Error).message}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new AIUnavailable(`AI provider error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data: any = await res.json().catch(() => null);
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new AIUnavailable('Empty AI response');
  return content.trim();
}

/**
 * Streaming chat completion. Calls `onDelta` with each text chunk as it arrives,
 * and resolves with the full concatenated text. Throws AIUnavailable if no provider.
 */
export async function chatStream(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number },
  onDelta: (delta: string) => void,
): Promise<string> {
  if (!isAIConfigured()) throw new AIUnavailable('No AI provider configured');

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: opts.temperature ?? 0.6,
        max_tokens: opts.maxTokens ?? 1200,
        stream: true,
      }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (e) {
    throw new AIUnavailable(`AI request failed: ${(e as Error).message}`);
  }
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new AIUnavailable(`AI provider error ${res.status}: ${text.slice(0, 200)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onDelta(delta);
        }
      } catch {
        // ignore keep-alive / partial lines
      }
    }
  }
  return full;
}

/** Parse a JSON object from an LLM response, tolerating ```json fences and surrounding prose. */
export function parseJsonResponse<T = any>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
