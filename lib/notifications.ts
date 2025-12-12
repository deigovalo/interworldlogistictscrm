
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface Notification {
  id: string
  user_id: number
  title: string
  message: string
  link?: string
  read: boolean
  created_at: Date
}

export async function createNotification(
  userId: number,
  title: string,
  message: string,
  link?: string
) {
  const result = await sql`
    INSERT INTO notifications (user_id, title, message, link)
    VALUES (${userId}, ${title}, ${message}, ${link || null})
    RETURNING *
  `
  return result[0]
}

export async function getUserNotifications(userId: number) {
  const result = await sql`
    SELECT * FROM notifications
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `
  return result
}

export async function markAsRead(notificationId: string) {
  const result = await sql`
    UPDATE notifications
    SET read = TRUE
    WHERE id = ${notificationId}
    RETURNING *
  `
  return result[0]
}

export async function markAllAsRead(userId: number) {
  const result = await sql`
      UPDATE notifications
      SET read = TRUE
      WHERE user_id = ${userId}
    `
  return result
}
