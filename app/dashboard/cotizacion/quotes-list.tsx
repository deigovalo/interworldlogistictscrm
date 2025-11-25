"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Quote {
  id: number
  numero_cotizacion: string
  estado: string
  monto_total: number
  fecha: string
}

export default function QuotesList({ refreshTrigger }: { refreshTrigger: number }) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuotes()
  }, [refreshTrigger])

  async function fetchQuotes() {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/quotes", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setQuotes(data)
      }
    } catch (error) {
      console.error("Error fetching quotes:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (estado: string) => {
    const variants: Record<string, string> = {
      pendiente: "bg-yellow-100 text-yellow-800",
      aprobado: "bg-green-100 text-green-800",
      desaprobado: "bg-red-100 text-red-800",
    }
    return variants[estado] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return <div className="text-center py-8">Cargando cotizaciones...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Cotizaciones</CardTitle>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No tienes cotizaciones. Crea una nueva.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Monto Total</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.numero_cotizacion}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(quote.estado)}>{quote.estado}</Badge>
                  </TableCell>
                  <TableCell>${quote.monto_total}</TableCell>
                  <TableCell>{new Date(quote.fecha).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
