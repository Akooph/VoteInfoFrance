import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Exact '/' is the landing page — always public so static builds and anonymous
// users can access it. startsWith check is used for all other public prefixes.
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

  const isPublic =
    pathname === '/' || PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Redirect unauthenticated users away from protected routes
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL(`/sign-in?next=${encodeURIComponent(pathname)}`, request.url));
  }

  // Redirect authenticated users from landing/auth pages to dashboard
  if (user && (pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect authenticated users with no ZIP code to onboarding (skip if already there)
  if (user && pathname !== '/onboarding') {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('commune_insee')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.commune_insee) {
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
