"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Quote {
  id: number
  numero_cotizacion: string
  estado: string
  monto_total: number | null
}

export default function EditQuoteModal({
  quote,
  onClose,
  onSuccess,
}: {
  quote: Quote
  onClose: () => void
  onSuccess: () => void
}) {
  const [estado, setEstado] = useState(quote.estado)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const token = localStorage.getItem("auth_token")
      // Using the action endpoint or status update endpoint
      // Assuming we just want to update status. 
      // Existing API /api/admin/cotizaciones/[id] likely supports status update via PUT?
      // Or we can use the new /api/quotes/[id] PATCH if we want.
      // Let's try the existing one used in this file before.
      const response = await fetch(`/api/admin/cotizaciones/${quote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al actualizar cotización")
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Estado Cotización {quote.numero_cotizacion}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}

          <div>
            <p className="text-sm font-medium">Monto Actual:</p>
            <p className="text-lg font-bold">{quote.monto_total ? `$${quote.monto_total.toFixed(2)}` : 'Pendiente'}</p>
          </div>

          <div>
            <Label>Estado</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="respondido">Respondido</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="desaprobado">Desaprobado</SelectItem>
                <SelectItem value="transporte">Transporte</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}