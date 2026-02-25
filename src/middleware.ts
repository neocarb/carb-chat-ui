import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth) {
    // Strip threadId from callback URL so a new user doesn't inherit a previous user's thread
    const callbackUrl = new URL(req.url);
    callbackUrl.searchParams.delete("threadId");
    const signInUrl = new URL("/api/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", callbackUrl.toString());
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    // Protect all routes except auth routes, static files, and Next.js internals
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
