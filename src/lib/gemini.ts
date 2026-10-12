import { GoogleGenAI } from "@google/genai";

/** Server-only Gemini helper. Reads GEMINI_API_KEY and GEMINI_MODEL from the environment. */
export class AiNotConfiguredError extends Error {}

let ai: GoogleGenAI | null = null;

function client() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "your-gemini-api-key") throw new AiNotConfiguredError("AI is not configured. Set GEMINI_API_KEY.");
  return (ai ??= new GoogleGenAI({ apiKey: key }));
}

const model = () => process.env.GEMINI_MODEL || "gemini-3.8-flash";

/** Reads an optional numeric env var, falling back when it is missing or invalid. */
function num(name: string, fallback: number, min: number, max: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && process.env[name] !== "" && n >= min && n <= max ? n : fallback;
}
const maxTokens = () => Math.round(num("GEMINI_MAX_OUTPUT_TOKENS", 1024, 64, 8192));

export async function generateText(system: string, prompt: string): Promise<string> {
  const res = await client().models.generateContent({
    model: model(), contents: prompt, config: { systemInstruction: system, temperature: num("GEMINI_TEMPERATURE", 0.4, 0, 1), maxOutputTokens: maxTokens() },
  });
  return (res.text ?? "").trim();
}

export async function generateJSON<T>(system: string, prompt: string): Promise<T> {
  const res = await client().models.generateContent({
    model: model(), contents: prompt,
    config: { systemInstruction: system, temperature: num("GEMINI_JSON_TEMPERATURE", 0.2, 0, 1), maxOutputTokens: maxTokens(), responseMimeType: "application/json" },
  });
  const raw = (res.text ?? "").replace(/^```json|```$/g, "").trim();
  return JSON.parse(raw) as T;
}

export function aiErrorResponse(err: unknown) {
  if (err instanceof AiNotConfiguredError) return { status: 503, body: { error: err.message } };
  console.error("Gemini error", err);
  return { status: 502, body: { error: "The AI service is unavailable right now. Please try again." } };
}
