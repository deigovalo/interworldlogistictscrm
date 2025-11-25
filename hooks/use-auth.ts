"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export interface AuthUser {
  id: number
  email: string
  first_name: string
  last_name: string
  role: "admin" | "usuario"
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) {
          setLoading(false)
          router.push("/auth/login")
          return
        }

        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          localStorage.removeItem("auth_token")
          router.push("/auth/login")
          return
        }

        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      localStorage.removeItem("auth_token")
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

  return { user, loading, logout, token }
}
