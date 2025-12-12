
import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/api-auth"
import { getUserNotifications } from "@/lib/notifications"

export async function GET(request: NextRequest) {
    const { session, error } = await verifyToken(request)
    if (error) return error

    try {
        const notifications = await getUserNotifications(session.user_id)
        return NextResponse.json(notifications)
    } catch (err) {
        return NextResponse.json({ error: "Error fetching notifications" }, { status: 500 })
    }
}
