import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { locales, defaultLocale } from './i18n/config';

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip locale handling for API routes and auth callback
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return await updateSession(request);
  }

  // Apply intl middleware first
  const intlResponse = intlMiddleware(request);

  // If intl middleware wants to redirect, do that
  if (intlResponse && intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // Update Supabase session
  const sessionResponse = await updateSession(request);

  // Return the session response with intl headers
  if (intlResponse) {
    sessionResponse.headers.set('x-intl-locale', request.nextUrl.locale || defaultLocale);
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
