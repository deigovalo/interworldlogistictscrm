import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { getUserByEmail, createSession } from '@/lib/auth';
import { verifyPassword, generateToken } from '@/lib/crypto';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const user = await getUserByEmail(validatedData.email);
    if (!user) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    if (!user.email_verified) {
      return NextResponse.json(
        { error: 'Por favor verifica tu email antes de iniciar sesión' },
        { status: 403 }
      );
    }

    const passwordResult = await sql`
      SELECT password_hash FROM users WHERE id = ${user.id}
    `;

    const passwordHash = passwordResult[0]?.password_hash || '';

    const isPasswordValid = await verifyPassword(validatedData.password, passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    const userAgent = request.headers.get('user-agent') || null;
    const ip = request.headers.get('x-forwarded-for') || (request as any).ip || null;

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await createSession(user.id, token, expiresAt, userAgent, ip);

    const response = NextResponse.json(
      {
        message: 'Iniciaste sesión exitosamente',
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        }
      },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
