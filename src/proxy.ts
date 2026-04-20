import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protegemos todas las rutas que comiencen con /admin o /admin-login (excepto la misma vista de login)
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

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
