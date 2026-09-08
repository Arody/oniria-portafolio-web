import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { canAccessAdmin, isAdminRole } from '@/lib/auth';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'oniria' },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookies) {
          cookies.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  const [, locale, ...segments] = request.nextUrl.pathname.split('/');
  const path = '/' + segments.join('/');
  const isAdmin = path === '/admin' || path.startsWith('/admin/');

  function redirect(pathname: string) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    url.search = '';
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach(cookie => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (isAdmin && !user) return redirect('/login');
  if (user && (isAdmin || path === '/login')) {
    const { data } = await supabase.from('user_roles').select('role').eq('id', user.id).maybeSingle();
    if (isAdmin && !isAdminRole(data?.role)) return redirect('/login');
    if (isAdmin && !canAccessAdmin(data?.role, path)) return redirect('/admin/blog');
    if (path === '/login' && isAdminRole(data?.role)) {
      return redirect(data.role === 'editor' ? '/admin/blog' : '/admin/dashboard');
    }
  }
  return response;
}
