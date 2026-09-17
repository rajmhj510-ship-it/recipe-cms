import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  adminSessionCookieOptions,
} from "../../../../lib/admin-auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);

  response.cookies.set(COOKIE_NAME, "", {
    ...adminSessionCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
