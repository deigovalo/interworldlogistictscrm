import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, requireAdmin } from "@/lib/api-auth"
import { getAdminStatistics } from "@/lib/statistics"

export async function GET(request: NextRequest) {
  const { session, error } = await verifyToken(request)
  if (error) return error

  const adminError = requireAdmin(session)
  if (adminError) return adminError

  try {
    const stats = await getAdminStatistics()
    return NextResponse.json(stats)
  } catch (err) {
    console.error("Error fetching admin statistics:", err)
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
  }
}
