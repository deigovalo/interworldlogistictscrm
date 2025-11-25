import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, requireAdmin } from "@/lib/api-auth"
import { updateUserSchema } from "@/lib/validation"
import { updateUserAdmin, deactivateUser } from "@/lib/admin"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, error } = await verifyToken(request)
  if (error) return error

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  try {
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)
    const userId = Number.parseInt(id)

    const user = await updateUserAdmin(userId, validatedData)
    return NextResponse.json(user)
  } catch (err: any) {
    console.error("Error updating user:", err)
    const message = err.errors ? err.errors[0].message : "Error al actualizar usuario"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, error } = await verifyToken(request)
  if (error) return error

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  try {
    const userId = Number.parseInt(id)
    await deactivateUser(userId)
    return NextResponse.json({ message: "Usuario desactivado" })
  } catch (err) {
    console.error("Error deactivating user:", err)
    return NextResponse.json({ error: "Error al desactivar usuario" }, { status: 500 })
  }
}
