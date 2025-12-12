"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

export interface AuthUser {
    id: number
    email: string
    first_name: string
    last_name: string
    role: "admin" | "usuario"
}

interface AuthContextType {
    user: AuthUser | null
    loading: boolean
    login: (token: string, userData: AuthUser) => void
    logout: () => Promise<void>
    token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        checkAuth()
    }, []) // Empty dependency array -> Run once on mount

    const checkAuth = async () => {
        if (pathname.startsWith('/auth')) {
            setLoading(false)
            return
        }

        try {
            const token = localStorage.getItem("auth_token")
            if (!token) {
                setLoading(false)
                return
            }

            const response = await fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!response.ok) {
                localStorage.removeItem("auth_token")
                setUser(null)
            } else {
                const data = await response.json()
                setUser(data.user)
            }
        } catch (error) {
            console.error("Auth check error:", error)
            localStorage.removeItem("auth_token")
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const login = (token: string, userData: AuthUser) => {
        localStorage.setItem("auth_token", token)
        setUser(userData)
        router.push("/dashboard")
    }

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
            localStorage.removeItem("auth_token")
            setUser(null)
            router.push("/auth/login")
        } catch (error) {
            console.error("Logout error:", error)
        }
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, token }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
