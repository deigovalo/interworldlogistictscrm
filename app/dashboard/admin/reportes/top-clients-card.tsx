"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TopClient {
  id: number
  name: string
  company: string
  status: string
  totalRevenue: number
  quoteCount: number
}

interface TopClientsCardProps {
  data: TopClient[]
}

export function TopClientsCard({ data }: TopClientsCardProps) {
  return (
    <Card className="col-span-1 md:col-span-2 border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Mejores Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Empresa</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cantidad</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Ingresos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((client) => (
              <TableRow key={client.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">
                      {client.name.charAt(0)}
                    </div>
                    {client.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{client.company || "—"}</TableCell>
                <TableCell>{client.quoteCount}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`font-normal ${client.status === 'activo'
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                  >
                    {client.status === 'activo' ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-bold">${client.totalRevenue.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
