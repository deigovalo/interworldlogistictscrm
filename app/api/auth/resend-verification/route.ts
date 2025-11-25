import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getVerificationTokenByEmail } from '@/lib/auth';
import { generateToken } from '@/lib/crypto';
import { sendVerificationEmail } from '@/lib/email';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (user.email_verified) {
      return NextResponse.json(
        { error: 'El email ya está verificado' },
        { status: 400 }
      );
    }

    // Generate new token and update user
    const newToken = generateToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await sql`
      UPDATE users
      SET email_verification_token = ${newToken}, email_verification_token_expires = ${tokenExpires}
      WHERE id = ${user.id}
    `;

    // Send verification email
    try {
      await sendVerificationEmail(email, newToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return NextResponse.json(
        { error: 'Error al enviar el correo de verificación' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Correo de verificación reenviado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Error al reenviar correo de verificación' },
      { status: 500 }
    );
  }
}
