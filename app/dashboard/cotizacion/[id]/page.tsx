
"use client"

import { useEffect, useState, use } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Truck, MapPin, Package, CheckCircle, Clock, DollarSign, MessageSquare } from "lucide-react"

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const id = resolvedParams.id
    const router = useRouter()
    const [quote, setQuote] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        fetchQuote()
    }, [id])

    async function fetchQuote() {
        try {
            const token = localStorage.getItem("auth_token")
            const response = await fetch(`/api/quotes/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (response.ok) {
                const data = await response.json()
                setQuote(data)
            } else {
                // Handle error (e.g. 404)
                router.push("/dashboard/cotizacion")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function handleAccept() {
        setActionLoading(true)
        try {
            const token = localStorage.getItem("auth_token")
            const response = await fetch(`/api/quotes/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ action: 'accept' })
            })
            if (response.ok) {
                fetchQuote()
            }
        } catch (e) {
            console.error(e)
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Cargando detalles...</div>
    if (!quote) return <div className="p-8 text-center">No encontrado</div>

    // Generate Timeline in Reverse Chronological Order (Newest First)
    const timeline = []

    // 1. Dynamic Transport Updates (Already DESC from DB)
    if (quote.transport_history && quote.transport_history.length > 0) {
        quote.transport_history.forEach((u: any) => {
            timeline.push({
                status: u.estado,
                date: u.fecha,
                active: true,
                icon: <Truck className="w-4 h-4" />,
                descripcion: u.descripcion,
                ubicacion: u.ubicacion
            })
        })
    }

    // 2. Acceptance (if applicable)
    if (['transporte', 'finalizado'].includes(quote.estado) || quote.fecha_aceptacion) {
        timeline.push({
            status: 'Aceptado por Cliente',
            date: quote.fecha_aceptacion,
            active: true,
            icon: <CheckCircle className="w-4 h-4" />
        })
    }

    // 3. Admin Response
    if (['respondido', 'transporte', 'finalizado'].includes(quote.estado) || quote.monto_total) {
        timeline.push({
            status: 'Respuesta Admin',
            date: quote.updated_at, // Approximate timestamp for response if explicit one missing
            active: true,
            icon: <MessageSquare className="w-4 h-4" />
        })
    }

    // 4. Creation (Always last/oldest)
    timeline.push({
        status: 'Solicitud Creada',
        date: quote.created_at,
        active: true,
        icon: <Clock className="w-4 h-4" />
    })

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-start">
                <div>
                    <Button variant="ghost" onClick={() => router.back()} className="pl-0 mb-2">← Volver</Button>
                    <h1 className="text-3xl font-bold">Cotización {quote.numero_cotizacion}</h1>
                    <p className="text-muted-foreground">Detalles y seguimiento</p>
                </div>
                <Badge className={`text-lg px-4 py-1capitalize ${quote.estado === 'pendiente' ? 'bg-yellow-500' : 'bg-green-600'}`}>
                    {quote.estado}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Detalles de la carga */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" /> Detalles de Carga</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Origen</p>
                                <p className="font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> {quote.origen}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Destino</p>
                                <p className="font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> {quote.destino}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tipo Servicio</p>
                                <p className="font-medium">{quote.tipo_servicio}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tipo Carga</p>
                                <p className="font-medium">{quote.tipo_carga}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Peso / Vol</p>
                                <p className="font-medium">{quote.peso}kg / {quote.volumen}m³</p>
                            </div>
                        </div>
                        {quote.descripcion && (
                            <div className="bg-slate-50 p-3 rounded text-sm mt-4">
                                <p className="font-semibold text-xs text-muted-foreground mb-1">NOTA CLIENTE:</p>
                                {quote.descripcion}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Estado y Respuesta */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5" /> Cotización / Precio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {quote.monto_total ? (
                            <div className="text-center py-4">
                                <p className="text-sm text-muted-foreground mb-1">Precio Final Cotizado</p>
                                <p className="text-4xl font-bold text-green-600">${Number(quote.monto_total).toFixed(2)}</p>
                                {quote.mensaje_admin && (
                                    <div className="bg-blue-50 text-blue-800 p-3 rounded mt-4 text-left text-sm">
                                        <p className="font-bold text-xs mb-1">MENSAJE ADMIN:</p>
                                        {quote.mensaje_admin}
                                    </div>
                                )}

                                {quote.estado === 'respondido' && (
                                    <Button
                                        className="w-full mt-6 bg-green-600 hover:bg-green-700"
                                        size="lg"
                                        onClick={handleAccept}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? "Procesando..." : "ACEPTAR COTIZACIÓN"}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Esperando respuesta del administrador...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Historial Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5" /> Seguimiento / Historial</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 py-2">
                        {timeline.map((item: any, idx) => (
                            <div key={idx} className={`relative pl-6 ${!item.active ? 'opacity-40' : ''}`}>
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${item.active ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'} flex items-center justify-center`}>
                                    {/* Icon inside dot? No space, but maybe custom icon */}
                                </div>
                                <div>
                                    <p className="font-semibold text-base">{item.status}</p>
                                    <p className="text-sm text-muted-foreground">{item.date ? new Date(item.date).toLocaleString() : '-'}</p>
                                    {item.descripcion && <p className="text-sm mt-1">{item.descripcion}</p>}
                                    {item.ubicacion && <p className="text-xs bg-slate-100 inline-block px-2 py-0.5 rounded mt-1 text-slate-600"><MapPin className="w-3 h-3 inline mr-1" />{item.ubicacion}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
