import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, requireAdmin } from "@/lib/api-auth"
import { updateQuoteStatusSchema } from "@/lib/validation"
import { getQuoteDetails, updateQuoteStatus } from "@/lib/quotes"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, error } = await verifyToken(request)
  if (error) return error

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  try {
    const quoteId = Number.parseInt(id)
    const quote = await getQuoteDetails(quoteId)

    if (!quote) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 })
    }

    return NextResponse.json(quote)
  } catch (err) {
    console.error("Error fetching quote:", err)
    return NextResponse.json({ error: "Error al obtener cotización" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, error } = await verifyToken(request)
  if (error) return error

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  try {
    const body = await request.json()
    const validatedData = updateQuoteStatusSchema.parse(body)
    const quoteId = Number.parseInt(id)

    const quote = await updateQuoteStatus(quoteId, validatedData.estado)

    if (!quote) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 })
    }

    return NextResponse.json(quote)
  } catch (err: any) {
    console.error("Error updating quote:", err)
    const message = err.errors ? err.errors[0].message : "Error al actualizar cotización"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
