"use client"

import { useAuth } from "@/hooks/use-auth"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminStatsView } from "./admin-stats-view"
import { UserStatsView } from "./user-stats-view"

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user.first_name}!</h1>
        <p className="text-muted-foreground">Este es tu panel de control personal</p>
      </div>


      {user.role === "admin" ? <AdminStatsView /> : <UserStatsView />}
    </div>
  )
}
