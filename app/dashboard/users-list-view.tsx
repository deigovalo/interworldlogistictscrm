"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface User {
    id: number
    email: string
    first_name: string
    last_name: string
    company_name: string
    phone: string
    role: string
    email_verified: boolean
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

export function UsersListView({ token }: { token: string }) {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        try {
            const response = await fetch("/api/admin/users", {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (response.ok) {
                const data = await response.json()
                setUsers(data.slice(0, 5)) // Show only first 5 users
            }
        } catch (error) {
            console.error("Error fetching users:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="text-center py-8">Cargando usuarios...</div>
    }

    return (
        <Card className="border-none shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Usuarios Recientes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {users.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No hay usuarios registrados</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
                                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre Completo</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rol</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fecha de Registro</TableHead>
                                <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">2F Auth</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full ${getAvatarColor(user.id)} flex items-center justify-center text-white text-xs font-bold`}>
                                                {getInitials(user.first_name, user.last_name)}
                                            </div>
                                            <span>{user.first_name} {user.last_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-blue-600 dark:text-blue-400 underline">{user.email}</TableCell>
                                    <TableCell className="text-muted-foreground">{user.role === 'admin' ? 'Administrador' : 'Usuario'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            <span className="text-sm">Activo</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{formatDate(user.created_at)}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 font-normal"
                                        >
                                            {user.email_verified ? "Enabled" : "Disabled"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
