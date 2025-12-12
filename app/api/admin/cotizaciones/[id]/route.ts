import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, requireAdmin } from "@/lib/api-auth"
import { updateQuoteStatusSchema } from "@/lib/validation"
import { getQuoteDetails, updateQuoteStatus, respondToQuote } from "@/lib/quotes"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, error } = await verifyToken(request)
  if (error) return error

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  try {
    const quoteId = id
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
    const quoteId = id

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

export async function PATCH(
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
    const { action } = body

    if (action === 'respond') {
      const { monto, mensaje } = body
      const updated = await respondToQuote(id, monto, mensaje)
      return NextResponse.json(updated)
    }

    if (action === 'complete_transport') {
      // Set to 'finalizado'
      const updated = await updateQuoteStatus(id, 'finalizado')
      // Optional: Add transport history entry
      const { addTransportUpdate } = await import("@/lib/quotes")
      await addTransportUpdate(id, {
        estado: 'Transporte Finalizado',
        descripcion: 'El administrador ha cerrado el proceso de transporte.'
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: "Acción inválida" }, { status: 400 })

  } catch (err) {
    console.error("Error updating quote:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
