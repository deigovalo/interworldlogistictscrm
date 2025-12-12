import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/api-auth"
import { createQuoteSchema } from "@/lib/validation"
import { createQuote, getUserQuotes } from "@/lib/quotes"

export async function GET(request: NextRequest) {
    const { session, error } = await verifyToken(request)
    if (error) return error

    try {
        const quotes = await getUserQuotes(session.user_id)
        return NextResponse.json(quotes)
    } catch (err) {
        console.error("Error fetching quotes:", err)
        return NextResponse.json({ error: "Error al obtener cotizaciones" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const { session, error } = await verifyToken(request)
    if (error) return error

    try {
        const body = await request.json()
        const validatedData = createQuoteSchema.parse(body)

        const quote = await createQuote(session.user_id, validatedData)
        return NextResponse.json(quote, { status: 201 })
    } catch (err: any) {
        console.error("Error creating quote:", err)
        const message = err.errors ? err.errors[0].message : "Error al crear cotización"
        return NextResponse.json({ error: message }, { status: 400 })
    }
}
