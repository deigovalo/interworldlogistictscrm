
import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/api-auth"
import { getQuoteDetails, respondToQuote, acceptQuote } from "@/lib/quotes"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { session, error } = await verifyToken(request)
    if (error) return error

    try {
        const { id } = await params
        const quote = await getQuoteDetails(Number(id))

        if (!quote) {
            return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 })
        }

        const quoteData = quote as any
        // Authorization check: User owns it OR User is Admin
        if (session.role !== 'admin' && quoteData.user_id !== session.user_id) {
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

        if (action === 'respond') {
            if (session.role !== 'admin') {
                return NextResponse.json({ error: "Solo admin puede responder" }, { status: 403 })
            }
            const { monto, mensaje } = body
            const updated = await respondToQuote(Number(id), monto, mensaje)
            return NextResponse.json(updated)
        }
        else if (action === 'accept') {
            // Verify ownership
            const quote = await getQuoteDetails(Number(id))
            const quoteData = quote as any
            if (!quote || quoteData.user_id !== session.user_id) {
                return NextResponse.json({ error: "No autorizado" }, { status: 403 })
            }
            const updated = await acceptQuote(Number(id))
            return NextResponse.json(updated)
        }

        return NextResponse.json({ error: "Acción inválida" }, { status: 400 })

    } catch (err) {
        console.error("Error updating quote:", err)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
