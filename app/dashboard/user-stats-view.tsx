"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { ReportsStatCard } from "./admin/reportes/reports-components"
import { FileText, Clock, CheckCircle } from "lucide-react"

interface UserStats {
  totalQuotes: number
  pendingQuotes: number
  approvedQuotes: number
}

export function UserStatsView() {
  const { token, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
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
        const response = await fetch("/api/dashboard/user-stats", {
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
      <div className="grid gap-6 md:grid-cols-3">
        <ReportsStatCard
          title="Total de Cotizaciones"
          value={stats.totalQuotes}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
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
      </div>
    </div>
  )
}
