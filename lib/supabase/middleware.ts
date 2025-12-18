// Supabase Middleware for Auth Session Refresh
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to onboarding if not completed (only for authenticated portal routes)
  if (user && (
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/campaigns') ||
      request.nextUrl.pathname.startsWith('/settings') ||
      request.nextUrl.pathname.startsWith('/analytics') ||
      request.nextUrl.pathname.startsWith('/ai-studio') ||
      request.nextUrl.pathname.startsWith('/contentflow') ||
      request.nextUrl.pathname.startsWith('/launchpad')
  )) {
    // Check if onboarding is completed
    const { data: onboarding } = await supabase
      .from('onboarding_progress')
      .select('completed')
      .eq('user_id', user.id)
      .single();

    // Redirect to onboarding if not completed
    if (!onboarding || !onboarding.completed) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  }

  // Redirect away from onboarding if already completed (unless explicitly taking tour)
  if (user && request.nextUrl.pathname === '/onboarding') {
    // Check if user is explicitly taking the product tour
    const isTakingTour = request.nextUrl.searchParams.get('tour') === 'true';

    if (!isTakingTour) {
      const { data: onboarding } = await supabase
        .from('onboarding_progress')
        .select('completed')
        .eq('user_id', user.id)
        .single();

      if (onboarding && onboarding.completed) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}
