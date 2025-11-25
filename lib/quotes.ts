import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface Cotizacion {
    id: number
    user_id: number
    numero_cotizacion: string
    estado: "pendiente" | "aprobado" | "desaprobado"
    monto_total: number
    descripcion: string | null
    fecha: Date
    created_at: Date
    updated_at: Date
}

export interface CotizacionItem {
    id: number
    cotizacion_id: number
    producto: string
    precio: number
    cantidad: number
    subtotal: number
}

// Generate unique quote number
function generateQuoteNumber(): string {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
    return `COT-${timestamp}-${random}`
}

// Create a new quote with items
export async function createQuote(
    userId: number,
    items: Array<{ producto: string; precio: number; cantidad: number }>,
) {
    const numero_cotizacion = generateQuoteNumber()
    const monto_total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

    // Insert quote
    const quoteResult = await sql`
    INSERT INTO cotizaciones (user_id, numero_cotizacion, estado, monto_total)
    VALUES (${userId}, ${numero_cotizacion}, ${"pendiente"}, ${monto_total})
    RETURNING id, user_id, numero_cotizacion, estado, monto_total, fecha, created_at, updated_at
  `

    const cotizacion_id = quoteResult[0].id

    // Insert items
    for (const item of items) {
        const subtotal = item.precio * item.cantidad
        await sql`
      INSERT INTO cotizacion_items (cotizacion_id, producto, precio, cantidad, subtotal)
      VALUES (${cotizacion_id}, ${item.producto}, ${item.precio}, ${item.cantidad}, ${subtotal})
    `
    }

    return quoteResult[0]
}

// Get user's quotes
export async function getUserQuotes(userId: number) {
    const result = await sql`
    SELECT id, user_id, numero_cotizacion, estado, monto_total, fecha, created_at, updated_at
    FROM cotizaciones
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `

    return result
}

// Get quote details with items
export async function getQuoteWithItems(quoteId: number) {
    const quote = await sql`
    SELECT id, user_id, numero_cotizacion, estado, monto_total, fecha, created_at, updated_at
    FROM cotizaciones
    WHERE id = ${quoteId}
  `

    if (quote.length === 0) return null

    const items = await sql`
    SELECT id, cotizacion_id, producto, precio, cantidad, subtotal
    FROM cotizacion_items
    WHERE cotizacion_id = ${quoteId}
  `

    return { ...quote[0], items }
}

// Get all quotes (admin)
export async function getAllQuotes(filters?: { estado?: string; search?: string }) {
    let query =
        "SELECT c.id, c.user_id, c.numero_cotizacion, c.estado, c.monto_total, c.fecha, c.created_at, c.updated_at, u.email, u.first_name, u.last_name, u.company_name FROM cotizaciones c JOIN users u ON c.user_id = u.id WHERE 1=1"

    if (filters?.estado) {
        query += ` AND c.estado = '${filters.estado}'`
    }

    if (filters?.search) {
        query += ` AND (c.numero_cotizacion ILIKE '%${filters.search}%' OR u.email ILIKE '%${filters.search}%')`
    }

    query += " ORDER BY c.created_at DESC"

    const result = await sql.query(query)
    return result
}

// Update quote status
export async function updateQuoteStatus(quoteId: number, estado: string) {
    const result = await sql`
    UPDATE cotizaciones
    SET estado = ${estado}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${quoteId}
    RETURNING id, user_id, numero_cotizacion, estado, monto_total, fecha, created_at, updated_at
  `

    return result.length > 0 ? result[0] : null
}

// Update quote (admin)
export async function updateQuote(
    quoteId: number,
    data: { estado?: string; items?: Array<{ producto: string; precio: number; cantidad: number }> },
) {
    let monto_total: number | undefined

    if (data.items) {
        // Delete old items
        await sql`DELETE FROM cotizacion_items WHERE cotizacion_id = ${quoteId}`

        // Calculate new total and insert new items
        monto_total = data.items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

        for (const item of data.items) {
            const subtotal = item.precio * item.cantidad
            await sql`
        INSERT INTO cotizacion_items (cotizacion_id, producto, precio, cantidad, subtotal)
        VALUES (${quoteId}, ${item.producto}, ${item.precio}, ${item.cantidad}, ${subtotal})
      `
        }
    }

    let updateQuery = "UPDATE cotizaciones SET updated_at = CURRENT_TIMESTAMP"
    const values: any[] = []

    if (data.estado) {
        updateQuery += `, estado = $${values.length + 1}`
        values.push(data.estado)
    }

    if (monto_total !== undefined) {
        updateQuery += `, monto_total = $${values.length + 1}`
        values.push(monto_total)
    }

    updateQuery += ` WHERE id = $${values.length + 1} RETURNING *`
    values.push(quoteId)

    const result = await sql.query(updateQuery, values)
    return result.length > 0 ? result[0] : null
}
