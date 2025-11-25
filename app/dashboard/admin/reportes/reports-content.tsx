"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { ReportsStatCard } from "./reports-components"
import { RevenueChart } from "./revenue-chart"
import { TopClientsCard } from "./top-clients-card"
import { StatusDistributionChart } from "./status-distribution-chart"
import { DollarSign, FileText, CheckCircle, TrendingUp, Users } from "lucide-react"

interface ReportsData {
  totalRevenue: number
  totalQuotes: number
  approvalPercentage: number
  monthlyRevenue: Array<{ month: string; revenue: number }>
  topClients: Array<{ id: number; name: string; company: string; status: string; totalRevenue: number; quoteCount: number }>
  quoteStatusDistribution: Array<{ status: string; count: number }>
}

export default function ReportsContent() {
  const { user, token, loading } = useAuth()
  const [reports, setReports] = useState<ReportsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loading || !token) return

    const fetchReports = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/dashboard/admin-reports", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Error al obtener reportes")
        }

        const data = await response.json()
        setReports(data)
        setError(null)
      } catch (err) {
        console.error("[v0] Error fetching reports:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [token, loading])

  if (loading) {
    return <div className="text-center py-8">Cargando autenticación...</div>
  }

  if (!user || user.role !== "admin") {
    return <div className="text-center py-8 text-red-500">Acceso denegado</div>
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando reportes...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  if (!reports) {
    return <div className="text-center py-8">No hay datos disponibles</div>
  }

  // Calculate trends (mocked or simple calculation)
  const currentMonthRevenue = reports.monthlyRevenue[0]?.revenue || 0
  const previousMonthRevenue = reports.monthlyRevenue[1]?.revenue || 0
  const revenueTrend = previousMonthRevenue > 0
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
    : 0

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportsStatCard
          title="Ingresos Totales"
          value={`$${reports.totalRevenue.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`}
          description="De cotizaciones aprobadas"
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <ReportsStatCard
          title="Total de Cotizaciones"
          value={reports.totalQuotes}
          description="Todas las cotizaciones"
          icon={<FileText className="w-6 h-6" />}
          color="purple"
        />
        <ReportsStatCard
          title="% Aprobación"
          value={`${reports.approvalPercentage}%`}
          description="Tasa de aprobación"
          icon={<CheckCircle className="w-6 h-6" />}
          color="orange"
        />
        <ReportsStatCard
          title="Ingresos Este Mes"
          value={`$${currentMonthRevenue.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`}
          description="Mes actual"
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistributionChart data={reports.quoteStatusDistribution} />
        <RevenueChart data={reports.monthlyRevenue} />
      </div>

      {/* Top Clients Table */}
      <div className="w-full">
        <TopClientsCard data={reports.topClients} />
      </div>
    </div>
  )
}
