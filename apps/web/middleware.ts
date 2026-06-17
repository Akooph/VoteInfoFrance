import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/sign-in', '/sign-up', '/onboarding', '/auth/callback'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Redirect unauthenticated users away from protected routes
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL(`/sign-in?next=${encodeURIComponent(pathname)}`, request.url));
  }

  // Redirect authenticated users from landing/auth pages to dashboard
  if (user && (pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Fetch profile once for all authenticated-user checks below.
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('commune_insee, role')
      .eq('id', user.id)
      .maybeSingle();

    // Admin routes: require role = 'admin'.
    if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // All other protected routes: require ZIP code set (skip admin users + onboarding).
    const needsOnboarding = !profile?.commune_insee && profile?.role !== 'admin';
    if (needsOnboarding && !pathname.startsWith('/admin') && pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|geo|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
