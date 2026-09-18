const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function rateLimited(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_ATTEMPTS;
}

import { NextRequest, NextResponse } from "next/server";
import {
  adminSessionCookieOptions,
  COOKIE_NAME,
  createAdminSession,
} from "../../../../lib/admin-auth";

export async function POST(request: NextRequest) {
  const key = clientKey(request);

  if (rateLimited(key)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": "600",
        },
      }
    );
  }

  try {
    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Login unavailable" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    attempts.delete(key);
    const session = await createAdminSession();

    if (!session) {
      return NextResponse.json(
        { error: "Login unavailable" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    const response = NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } }
    );

    response.cookies.set(COOKIE_NAME, session, adminSessionCookieOptions);
    return response;
  } catch {
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
