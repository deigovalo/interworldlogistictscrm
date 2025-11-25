"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"

interface QuoteItem {
  producto: string
  precio: number
  cantidad: number
}

export default function CreateQuoteModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [items, setItems] = useState<QuoteItem[]>([{ producto: "", precio: 0, cantidad: 1 }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items]
    if (field === "producto") {
      newItems[index][field] = value
    } else {
      newItems[index][field] = Number(value)
    }
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { producto: "", precio: 0, cantidad: 1 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al crear cotización")
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva Cotización</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium">Producto</label>
                  <Input
                    value={item.producto}
                    onChange={(e) => handleItemChange(index, "producto", e.target.value)}
                    placeholder="Nombre del producto"
                    required
                  />
                </div>
                <div className="w-24">
                  <label className="text-sm font-medium">Precio</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.precio}
                    onChange={(e) => handleItemChange(index, "precio", e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="w-20">
                  <label className="text-sm font-medium">Cantidad</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.cantidad}
                    onChange={(e) => handleItemChange(index, "cantidad", e.target.value)}
                    placeholder="1"
                    required
                  />
                </div>
                <div className="w-24 text-right">
                  <p className="text-sm font-medium text-muted-foreground">Subtotal</p>
                  <p className="font-semibold">${(item.precio * item.cantidad).toFixed(2)}</p>
                </div>
                {items.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addItem} className="w-full bg-transparent">
            Agregar Producto
          </Button>

          <div className="bg-slate-50 p-3 rounded flex justify-between items-center">
            <span className="font-semibold">Total:</span>
            <span className="text-2xl font-bold">${total.toFixed(2)}</span>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || items.length === 0}>
              {loading ? "Creando..." : "Crear Cotización"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
