import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Admin Statistics
export async function getAdminStatistics() {
  try {
    const totalQuotesResult = await sql`
      SELECT COUNT(*) as count FROM cotizaciones
    `

    const totalUsersResult = await sql`
      SELECT COUNT(*) as count FROM users WHERE role = 'usuario'
    `

    const pendingQuotesResult = await sql`
      SELECT COUNT(*) as count FROM cotizaciones WHERE estado = 'pendiente'
    `

    const approvedQuotesResult = await sql`
      SELECT COUNT(*) as count FROM cotizaciones WHERE estado = 'aprobado'
    `

    const currentMonthQuotesResult = await sql`
      SELECT COUNT(*) as count FROM cotizaciones 
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
    `

    const quoteStatusResult = await sql`
      SELECT estado, COUNT(*) as count FROM cotizaciones GROUP BY estado
    `

    return {
      totalQuotes: Number(totalQuotesResult[0]?.count || 0),
      totalUsers: Number(totalUsersResult[0]?.count || 0),
      pendingQuotes: Number(pendingQuotesResult[0]?.count || 0),
      approvedQuotes: Number(approvedQuotesResult[0]?.count || 0),
      monthlyQuotes: Number(currentMonthQuotesResult[0]?.count || 0),
      quotesByStatus: quoteStatusResult.map((row: any) => ({
        status: row.estado,
        count: Number(row.count),
      })),
    }
  } catch (error) {
    console.error("Error fetching admin statistics:", error)
    throw error
  }
}

// User Statistics
export async function getUserStatistics(userId: number) {
  try {
    const totalQuotesResult = await sql`
      SELECT COUNT(*) as count FROM cotizaciones WHERE user_id = ${userId}
    `

    const pendingQuotesResult = await sql`
      SELECT COUNT(*) as count FROM cotizaciones WHERE user_id = ${userId} AND estado = 'pendiente'
    `

    const completedQuotesResult = await sql`
      SELECT COUNT(*) as count FROM cotizaciones WHERE user_id = ${userId} AND estado = 'finalizado'
    `

    const transportQuotesResult = await sql`
      SELECT COUNT(*) as count FROM cotizaciones WHERE user_id = ${userId} AND estado = 'transporte'
    `

    return {
      totalQuotes: Number(totalQuotesResult[0]?.count || 0),
      pendingQuotes: Number(pendingQuotesResult[0]?.count || 0),
      completedQuotes: Number(completedQuotesResult[0]?.count || 0),
      transportQuotes: Number(transportQuotesResult[0]?.count || 0),
    }
  } catch (error) {
    console.error("Error fetching user statistics:", error)
    throw error
  }
}

// Admin Reports Statistics
export async function getAdminReports() {
  try {
    // Total revenue (sum of all quotes monto_total)
    // Considering 'aprobado', 'transporte', 'finalizado' as revenue-generating statuses
    const totalRevenueResult = await sql`
      SELECT COALESCE(SUM(monto_total), 0) as total 
      FROM cotizaciones 
      WHERE estado IN ('aprobado', 'transporte', 'finalizado')
    `

    // Total quotes
    const totalQuotesResult = await sql`
      SELECT COUNT(*) as count FROM cotizaciones
    `

    // Approval percentage (respondido -> aprobado ratio, or total -> aprobado)
    const approvalStatsResult = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado IN ('aprobado', 'transporte', 'finalizado') THEN 1 END) as approved
      FROM cotizaciones
    `

    // Monthly revenue
    const monthlyRevenueResult = await sql`
      SELECT 
        DATE_TRUNC('month', created_at)::date as month,
        COALESCE(SUM(monto_total), 0) as revenue
      FROM cotizaciones
      WHERE estado IN ('aprobado', 'transporte', 'finalizado')
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12
    `

    // Top 5 clients by revenue
    // Even if status is not final, showing potential value or recently active clients is better than empty.
    // However, for "Top Clients" by *revenue*, we should stick to "won" deals.
    // If no won deals, we can fall back to quote count or potential value? 
    // Let's stick to won deals (aprobado+) but include all relevant statuses.
    const topClientsResult = await sql`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.company_name,
        u.status,
        COALESCE(SUM(c.monto_total), 0) as total_revenue,
        COUNT(c.id) as quote_count
      FROM users u
      LEFT JOIN cotizaciones c ON u.id = c.user_id AND c.estado IN ('aprobado', 'transporte', 'finalizado')
      WHERE u.role = 'usuario'
      GROUP BY u.id
      ORDER BY total_revenue DESC
      LIMIT 5
    `

    // Quote status distribution
    const quoteStatusDistResult = await sql`
      SELECT 
        estado,
        COUNT(*) as count
      FROM cotizaciones
      GROUP BY estado
    `

    const approvalStats = approvalStatsResult[0]
    const approvalPercentage =
      approvalStats.total > 0 ? Math.round((Number(approvalStats.approved) / Number(approvalStats.total)) * 100) : 0

    return {
      totalRevenue: Number(totalRevenueResult[0]?.total || 0),
      totalQuotes: Number(totalQuotesResult[0]?.count || 0),
      approvalPercentage,
      monthlyRevenue: monthlyRevenueResult.map((row: any) => ({
        month: new Date(row.month).toLocaleDateString("es-ES", { month: "short", year: "2-digit" }),
        revenue: Number(row.revenue),
      })),
      topClients: topClientsResult.map((row: any) => ({
        id: row.id,
        name: `${row.first_name} ${row.last_name}`,
        company: row.company_name,
        status: row.status,
        totalRevenue: Number(row.total_revenue),
        quoteCount: Number(row.quote_count),
      })),
      quoteStatusDistribution: quoteStatusDistResult.map((row: any) => ({
        status: row.estado,
        count: Number(row.count),
      })),
    }
  } catch (error) {
    console.error("Error fetching admin reports:", error)
    throw error
  }
}
