import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Check if user is browsing as a guest
  const isGuest = request.cookies.get('guest-session')?.value === 'true';

  // Routes that require NO authentication at all
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/auth/callback');

  // Routes guests ARE allowed to visit (read-only browsing)
  const guestAllowedRoutes = ['/feed', '/posts', '/mentors', '/classrooms'];
  const isGuestAllowed = guestAllowedRoutes.some((route) => pathname.startsWith(route));

  // 1. Public routes are always allowed
  if (isPublicRoute) {
    return response;
  }

  // 2. Authenticated users can go anywhere
  if (user) {
    return response;
  }

  // 3. Guests can access guest-allowed routes
  if (isGuest && isGuestAllowed) {
    return response;
  }

  // 4. Everyone else → login
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};