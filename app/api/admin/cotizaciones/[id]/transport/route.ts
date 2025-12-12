
import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, requireAdmin } from "@/lib/api-auth"
import { addTransportUpdate } from "@/lib/quotes"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { session, error } = await verifyToken(request)
    if (error) return error

    const adminError = requireAdmin(session)
    if (adminError) return adminError

    try {
        const { id } = await params
        const body = await request.json()

        const updated = await addTransportUpdate(id, body)
        return NextResponse.json(updated, { status: 201 })

    } catch (err) {
        console.error("Error adding transport update:", err)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
