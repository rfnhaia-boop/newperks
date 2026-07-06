import { NextRequest, NextResponse } from "next/server";

const hits = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, v] of hits) {
    if (v.resetAt <= now) hits.delete(key);
  }
}, 60_000);

export function rateLimit(
  req: NextRequest,
  { max = 10, windowSec = 60 }: { max?: number; windowSec?: number } = {}
): NextResponse | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const key = `${ip}:${req.nextUrl.pathname}`;
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return null;
  }

  entry.count++;
  if (entry.count > max) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em alguns segundos." },
      { status: 429 }
    );
  }

  return null;
}
