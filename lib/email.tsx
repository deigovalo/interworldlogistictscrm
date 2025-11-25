import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;

    await resend.emails.send({
      from: 'Diego Jhare <onboarding@resend.dev>',
      to: email,
      subject: 'Verifica tu email - Interworld Solutions',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #333; margin: 0;">Bienvenido a Interworld Solutions</h1>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
              Hola,
            </p>
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
              Gracias por registrarte en Interworld Solutions. Para completar tu registro, necesitas verificar tu dirección de correo electrónico.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                Verificar Email
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
              O copia este enlace en tu navegador:
            </p>
            <p style="color: #0066cc; font-size: 12px; word-break: break-all; margin-bottom: 20px;">
              ${verificationUrl}
            </p>
            
            <p style="color: #999; font-size: 13px;">
              Este enlace expirará en 24 horas.
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; color: #999; font-size: 12px;">
            <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
            <p>© 2025 Interworld Solutions. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}
