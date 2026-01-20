import {NextResponse} from 'next/server';

export function middleware(request) {
    const {pathname} = request.nextUrl;

    // Get the auth token from cookies
    const authToken = request.cookies.get('authToken');
    const isAuthenticated = !!authToken;

    // DEBUG - À SUPPRIMER APRÈS
    console.log('🔍 Middleware:', {
        pathname,
        isAuthenticated: isAuthenticated,
        cookieValue: authToken?.value?.substring(0, 20) + '...'
    });

    // Public routes that don't require authentication
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
    const isPublicRoute = publicRoutes.includes(pathname) || publicRoutes.some(route => pathname.startsWith(route + '/'));

    // Root path - allow access for everyone (authenticated or not)
    if (pathname === '/') {
        console.log('✅ Allow: / (landing page accessible for all)');
        return NextResponse.next();
    }

    // If user is authenticated and tries to access auth pages, redirect to dashboard
    if (isAuthenticated && isPublicRoute) {
        console.log('↗️  Redirect:', pathname, '→ /dashboard (already authenticated)');
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If user is not authenticated and tries to access protected route, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
        console.log('🔒 Redirect:', pathname, '→ /auth/login (not authenticated)');
        const loginUrl = new URL('/auth/login', request.url);
        // Save the original URL to redirect back after login
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    console.log('✅ Allow:', pathname, '(authenticated)');
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         * - api routes (handled by backend)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
    ],
};
