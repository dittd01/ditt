
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUser, hasRole } from '@/lib/auth';

// Why: The matcher config is the most efficient way to apply middleware.
// It ensures the middleware function only runs for paths that match this pattern,
// avoiding unnecessary execution on asset requests, API routes, etc.
// We are now protecting both /admin and /ops routes.
export const config = {
  matcher: ['/ops/:path*', '/admin/:path*'],
};

/**
 * Middleware to protect operational and admin routes.
 * It verifies that the user is authenticated and has the required 'admin' or 'staff' role.
 *
 * @param {NextRequest} request - The incoming request object.
 * @returns {NextResponse} A response object, which is either the original request continued
 * or a redirect to the 404 page for unauthorized users.
 */
export function middleware(request: NextRequest) {
  // Why: We fetch the user on every request to an /ops/ or /admin/ route. This ensures that
  // session changes (like logout or role changes) are immediately respected.
  const user = getUser();
  const isAuthorized = hasRole(user, ['admin', 'staff']);

  // Why: If the user is not authorized, we rewrite to a generic 404 page.
  // This is a form of security through obscurity; we don't want to reveal that a
  // protected page even exists at that URL. Returning a 403 (Forbidden) would
  // confirm the page's existence.
  if (!isAuthorized) {
    const url = request.nextUrl.clone();
    url.pathname = '/404'; // Rewrite to the standard 404 page
    return NextResponse.rewrite(url);
  }

  // Why: If authorized, we let the request proceed to the intended page.
  // The `NextResponse.next()` call passes control to the next middleware or to the page.
  return NextResponse.next();
}
