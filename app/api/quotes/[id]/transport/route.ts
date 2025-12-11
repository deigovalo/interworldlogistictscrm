
import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/api-auth"
import { addTransportUpdate } from "@/lib/quotes"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { session, error } = await verifyToken(request)
    if (error) return error

    if (session.role !== 'admin') {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    try {
        const { id } = await params
        const body = await request.json()
        const { estado, descripcion, ubicacion } = body

        const updated = await addTransportUpdate(Number(id), { estado, descripcion, ubicacion })
        return NextResponse.json(updated, { status: 201 })

    } catch (err) {
        console.error("Error adding transport update:", err)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
