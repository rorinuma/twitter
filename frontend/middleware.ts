import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  const guestRoutes = ["/signin", "/signup", "/"];

  const protectedRoutes = ["/profile"];

  if (token && guestRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (!token && protectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}
