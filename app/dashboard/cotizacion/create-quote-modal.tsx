"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateQuoteModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    origen: "",
    destino: "",
    tipo_servicio: "Importación",
    peso: "",
    volumen: "",
    tipo_carga: "",
    descripcion: ""
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
        body: JSON.stringify(formData),
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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Cotización</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Origen</Label>
              <Input
                value={formData.origen}
                onChange={e => handleChange('origen', e.target.value)}
                required
                placeholder="País/Ciudad origen"
              />
            </div>
            <div className="space-y-2">
              <Label>Destino</Label>
              <Input
                value={formData.destino}
                onChange={e => handleChange('destino', e.target.value)}
                required
                placeholder="País/Ciudad destino"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Servicio</Label>
            <Select value={formData.tipo_servicio} onValueChange={(val) => handleChange('tipo_servicio', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Importación">Importación</SelectItem>
                <SelectItem value="Aduanas">Agente de Aduanas</SelectItem>
                <SelectItem value="Carga">Carga Internacional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.peso}
                onChange={e => handleChange('peso', e.target.value)}
                required
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Volumen (m³)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.volumen}
                onChange={e => handleChange('volumen', e.target.value)}
                required
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Carga</Label>
            <Input
              value={formData.tipo_carga}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('tipo_carga', e.target.value)}
              required
              placeholder="Ej: General, Peligrosa, Perecible"
            />
          </div>

          <div className="space-y-2">
            <Label>Descripción Adicional</Label>
            <Textarea
              value={formData.descripcion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('descripcion', e.target.value)}
              placeholder="Detalles adicionales..."
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
