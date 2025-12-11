"use client"

import { useEffect, useState, Dispatch, SetStateAction } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Eye } from "lucide-react"
import Link from "next/link"
import EditQuoteModal from "./edit-quote-modal"

interface Quote {
  id: number
  numero_cotizacion: string
  estado: string
  monto_total: number | null
  fecha: string
  email: string
  first_name: string
  last_name: string
  company_name: string
  created_at: string
}

// Helper function to format date
function formatDate(dateString: string) {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleString('es-ES', { month: 'short' })
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'pm' : 'am'
  const formattedHours = hours % 12 || 12

  return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`
}

// Helper function to get initials
function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// Helper function to get random color
function getAvatarColor(id: number) {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ]
  return colors[id % colors.length]
}

export default function QuotesList({
  searchTerm,
  statusFilter,
  refreshTrigger,
  setRefreshTrigger,
}: {
  searchTerm: string
  statusFilter: string
  refreshTrigger: number
  setRefreshTrigger: Dispatch<SetStateAction<number>>
}) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)

  useEffect(() => {
    fetchQuotes()
  }, [searchTerm, statusFilter, refreshTrigger])

  async function fetchQuotes() {
    try {
      const token = localStorage.getItem("auth_token")
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter) params.append("estado", statusFilter)

      const response = await fetch(`/api/admin/cotizaciones?${params}`, {
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
    const statusConfig: Record<string, { className: string; label: string }> = {
      pendiente: { className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Pendiente" },
      aprobado: { className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Aprobado" },
      desaprobado: { className: "bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400", label: "Desaprobado" },
    }
    return statusConfig[estado] || { className: "bg-gray-100 text-gray-700", label: estado }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando cotizaciones...</div>
  }

  return (
    <>
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {quotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay cotizaciones registradas</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Usuario</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Empresa</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Número</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fecha</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Monto Total</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => {
                  const statusInfo = getStatusBadge(quote.estado)
                  return (
                    <TableRow key={quote.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${getAvatarColor(quote.id)} flex items-center justify-center text-white text-xs font-bold`}>
                            {getInitials(quote.first_name, quote.last_name)}
                          </div>
                          <span>{quote.first_name} {quote.last_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-600 dark:text-blue-400 underline">{quote.email}</TableCell>
                      <TableCell className="text-muted-foreground">{quote.company_name || "—"}</TableCell>
                      <TableCell className="font-medium">{quote.numero_cotizacion}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${statusInfo.className} font-normal`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(quote.fecha)}</TableCell>
                      <TableCell className="text-right font-bold">
                        {quote.monto_total
                          ? `$${quote.monto_total.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`
                          : <span className="text-muted-foreground font-normal">Pendiente</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Link href={`/dashboard/admin/cotizaciones/${quote.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingQuote(quote)}>
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingQuote && (
        <EditQuoteModal
          quote={editingQuote}
          onClose={() => setEditingQuote(null)}
          onSuccess={() => {
            setEditingQuote(null)
            setRefreshTrigger((prev) => prev + 1)
          }}
        />
      )}
    </>
  )
}
