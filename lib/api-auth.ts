import { type NextRequest, NextResponse } from "next/server"
import { getSessionByToken } from "./auth"

export async function verifyToken(request: NextRequest) {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
        return { session: null, error: NextResponse.json({ error: "Token requerido" }, { status: 401 }) }
    }

    const session = await getSessionByToken(token)
    if (!session) {
        return { session: null, error: NextResponse.json({ error: "Token inválido" }, { status: 401 }) }
    }

    return { session, error: null }
}

export function requireAdmin(session: any) {
    if (session.role !== "admin") {
        return NextResponse.json({ error: "Acceso denegado: requiere permisos de admin" }, { status: 403 })
    }
    return null
}
