import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; resetAt: number }>();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
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

export async function POST(request: Request) {
  const key = clientKey(request);

  if (rateLimited(key)) {
    return NextResponse.json(
      { error: "Too many subscription attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": "600",
        },
      },
    );
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 415, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const rawEmail = "email" in body && typeof body.email === "string" ? body.email : "";
    const email = rawEmail.trim().toLowerCase();

    if (email.length > 254 || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    await prisma.subscriber.create({
      data: { email },
    });

    attempts.delete(key);

    return NextResponse.json(
      { message: "Thanks for subscribing!" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This email is already subscribed." },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      );
    }

    console.error("Subscription error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
