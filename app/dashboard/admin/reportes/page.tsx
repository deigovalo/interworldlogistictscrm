"use client"


import { Suspense } from "react"
import ReportsContent from "./reports-content"

export default function ReportsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground mt-2">Análisis y estadísticas de cotizaciones</p>
      </div>

      <Suspense fallback={<div className="text-center py-8">Cargando reportes...</div>}>
        <ReportsContent />
      </Suspense>
    </>
  )
}
