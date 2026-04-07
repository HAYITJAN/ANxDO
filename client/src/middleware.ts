import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Katta harf bilan yozilgan URL lar 404 bermasligi uchun */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const p = url.pathname;

  if (p === "/Admin" || p.startsWith("/Admin/")) {
    url.pathname = "/admin" + p.slice(6);
    return NextResponse.redirect(url);
  }
  if (p === "/Profile" || p.startsWith("/Profile/")) {
    url.pathname = "/profile" + p.slice(8);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/Admin/:path*", "/Profile/:path*"],
};
