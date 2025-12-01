import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  phone: string | null;
  role: 'admin' | 'usuario';
  email_verified: boolean;
  created_at: Date;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT id, email, first_name, last_name, company_name, phone, role, email_verified, created_at
    FROM users
    WHERE email = ${email}
  `;

  return result.length > 0 ? result[0] as User : null;
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await sql`
    SELECT id, email, first_name, last_name, company_name, phone, role, email_verified, created_at
    FROM users
    WHERE id = ${id}
  `;

  return result.length > 0 ? result[0] as User : null;
}

export async function createUser(data: {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  company_name: string;
  phone: string;
  email_verification_token: string;
  email_verification_token_expires: Date;
}): Promise<User> {
  const result = await sql`
    INSERT INTO users (
      email, password_hash, first_name, last_name, company_name, phone,
      role, email_verification_token, email_verification_token_expires
    ) VALUES (${data.email}, ${data.password_hash}, ${data.first_name}, ${data.last_name}, 
              ${data.company_name}, ${data.phone}, ${'usuario'}, 
              ${data.email_verification_token}, ${data.email_verification_token_expires})
    RETURNING id, email, first_name, last_name, company_name, phone, role, email_verified, created_at
  `;

  return result[0] as User;
}

export async function verifyUserEmail(token: string): Promise<boolean> {
  const result = await sql`
    UPDATE users
    SET email_verified = TRUE, email_verification_token = NULL, email_verification_token_expires = NULL
    WHERE email_verification_token = ${token} AND email_verification_token_expires > CURRENT_TIMESTAMP
    RETURNING id
  `;

  return result.length > 0;
}

export async function createSession(userId: number, token: string, expiresAt: Date, userAgent: string | null, ipAddress: string | null): Promise<void> {
  await sql`
    INSERT INTO sessions (user_id, token, expires, user_agent, ip_address)
    VALUES (${userId}, ${token}, ${expiresAt}, ${userAgent}, ${ipAddress})
  `;
}

export async function getSessionByToken(token: string, userAgent: string | null) {
  const result = await sql`
    SELECT s.id, s.user_id, s.expires, s.user_agent, u.email, u.first_name, u.last_name, u.role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires > CURRENT_TIMESTAMP
  `;

  if (result.length === 0) return null;

  const session = result[0];

  // Validate User-Agent (basic fingerprinting)
  if (session.user_agent !== userAgent) {
    // Potential session hijacking attempt
    return null;
  }

  return session;
}

export async function deleteSession(token: string): Promise<void> {
  await sql`
    DELETE FROM sessions WHERE token = ${token}
  `;
}

export async function getVerificationTokenByEmail(email: string) {
  const result = await sql`
    SELECT email_verification_token, email_verification_token_expires
    FROM users
    WHERE email = ${email} AND email_verified = FALSE
  `;

  return result.length > 0 ? result[0] : null;
}
