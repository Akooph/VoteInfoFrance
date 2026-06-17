import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// force-static satisfies output:'export' for the landing build.
// In static generation, Next.js instruments Request with a throwing getter on
// `.url`; the try-catch catches that and returns a 404 shell (never served by
// the landing page). The SSR deployment handles the real OAuth code exchange.
export const dynamic = 'force-static';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`);
  } catch {
    return new Response(null, { status: 404 });
  }
}
