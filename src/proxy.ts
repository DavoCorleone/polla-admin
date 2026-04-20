import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protegemos las rutas administrativas, excluyendo explícitamente /admin-login
const isAdminRoute = createRouteMatcher(['/admin', '/admin/(.*)']);

export const proxy = clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    await auth.protect();
  }
});

export default proxy;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
