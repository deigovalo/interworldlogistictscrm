import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, requireAdmin } from "@/lib/api-auth"
import { createUserAdminSchema } from "@/lib/validation"
import { createUserAdmin, getAllUsers } from "@/lib/admin"

export async function GET(request: NextRequest) {
  const { session, error } = await verifyToken(request)
  if (error) return error

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  try {
    const url = new URL(request.url)
    const search = url.searchParams.get("search") || undefined
    const role = url.searchParams.get("role") || undefined

    const users = await getAllUsers({ search, role })
    return NextResponse.json(users)
  } catch (err) {
    console.error("Error fetching users:", err)
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { session, error } = await verifyToken(request)
  if (error) return error

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  try {
    const body = await request.json()
    const validatedData = createUserAdminSchema.parse(body)

    const user = await createUserAdmin(validatedData)
    return NextResponse.json(user, { status: 201 })
  } catch (err: any) {
    console.error("Error creating user:", err)
    const message = err.errors ? err.errors[0].message : "Error al crear usuario"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
