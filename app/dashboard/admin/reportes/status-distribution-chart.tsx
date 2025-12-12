"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface StatusDistribution {
  status: string
  count: number
}

interface StatusDistributionChartProps {
  data: StatusDistribution[]
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  return (
    <Card className="col-span-1 border-none shadow-sm">
      <CardHeader>
        <div>
          <CardTitle className="text-lg font-bold">Estadísticas de Cotizaciones</CardTitle>
          <CardDescription>Estado de cotizaciones</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="status"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                dy={10}
                tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                {data.map((entry, index) => {
                  const colors: Record<string, string> = {
                    pendiente: "#eab308", // yellow-500
                    respondido: "#3b82f6", // blue-500
                    aprobado: "#22c55e", // green-500
                    desaprobado: "#ef4444", // red-500
                    transporte: "#a855f7", // purple-500
                    finalizado: "#6b7280" // gray-500
                  };
                  return <Cell key={`cell-${index}`} fill={colors[entry.status] || "#3b82f6"} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
