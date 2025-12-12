
import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/api-auth"
import { markAsRead } from "@/lib/notifications"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { session, error } = await verifyToken(request)
    if (error) return error

    try {
        const { id } = await params
        await markAsRead(id)
        return NextResponse.json({ success: true })
    } catch (err) {
        return NextResponse.json({ error: "Error updating notification" }, { status: 500 })
    }
}
