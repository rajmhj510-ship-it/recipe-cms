import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = String(body.password ?? "");

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
