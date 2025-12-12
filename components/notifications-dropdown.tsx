
"use client"

import { useEffect, useState } from "react"
import { Bell, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Notification {
    id: string
    title: string
    message: string
    link?: string
    read: boolean
    created_at: string
}

export function NotificationsDropdown({ isSidebar = false }: { isSidebar?: boolean }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        fetchNotifications()
    }, [])

    async function fetchNotifications() {
        try {
            const token = localStorage.getItem("auth_token")
            if (!token) return

            const res = await fetch("/api/notifications", {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
                setUnreadCount(data.filter((n: Notification) => !n.read).length)
            }
        } catch (error) {
            console.error(error)
        }
    }

    async function markAsRead(id: string) {
        try {
            const token = localStorage.getItem("auth_token")
            await fetch(`/api/notifications/${id}/read`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })
            // Update UI locally
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (e) { console.error(e) }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {isSidebar ? (
                    <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2 h-auto text-sm font-medium text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-foreground transition-colors relative">
                        <Bell className="w-4 h-4" />
                        <span>Notificaciones</span>
                        {unreadCount > 0 && (
                            <Badge className="ml-auto h-5 min-w-5 flex items-center justify-center p-0 px-1 bg-red-500 rounded-full text-[10px]">
                                {unreadCount}
                            </Badge>
                        )}
                    </Button>
                ) : (
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 rounded-full">
                                {unreadCount}
                            </Badge>
                        )}
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align={isSidebar ? "start" : "end"} side={isSidebar ? "right" : "bottom"}>
                <div className="p-3 border-b font-semibold flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span>Notificaciones</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={fetchNotifications}
                            title="Actualizar"
                        >
                            <RefreshCcw className="h-4 w-4" />
                        </Button>
                    </div>
                    {unreadCount > 0 && <span className="text-xs text-muted-foreground">{unreadCount} nuevas</span>}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No tienes notificaciones
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div
                                key={n.id}
                                className={`p-3 border-b text-sm transition-colors hover:bg-slate-50 ${!n.read ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-medium ${!n.read ? 'text-blue-700' : 'text-slate-900'}`}>{n.title}</span>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                        {new Date(n.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-slate-600 mb-2 line-clamp-2">{n.message}</p>
                                <div className="flex gap-2">
                                    {n.link && (
                                        <Link
                                            href={n.link}
                                            className="text-xs text-blue-600 hover:underline font-medium"
                                            onClick={() => {
                                                markAsRead(n.id)
                                                setIsOpen(false)
                                            }}
                                        >
                                            Ver Detalles
                                        </Link>
                                    )}
                                    {!n.read && (
                                        <button
                                            className="text-xs text-slate-400 hover:text-slate-600 ml-auto"
                                            onClick={() => markAsRead(n.id)}
                                        >
                                            Marcar leída
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
