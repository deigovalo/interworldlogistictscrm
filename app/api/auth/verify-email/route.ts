import { NextRequest, NextResponse } from 'next/server';
import { verifyUserEmail } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 400 }
      );
    }

    const verified = await verifyUserEmail(token);

    if (!verified) {
      return NextResponse.json(
        { error: 'Token expirado o inválido' },
        { status: 400 }
      );
    }

    return NextResponse.redirect(new URL('/auth/login?verified=true', request.url));
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Error al verificar email' },
      { status: 500 }
    );
  }
}
