import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, requireAdmin } from "@/lib/api-auth"
import { getAllQuotes } from "@/lib/quotes"

export async function GET(request: NextRequest) {
  const { session, error } = await verifyToken(request)
  if (error) return error

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  try {
    const url = new URL(request.url)
    const search = url.searchParams.get("search") || undefined
    const estado = url.searchParams.get("estado")
    const estadoFilter = estado && estado !== "all" ? estado : undefined

    const quotes = await getAllQuotes({ search, estado: estadoFilter })
    return NextResponse.json(quotes)
  } catch (err) {
    console.error("Error fetching quotes:", err)
    return NextResponse.json({ error: "Error al obtener cotizaciones" }, { status: 500 })
  }
}
