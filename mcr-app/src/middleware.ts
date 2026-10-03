import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Cheap gate: bounce visitors without a valid session token to /login.
// Pages still re-check the user (active flag, role) against the database.
export async function middleware(req: NextRequest) {
  const id = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!id) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};
