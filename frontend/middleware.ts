import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected and public routes
const protectedRoutes = ['/dashboard']
const publicRoutes = ['/login', '/register', '/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route)

  // Get access token from cookies
  const accessToken = request.cookies.get('access_token')?.value

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if accessing login/register with valid token
  if ((pathname === '/login' || pathname === '/register') && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
