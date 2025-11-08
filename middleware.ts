// middleware.ts
import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/webhooks(.*)",
    "/sign-in",
    "/sign-up",
    "/setup-username",
    "/:username",
    "/search",
  ],
  afterAuth(auth, req) {
    // Permitir siempre acceso a setup-username
    if (req.nextUrl.pathname === "/setup-username") {
      return NextResponse.next();
    }
    
    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};