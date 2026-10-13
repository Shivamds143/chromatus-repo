import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidToken } from "./lib/admin-auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow the admin login page and static assets
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // 1. Check session cookie
  const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (isValidToken(sessionToken)) {
    return NextResponse.next();
  }

  // 2. Fallback: Check HTTP Basic Auth (allows automated scripts or direct credentials)
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin1234";
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Basic ")) {
    try {
      const credentials = atob(authorization.slice(6));
      const delimiter = credentials.indexOf(":");
      if (delimiter !== -1) {
        const providedUsername = credentials.slice(0, delimiter);
        const providedPassword = credentials.slice(delimiter + 1);
        if (providedUsername === username && providedPassword === password) {
          return NextResponse.next();
        }
      }
    } catch {
      // ignore parsing error, proceed to redirect
    }
  }

  // Not authenticated: redirect cleanly to login page
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
