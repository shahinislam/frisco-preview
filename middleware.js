import { NextResponse } from 'next/server';
import laravelURL from './components/utils/laravel-url';

const VALID_LOCALES = new Set([
  'en', 'es', 'ur', 'hi', 'ar', 'ml', 'vi', 'ig', 'yo', 'bn',
]);

export async function middleware(request) {
  const { pathname, search, locale } = request.nextUrl;
  const isDefaultLocale = locale === 'en';

  /* ----------------------------------
     1️⃣ Cookie-based language redirect
     If URL is on default locale but the user has a non-English
     googtrans cookie, send them to the locale-prefixed URL so the
     active language is preserved across links whose hrefs were
     authored without a prefix (menus, parsed footer HTML, etc.).
  ---------------------------------- */
  if (isDefaultLocale) {
    const cookieValue = request.cookies.get('googtrans')?.value;
    const cookieLang = cookieValue?.split('/').filter(Boolean).pop();

    if (
      cookieLang &&
      cookieLang !== 'en' &&
      VALID_LOCALES.has(cookieLang)
    ) {
      const target = new URL(
        `/${cookieLang}${pathname}${search}`,
        request.url
      );
      const redirectResponse = NextResponse.redirect(target, 307);
      redirectResponse.headers.set('Vary', 'Cookie');
      return redirectResponse;
    }
  }

  /* ----------------------------------
     2️⃣ Check Laravel redirects.
     Match against the user-facing URL (locale prefix included) so
     prefix-aware sources still work, and preserve the locale on the
     destination unless the destination is external/already-prefixed.
  ---------------------------------- */
  try {
    const res = await fetch(`${laravelURL}/api/admin/redirects`, {
      cache: 'no-store',
    });

    const redirects = await res.json();
    const userFacingPath = isDefaultLocale
      ? pathname
      : `/${locale}${pathname}`;
    const currentPath = decodeURIComponent(userFacingPath + search);

    const redirect = redirects.find(
      r => decodeURIComponent(r.source) === currentPath
    );

    if (redirect && redirect.source !== redirect.destination) {
      let destination = redirect.destination;

      if (!isDefaultLocale && !destination.startsWith('http')) {
        if (!destination.startsWith(`/${locale}`)) {
          destination = `/${locale}${destination}`;
        }
      }

      return NextResponse.redirect(
        destination.startsWith('http')
          ? new URL(destination)
          : new URL(destination, request.url),
        301
      );
    }
  } catch (err) {
    console.error('Redirects fetch error:', err.message);
  }

  /* ----------------------------------
     3️⃣ Cookie + Content-Language headers.
     Routing/rewriting is handled natively by Next.js i18n.
  ---------------------------------- */
  const response = NextResponse.next();

  if (!isDefaultLocale) {
    response.cookies.set('googtrans', `/en/${locale}`, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    response.headers.set('Content-Language', locale);
  } else {
    response.cookies.delete('googtrans');
    response.headers.set('Content-Language', 'en');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next|api|static|favicon.ico|google_translate_element).*)'],
};
