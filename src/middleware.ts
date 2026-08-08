import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/manifest.json",
  "/sw.js",
  "/icons/(.*)",
  // Authenticated via its own Bearer token, not a Clerk session — see src/app/api/mcp/route.ts
  "/api/mcp",
  // OAuth machine-to-machine endpoints — no Clerk session involved.
  // /oauth/authorize is deliberately NOT here: it needs a signed-in user,
  // and Clerk's own protect() handles the sign-in redirect and return.
  "/.well-known/(.*)",
  "/oauth/register",
  "/oauth/token",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (req.nextUrl.pathname === "/") {
    const { userId } = await auth();
    if (userId) {
      return NextResponse.redirect(new URL("/standup", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
