import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/api-auth"
import { getQuoteDetails, acceptQuote } from "@/lib/quotes"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { session, error } = await verifyToken(request)
    if (error) return error

    try {
        const { id } = await params
        const quote = await getQuoteDetails(id)

        if (!quote) {
            return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 })
        }

        const quoteData = quote as any
        // Authorization check: User owns it
        if (quoteData.user_id !== session.user_id) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 })
        }

        return NextResponse.json(quote)
    } catch (err) {
        console.error("Error fetching quote details:", err)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { session, error } = await verifyToken(request)
    if (error) return error

    try {
        const { id } = await params
        const body = await request.json()
        const { action } = body

        if (action === 'accept') {
            // Verify ownership
            const quote = await getQuoteDetails(id)
            const quoteData = quote as any
            if (!quote || quoteData.user_id !== session.user_id) {
                return NextResponse.json({ error: "No autorizado" }, { status: 403 })
            }
            const updated = await acceptQuote(id)
            return NextResponse.json(updated)
        }

        if (action === 'finish_transport') {
            // Verify ownership
            const quote = await getQuoteDetails(id)
            const quoteData = quote as any
            if (!quote || quoteData.user_id !== session.user_id) {
                return NextResponse.json({ error: "No autorizado" }, { status: 403 })
            }

            const { addTransportUpdate } = await import("@/lib/quotes")

            const updated = await addTransportUpdate(id, {
                estado: 'Transporte Completo',
                descripcion: 'El cliente ha confirmado la finalización del transporte.'
            })

            return NextResponse.json(updated)
        }

        return NextResponse.json({ error: "Acción inválida" }, { status: 400 })

    } catch (err) {
        console.error("Error updating quote:", err)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
