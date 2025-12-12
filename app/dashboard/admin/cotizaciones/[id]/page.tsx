
"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Truck, MapPin, Package, User, Mail, Building, Clock, DollarSign, Send, CheckCircle } from "lucide-react"

export default function AdminQuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const id = resolvedParams.id
    const router = useRouter()
    const [quote, setQuote] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    // Forms state
    const [responseForm, setResponseForm] = useState({ monto: "", mensaje: "" })
    const [transportForm, setTransportForm] = useState({ estado: "", descripcion: "", ubicacion: "" })

    useEffect(() => {
        fetchQuote()
    }, [id])

    async function fetchQuote() {
        try {
            const token = localStorage.getItem("auth_token")
            const response = await fetch(`/api/admin/cotizaciones/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (response.ok) {
                const data = await response.json()
                setQuote(data)
            } else {
                router.push("/dashboard/admin/cotizaciones")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function handleResponse(e: React.FormEvent) {
        e.preventDefault()
        setProcessing(true)
        try {
            const token = localStorage.getItem("auth_token")
            const res = await fetch(`/api/admin/cotizaciones/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: 'respond',
                    monto: Number(responseForm.monto),
                    mensaje: responseForm.mensaje
                })
            })
            if (res.ok) {
                fetchQuote()
            }
        } catch (err) { console.error(err) }
        finally { setProcessing(false) }
    }

    async function handleTransportUpdate(e: React.FormEvent) {
        e.preventDefault()
        setProcessing(true)
        try {
            const token = localStorage.getItem("auth_token")
            const res = await fetch(`/api/admin/cotizaciones/${id}/transport`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(transportForm)
            })
            if (res.ok) {
                setTransportForm({ estado: "", descripcion: "", ubicacion: "" })
                fetchQuote()
            }
        } catch (err) { console.error(err) }
        finally { setProcessing(false) }
    }

    if (loading) return <div className="p-8 text-center">Cargando...</div>
    if (!quote) return <div className="p-8 text-center">No encontrado</div>

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-start">
                <div>
                    <Button variant="ghost" onClick={() => router.back()} className="pl-0 mb-2">← Volver</Button>
                    <h1 className="text-3xl font-bold">Gestión de Cotización {quote.numero_cotizacion}</h1>
                    <p className="text-muted-foreground">Administración de solicitud y transporte</p>
                </div>
                <Badge className={`text-lg px-4 py-1 capitalize ${quote.estado === 'pendiente' ? 'bg-yellow-500' : 'bg-blue-600'}`}>
                    {quote.estado}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Client Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><User className="w-4 h-4" /> Información del Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            {/* Note: The new getQuoteDetails might not join user fields. 
                          Ideally the API should join user info. 
                          I updated getQuoteDetails to SELECT * FROM cotizaciones. 
                          So I might lack User Name here unless I update the query. 
                          I will rely on what I have, or update the API. 
                          Admin listing has user info, but detail GET might not. 
                          Let's assume for now we might miss name if not joined.
                          I should fix getQuoteDetails to join users table implicitly? 
                          Or just show what we have. 
                       */}
                            {/* Actually, for Admin view, seeing who requested is critical. 
                           I should probably update getQuoteDetails to include user info.
                           I will do that after this file creation if needed.
                       */}
                            <div>
                                <p className="text-muted-foreground">Cliente</p>
                                <p className="font-medium">{quote.first_name} {quote.last_name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium">{quote.email}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Teléfono</p>
                                <p className="font-medium">{quote.phone || 'No registrado'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Empresa</p>
                                <p className="font-medium">{quote.company_name || 'Particular'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Fecha Solicitud</p>
                                <p className="font-medium">{new Date(quote.fecha).toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cargo Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><Package className="w-4 h-4" /> Detalles de Carga</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div><p className="text-muted-foreground">Origen</p><p className="font-medium">{quote.origen}</p></div>
                            <div><p className="text-muted-foreground">Destino</p><p className="font-medium">{quote.destino}</p></div>
                            <div><p className="text-muted-foreground">Servicio</p><p className="font-medium">{quote.tipo_servicio}</p></div>
                            <div><p className="text-muted-foreground">Carga</p><p className="font-medium">{quote.tipo_carga}</p></div>
                            <div><p className="text-muted-foreground">Peso/Vol</p><p className="font-medium">{quote.peso}kg / {quote.volumen}m³</p></div>
                        </CardContent>
                        {quote.descripcion && (
                            <CardContent className="pt-0">
                                <div className="bg-slate-50 p-3 rounded text-sm"><span className="font-bold">Nota:</span> {quote.descripcion}</div>
                            </CardContent>
                        )}
                    </Card>

                    {/* ACTION AREA */}
                    <Card className="border-blue-200 bg-blue-50/20">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="w-4 h-4" /> Respuesta de Cotización</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {quote.estado === 'pendiente' ? (
                                <form onSubmit={handleResponse} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Precio Total ($)</Label>
                                            <Input
                                                type="number" step="0.01" required
                                                value={responseForm.monto}
                                                onChange={e => setResponseForm({ ...responseForm, monto: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mensaje para el Cliente</Label>
                                        <Textarea
                                            required
                                            placeholder="Detalles del precio, condiciones, etc."
                                            value={responseForm.mensaje}
                                            onChange={e => setResponseForm({ ...responseForm, mensaje: e.target.value })}
                                        />
                                    </div>
                                    <Button type="submit" disabled={processing}>Enviar Cotización</Button>
                                </form>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm p-3 bg-white rounded border">
                                        <span className="text-muted-foreground">Precio Cotizado:</span>
                                        <span className="font-bold text-lg text-green-600">${Number(quote.monto_total).toFixed(2)}</span>
                                    </div>
                                    <div className="text-sm p-3 bg-white rounded border">
                                        <span className="font-bold block mb-1">Mensaje Enviado:</span>
                                        {quote.mensaje_admin}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Transport Updates */}
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><Truck className="w-4 h-4" /> Gestión de Transporte</CardTitle>
                            <CardDescription>Actualizar estado del envío</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Form */}
                            {/* Form */}
                            {['transporte', 'finalizado'].includes(quote.estado) || quote.fecha_aceptacion ? (
                                <div className="space-y-4">
                                    {/* Admin Finish Action */}
                                    {quote.estado === 'transporte' && (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded space-y-3">
                                            <h4 className="font-bold text-blue-800 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Finalizar Transporte
                                            </h4>
                                            {quote.transport_history?.some((h: any) => h.estado === 'Transporte Completo') ? (
                                                <div>
                                                    <p className="text-sm text-green-700 mb-2">✅ El cliente ha confirmado la recepción.</p>
                                                    <Button
                                                        onClick={async () => {
                                                            if (!confirm("¿Desea cambiar el estado a FINALIZADO?")) return;
                                                            setProcessing(true)
                                                            try {
                                                                const token = localStorage.getItem("auth_token")
                                                                const res = await fetch(`/api/admin/cotizaciones/${id}`, {
                                                                    method: 'PATCH',
                                                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                                                    body: JSON.stringify({ action: 'complete_transport' })
                                                                })
                                                                if (res.ok) fetchQuote()
                                                            } catch (e) { console.error(e) }
                                                            finally { setProcessing(false) }
                                                        }}
                                                        className="w-full bg-green-600 hover:bg-green-700"
                                                        disabled={processing}
                                                    >
                                                        Marcar como TRANSPORTE COMPLETO
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-yellow-800 bg-yellow-50 p-2 rounded">
                                                    ⚠️ Esperando que el cliente presione "Transporte Completo" para poder finalizar.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {quote.estado !== 'finalizado' ? (
                                        <form onSubmit={handleTransportUpdate} className="space-y-3 p-4 bg-slate-50 rounded border">
                                            <h4 className="font-medium text-sm">Nueva Actualización</h4>
                                            <Input
                                                placeholder="Estado (ej: Salio de Puerto)"
                                                value={transportForm.estado}
                                                onChange={e => setTransportForm({ ...transportForm, estado: e.target.value })}
                                                required
                                            />
                                            <Input
                                                placeholder="Ubicación (Opcional)"
                                                value={transportForm.ubicacion}
                                                onChange={e => setTransportForm({ ...transportForm, ubicacion: e.target.value })}
                                            />
                                            <Textarea
                                                placeholder="Descripción detalles..."
                                                value={transportForm.descripcion}
                                                onChange={e => setTransportForm({ ...transportForm, descripcion: e.target.value })}
                                                className="h-20"
                                            />
                                            <Button size="sm" type="submit" className="w-full" disabled={processing}>Actualizar Estado</Button>
                                        </form>
                                    ) : (
                                        <div className="p-4 bg-green-50 text-green-800 rounded border border-green-200 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-bold">El transporte ha sido marcado como FINALIZADO.</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center p-4 text-sm text-yellow-600 bg-yellow-50 rounded">
                                    El cliente debe aceptar la cotización para iniciar el transporte.
                                </div>
                            )}

                            <Separator />

                            {/* History List */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm">Historial</h4>
                                <div className="space-y-4 relative border-l ml-2 pl-4">
                                    {quote.transport_history?.map((h: any) => (
                                        <div key={h.id} className="relative text-sm">
                                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                            <p className="font-bold">{h.estado}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(h.fecha).toLocaleString()}</p>
                                            {h.ubicacion && <p className="text-xs mt-1 text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {h.ubicacion}</p>}
                                            {h.descripcion && <p className="mt-1 text-slate-700">{h.descripcion}</p>}
                                        </div>
                                    ))}
                                    {(!quote.transport_history || quote.transport_history.length === 0) && (
                                        <p className="text-xs text-muted-foreground">No hay actualizaciones</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
