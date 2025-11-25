import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/api-auth"
import { getUserStatistics } from "@/lib/statistics"

export async function GET(request: NextRequest) {
  const { session, error } = await verifyToken(request)
  if (error) return error

  try {
    const stats = await getUserStatistics(session.user_id)
    return NextResponse.json(stats)
  } catch (err) {
    console.error("Error fetching user statistics:", err)
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
  }
}
