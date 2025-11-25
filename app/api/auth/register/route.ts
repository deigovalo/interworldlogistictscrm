import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validation';
import { createUser, getUserByEmail } from '@/lib/auth';
import { hashPassword, generateToken } from '@/lib/crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const existingUser = await getUserByEmail(validatedData.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(validatedData.password);
    const verificationToken = generateToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await createUser({
      email: validatedData.email,
      password_hash: passwordHash,
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      company_name: validatedData.company_name,
      phone: validatedData.phone,
      email_verification_token: verificationToken,
      email_verification_token_expires: tokenExpires,
    });

    try {
      await sendVerificationEmail(validatedData.email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue registration even if email fails to send
    }

    return NextResponse.json(
      { 
        message: 'Usuario registrado. Por favor verifica tu email.',
        email: validatedData.email 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
