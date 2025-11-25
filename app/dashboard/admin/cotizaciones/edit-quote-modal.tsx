"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface Quote {
  id: number
  numero_cotizacion: string
  estado: string
  monto_total: number
}

interface QuoteItem {
  id: number
  producto: string
  precio: number
  cantidad: number
  subtotal: number
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
  const [items, setItems] = useState<QuoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchQuoteDetails()
  }, [quote.id])

  async function fetchQuoteDetails() {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/admin/cotizaciones/${quote.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      }
    } catch (err) {
      console.error("Error fetching quote details:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const token = localStorage.getItem("auth_token")
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

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cargando detalles...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // CORRECCIÓN: Usamos Number() para asegurar suma numérica y evitar concatenación de strings
  const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Cotización {quote.numero_cotizacion}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}

          <div>
            <Label>Productos</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-2 border-b">
                  <div>
                    <p className="font-medium">{item.producto}</p>
                    <p className="text-muted-foreground">
                      ${item.precio} x {item.cantidad}
                    </p>
                  </div>
                  <p className="font-semibold">${item.subtotal}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded flex justify-between">
            <span className="font-semibold">Total:</span>
            {/* toFixed(2) para asegurar formato de moneda */}
            <span className="text-xl font-bold">${total.toFixed(2)}</span>
          </div>

          <div>
            <Label>Estado</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="desaprobado">Desaprobado</SelectItem>
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