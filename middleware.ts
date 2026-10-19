import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidToken } from "./lib/admin-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin area authentication
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (isValidToken(sessionToken)) {
      return NextResponse.next();
    }

    // Fallback: Check HTTP Basic Auth
    const username = (process.env.ADMIN_USERNAME || "admin").toLowerCase();
    const email = (process.env.ADMIN_DEFAULT_EMAIL || process.env.ADMIN_EMAIL || "").toLowerCase();
    const password = process.env.ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD || "admin1234";
    const authorization = request.headers.get("authorization");

    if (authorization?.startsWith("Basic ")) {
      try {
        const credentials = atob(authorization.slice(6));
        const delimiter = credentials.indexOf(":");
        if (delimiter !== -1) {
          const providedUsername = credentials.slice(0, delimiter).toLowerCase();
          const providedPassword = credentials.slice(delimiter + 1);
          if ((providedUsername === username || (email && providedUsername === email)) && providedPassword === password) {
            return NextResponse.next();
          }
        }
      } catch {
        // ignore parsing error
      }
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Public Active Redirects: execute redirects configured in Admin CMS
  if (
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.includes(".")
  ) {
    try {
      const lookupUrl = new URL("/api/redirects", request.nextUrl.origin);
      lookupUrl.searchParams.set("path", pathname);
      const res = await fetch(lookupUrl.toString(), {
        headers: { "x-internal-lookup": "1" },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.redirect?.toPath) {
          const toPath = data.redirect.toPath;
          const destination = toPath.startsWith("http://") || toPath.startsWith("https://")
            ? toPath
            : new URL(toPath, request.url).toString();
          return NextResponse.redirect(destination, data.redirect.statusCode === 302 ? 302 : 301);
        }
      }
    } catch {
      // Continue if lookup is unreachable
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
