import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, requireAdmin } from "@/lib/api-auth"
import { getAdminReports } from "@/lib/statistics"

export async function GET(request: NextRequest) {
  try {
    const { session, error } = await verifyToken(request)
    if (error) return error

    const adminError = requireAdmin(session)
    if (adminError) return adminError

    const reports = await getAdminReports()
    return NextResponse.json(reports)
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener reportes" }, { status: 500 })
  }
}
