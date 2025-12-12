import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionByToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // 1. Define routes
    const isProtectedRoute = path.startsWith('/dashboard')
    const isPublicOnlyRoute = path === '/' || path.startsWith('/auth')

    // 2. Get token
    const token = request.cookies.get('auth_token')?.value

    // 3. Handle Public-Only Routes (Redirect logged-in users to dashboard)
    if (isPublicOnlyRoute && token) {
        // Optional: Verify token existence in DB to be sure it's valid before redirecting
        // For performance, we might just trust the cookie existence for the redirect on public pages,
        // but verifying ensures we don't redirect users with stale/invalid cookies to dashboard (which would just bounce them back).
        // Let's do a quick verify.
        try {
            // NOTE: We pass null for userAgent for now as middleware might handle headers differently, 
            // or we can extract it. getSessionByToken expects (token, userAgent).
            const userAgent = request.headers.get('user-agent') || null
            const session = await getSessionByToken(token, userAgent)

            if (session) {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
        } catch (error) {
            // If DB error or verification fails, let them stay on public page (effectively ignoring the invalid token)
            // or maybe clear the cookie? Let's just proceed.
            console.error("Middleware auth check failed", error)
        }
    }

    // 4. Handle Protected Routes (Redirect non-logged-in users to login)
    if (isProtectedRoute) {
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        // We can also verify session here for double security, 
        // though usually individual page/layout checks or `useAuth` handle the granular details.
        // However, since we are here, let's verify to prevent access with invalid cookies.
        try {
            const userAgent = request.headers.get('user-agent') || null
            const session = await getSessionByToken(token, userAgent)

            if (!session) {
                return NextResponse.redirect(new URL('/auth/login', request.url))
            }

            // Pass user info via headers if needed (similar to lib/middleware-auth.ts)
            const requestHeaders = new Headers(request.headers)
            requestHeaders.set('x-user-id', session.user_id.toString())
            requestHeaders.set('x-user-role', session.role)

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            })
        } catch (error) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }
    }

    return NextResponse.next()
}

// Configure paths that trigger the middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc) - problematic to capture all, but usually exclude static.
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico|css|js)).*)',
    ],
}
