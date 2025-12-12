import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Update Quote Interface for UUID and User Details
export interface Cotizacion {
    id: string
    user_id: number
    numero_cotizacion: string
    estado: "pendiente" | "respondido" | "aprobado" | "desaprobado" | "transporte" | "finalizado"
    monto_total: number | null
    descripcion: string | null
    origen?: string
    destino?: string
    tipo_servicio?: string
    peso?: number
    volumen?: number
    tipo_carga?: string
    mensaje_admin?: string
    fecha_aceptacion?: Date
    fecha: Date
    created_at: Date
    updated_at: Date
    // User Details (Joined)
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    company_name?: string
}

export interface TransportUpdate {
    id: number
    cotizacion_id: string
    estado: string
    descripcion: string | null
    ubicacion: string | null
    fecha: Date
    created_at: Date
}

export interface CotizacionItem {
    id: number
    cotizacion_id: string
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

// Create a new quote request
export async function createQuote(
    userId: number,
    data: {
        origen: string
        destino: string
        tipo_servicio: string
        peso: number
        volumen: number
        tipo_carga: string
        descripcion?: string
    }
) {
    const numero_cotizacion = generateQuoteNumber()
    // Monto inicial es null y estado pendiente

    const quoteResult = await sql`
    INSERT INTO cotizaciones (
        user_id, numero_cotizacion, estado, 
        origen, destino, tipo_servicio, peso, volumen, tipo_carga, descripcion
    )
    VALUES (
        ${userId}, ${numero_cotizacion}, ${"pendiente"}, 
        ${data.origen}, ${data.destino}, ${data.tipo_servicio}, ${data.peso}, ${data.volumen}, ${data.tipo_carga}, ${data.descripcion || null}
    )
    RETURNING *
  `
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
    return result as any
}

// Get quote details with Full User Info
export async function getQuoteDetails(quoteId: string) {
    const quote = await sql`
    SELECT c.*, u.first_name, u.last_name, u.email, u.phone, u.company_name
    FROM cotizaciones c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ${quoteId}
  `

    if (quote.length === 0) return null

    // Get transport history if applicable
    const transportHistory = await sql`
        SELECT * FROM transport_updates 
        WHERE cotizacion_id = ${quoteId} 
        ORDER BY fecha DESC
    `

    return { ...quote[0], transport_history: transportHistory }
}

// Get all quotes (admin)
export async function getAllQuotes(filters?: { estado?: string; search?: string }) {
    let query =
        "SELECT c.id, c.user_id, c.numero_cotizacion, c.estado, c.monto_total, c.fecha, c.created_at, c.updated_at, u.email, u.first_name, u.last_name, u.company_name, u.status as user_status FROM cotizaciones c JOIN users u ON c.user_id = u.id WHERE 1=1"

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
export async function updateQuoteStatus(quoteId: string, estado: string) {
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

// Admin responds to quote with price and message
import { createNotification } from "./notifications"

export async function respondToQuote(quoteId: string, monto: number, mensaje: string) {
    const result = await sql`
        UPDATE cotizaciones
        SET monto_total = ${monto}, mensaje_admin = ${mensaje}, estado = 'respondido', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${quoteId}
        RETURNING *
    `
    const quote = result[0]
    if (quote) {
        await createNotification(
            quote.user_id,
            "Cotización Respondida",
            `Tu cotización ${quote.numero_cotizacion} ha sido respondida.`,
            `/dashboard/cotizacion/${quoteId}`
        )
    }
    return quote
}

// Client accepts quote
export async function acceptQuote(quoteId: string) {
    const result = await sql`
        UPDATE cotizaciones
        SET estado = 'transporte', fecha_aceptacion = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${quoteId}
        RETURNING *
    `
    const quote = result[0]
    // Notify Adimns (assuming admin ID is 1 for now, or broadcast. For MVP, maybe skip or notify a fixed ID?)
    // Ideally we should find all admins. For now, let's just update the DB. 
    // real-time notifications might require websockets or polling.
    return quote
}

// Add transport update
export async function addTransportUpdate(
    quoteId: string,
    data: { estado: string; descripcion?: string; ubicacion?: string }
) {
    const result = await sql`
        INSERT INTO transport_updates (cotizacion_id, estado, descripcion, ubicacion)
        VALUES (${quoteId}, ${data.estado}, ${data.descripcion || null}, ${data.ubicacion || null})
        RETURNING *
    `

    // Notify Client
    // Need to fetch quote first to get user_id
    const quote = await sql`SELECT user_id, numero_cotizacion FROM cotizaciones WHERE id = ${quoteId}`
    if (quote.length > 0) {
        await createNotification(
            quote[0].user_id,
            "Actualización de Transporte",
            `Nuevo estado: ${data.estado} - ${quote[0].numero_cotizacion}`,
            `/dashboard/cotizacion/${quoteId}`
        )
    }

    return result[0]
}

// Get transport history
export async function getTransportHistory(quoteId: string) {
    const result = await sql`
        SELECT * FROM transport_updates 
        WHERE cotizacion_id = ${quoteId}
        ORDER BY fecha DESC
    `
    return result
}
