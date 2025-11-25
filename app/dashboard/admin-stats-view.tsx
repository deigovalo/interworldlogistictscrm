"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { ReportsStatCard } from "./admin/reportes/reports-components"
import { UsersListView } from "./users-list-view"
import { FileText, Users, Clock, CheckCircle, Calendar } from "lucide-react"

interface AdminStats {
  totalQuotes: number
  totalUsers: number
  pendingQuotes: number
  approvedQuotes: number
  monthlyQuotes: number
  quotesByStatus: Array<{ status: string; count: number }>
}

export function AdminStatsView() {
  const { token, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !token) {
      if (!authLoading && !token) {
        setLoading(false)
      }
      return
    }

    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/admin-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Error al obtener estadísticas")
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [token, authLoading])

  if (authLoading) return <div>Cargando autenticación...</div>
  if (loading) return <div>Cargando estadísticas...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!stats) return <div>No hay datos disponibles</div>

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <ReportsStatCard
          title="Total de Cotizaciones"
          value={stats.totalQuotes}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
        />
        <ReportsStatCard
          title="Total de Usuarios"
          value={stats.totalUsers}
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />
        <ReportsStatCard
          title="Cotizaciones Pendientes"
          value={stats.pendingQuotes}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
        />
        <ReportsStatCard
          title="Cotizaciones Aprobadas"
          value={stats.approvedQuotes}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
        <ReportsStatCard
          title="Cotizaciones Este Mes"
          value={stats.monthlyQuotes}
          icon={<Calendar className="w-6 h-6" />}
          color="blue"
        />
      </div>

      {token && <UsersListView token={token} />}
    </div>
  )
}
