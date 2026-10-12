import { NextResponse } from "next/server";
import { COOKIE_NAME, SESSION_SECONDS, checkPassword, createToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !(await checkPassword(password))) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, await createToken(), {
    httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: SESSION_SECONDS,
  });
  return res;
}
