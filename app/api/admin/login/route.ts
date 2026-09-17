import { NextRequest, NextResponse } from "next/server";
import {
  adminSessionCookieOptions,
  COOKIE_NAME,
  createAdminSession,
} from "../../../../lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Login unavailable" },
        {
          status: 500,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Incorrect password" },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const session = await createAdminSession();

    if (!session) {
      return NextResponse.json(
        { error: "Login unavailable" },
        {
          status: 500,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const response = NextResponse.json(
      { success: true },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );

    response.cookies.set(COOKIE_NAME, session, adminSessionCookieOptions);

    return response;
  } catch {
    return NextResponse.json(
      { error: "Login failed" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
