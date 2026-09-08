import { NextResponse, type NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n } from './i18n.config';
import { updateSession } from './lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = i18n.locales.some(locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  if (!hasLocale) {
    const locales = [...i18n.locales];
    const languages = new Negotiator({ headers: { 'accept-language': request.headers.get('accept-language') || '' } }).languages(locales);
    const locale = match(languages, locales, i18n.defaultLocale);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }
  return updateSession(request);
}

export const config = {
  matcher: ['/((?!api/|_next/|.*\\.(?:ico|png|jpg|jpeg|svg|webp|gif|avif|mp4|webm|woff2?|ttf|otf|txt|xml)$).*)'],
};
