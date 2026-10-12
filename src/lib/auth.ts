// Works in both the Edge runtime (middleware) and Node (route handlers).
export const COOKIE_NAME = "campuscare_admin";
const SESSION_MS = 8 * 60 * 60 * 1000;
const enc = new TextEncoder();

async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function checkPassword(input: string): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const pass = process.env.ADMIN_PASSWORD;
  if (!secret || !pass) return false;
  // Hash both so comparison length never leaks the real password length
  return safeEqual(await hmac(input, secret), await hmac(pass, secret));
}

export async function createToken(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  const exp = String(Date.now() + SESSION_MS);
  return `${exp}.${await hmac(exp, secret)}`;
}

export async function verifyToken(token?: string): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!token || !secret) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, await hmac(exp, secret));
}

export const SESSION_SECONDS = SESSION_MS / 1000;
