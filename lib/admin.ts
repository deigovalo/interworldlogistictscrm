import { neon } from "@neondatabase/serverless"
import { hashPassword } from "./crypto"

const sql = neon(process.env.DATABASE_URL!)

export interface AdminUser {
    id: number
    email: string
    first_name: string
    last_name: string
    company_name: string | null
    phone: string | null
    role: string
    email_verified: boolean
    created_at: Date
}

// Get all users (admin)
export async function getAllUsers(filters?: { search?: string; role?: string }) {
    let query =
        "SELECT id, email, first_name, last_name, company_name, phone, role, email_verified, created_at FROM users WHERE 1=1"

    if (filters?.search) {
        query += ` AND (email ILIKE '%${filters.search}%' OR first_name ILIKE '%${filters.search}%' OR last_name ILIKE '%${filters.search}%')`
    }

    if (filters?.role) {
        query += ` AND role = '${filters.role}'`
    }

    query += " ORDER BY created_at DESC"

    const result = await sql.query(query)
    return result
}

// Create user (admin)
export async function createUserAdmin(data: {
    first_name: string
    last_name: string
    company_name: string
    phone: string
    email: string
    password: string
}) {
    const passwordHash = await hashPassword(data.password)

    const result = await sql`
    INSERT INTO users (email, password_hash, first_name, last_name, company_name, phone, role, email_verified)
    VALUES (${data.email}, ${passwordHash}, ${data.first_name}, ${data.last_name}, ${data.company_name}, ${data.phone}, ${"usuario"}, true)
    RETURNING id, email, first_name, last_name, company_name, phone, role, email_verified, created_at
  `

    return result[0]
}

// Update user (admin)
export async function updateUserAdmin(
    userId: number,
    data: { first_name?: string; last_name?: string; company_name?: string; phone?: string },
) {
    let query = "UPDATE users SET"
    const updates: string[] = []
    const values: any[] = []

    if (data.first_name) {
        updates.push(`first_name = $${values.length + 1}`)
        values.push(data.first_name)
    }

    if (data.last_name) {
        updates.push(`last_name = $${values.length + 1}`)
        values.push(data.last_name)
    }

    if (data.company_name) {
        updates.push(`company_name = $${values.length + 1}`)
        values.push(data.company_name)
    }

    if (data.phone) {
        updates.push(`phone = $${values.length + 1}`)
        values.push(data.phone)
    }

    if (updates.length === 0) return null

    query +=
        " " +
        updates.join(", ") +
        ` WHERE id = $${values.length + 1} RETURNING id, email, first_name, last_name, company_name, phone, role, email_verified, created_at`
    values.push(userId)

    const result = await sql.query(query, values)
    return result.length > 0 ? result[0] : null
}

// Deactivate user (soft delete)
export async function deactivateUser(userId: number) {
    // We can add an 'active' column or use a soft delete approach
    // For now, we'll use a simple approach - you can extend this later
    const result = await sql`
    UPDATE users
    SET role = 'inactivo'
    WHERE id = ${userId}
    RETURNING id, email, first_name, last_name, company_name, phone, role, email_verified, created_at
  `

    return result.length > 0 ? result[0] : null
}
