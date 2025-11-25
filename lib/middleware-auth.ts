import { NextRequest, NextResponse } from 'next/server';
import { getSessionByToken } from '@/lib/auth';

export async function withAuth(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    const session = await getSessionByToken(token);

    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', session.user_id.toString());
    requestHeaders.set('x-user-role', session.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}
