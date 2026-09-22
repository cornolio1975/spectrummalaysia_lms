import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);

  // Refresh the session — important! Do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Allow public routes
  const publicPaths = ["/login", "/forgot-password", "/verify", "/about", "/api"];
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));

  // Redirect unauthenticated users away from protected routes
  if (!isPublicPath && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === "/login" || pathname === "/forgot-password")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect root to dashboard if authenticated, else login
  if (pathname === "/") {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // RBAC Route Protection Logic
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;

    if (pathname.startsWith('/admin')) {
      if (role === 'observer') {
        const allowedObserverAdminRoutes = [
          '/admin/analytics',
          '/admin/trainers',
          '/admin/trainers/dashboard',
          '/admin/trainers/profiles',
          '/admin/trainers/credentials',
          '/admin/trainers/assignments',
          '/admin/trainers/performance',
          '/admin/trainers/attendance',
          '/admin/trainers/reports',
          '/admin/trainers/audit',
          '/admin/audit',
        ];

        const explicitlyDeniedPaths = [
          '/admin/users',
          '/admin/users/roles',
          '/admin/settings',
          '/admin/trainers/new',
          '/admin/trainers/applications'
        ];

        if (explicitlyDeniedPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = '/access-denied';
          return NextResponse.redirect(redirectUrl);
        }

        const isAllowed = allowedObserverAdminRoutes.some(p => pathname === p || pathname.startsWith(p + '/'));
        
        if (!isAllowed) {
           if (pathname !== '/admin') {
             const redirectUrl = request.nextUrl.clone();
             redirectUrl.pathname = '/access-denied';
             return NextResponse.redirect(redirectUrl);
           }
        }
      } else if (role === 'learner' || role === 'participant' || role === 'trainer') {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/access-denied';
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
