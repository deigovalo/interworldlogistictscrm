"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { LogOut, User, LayoutDashboard, FileText, Users, FileSpreadsheet, BarChart, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, loading } = useAuth()
  const pathname = usePathname()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-300 dark:border-gray-700 bg-card flex flex-col">
        <div className="p-6 flex items-center justify-start">
          <Image
            src="/LOGO-WEB-INTER-WOLRD-SOLUITIONS.png"
            alt="Interworld Solutions"
            width={160}
            height={50}
            priority
            className="h-auto w-auto"
          />
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Main Menu */}
          <div>
            <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Menú Principal
            </h3>
            <div className="space-y-1">
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive("/dashboard")
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-foreground"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <NotificationsDropdown isSidebar />

              {user.role === "usuario" && (
                <Link
                  href="/dashboard/cotizacion"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive("/dashboard/cotizacion")
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-foreground"
                  )}
                >
                  <FileText className="w-4 h-4" />
                  <span>Mis Cotizaciones</span>
                </Link>
              )}
            </div>
          </div>

          {/* Management Section - Admin Only */}
          {user.role === "admin" && (
            <div>
              <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Gestión
              </h3>
              <div className="space-y-1">
                <Link
                  href="/dashboard/admin/usuarios"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive("/dashboard/admin/usuarios")
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-foreground"
                  )}
                >
                  <Users className="w-4 h-4" />
                  <span>Gestión de Usuarios</span>
                </Link>
                <Link
                  href="/dashboard/admin/cotizaciones"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive("/dashboard/admin/cotizaciones")
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-foreground"
                  )}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Gestión de Cotizaciones</span>
                </Link>
                <Link
                  href="/dashboard/admin/reportes"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive("/dashboard/admin/reportes")
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-foreground"
                  )}
                >
                  <BarChart className="w-4 h-4" />
                  <span>Reportes</span>
                </Link>
              </div>
            </div>
          )}

          {/* Settings Section */}
          <div>
            <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Configuración
            </h3>
            <div className="space-y-1">
              <Button
                onClick={logout}
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 h-auto text-sm font-medium text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-2 rounded-lg border border-border bg-card/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">
                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Header Bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-end px-8 gap-4 sticky top-0 z-10">

        </header>

        <div className="p-8 flex-1">{children}</div>
      </main>
    </div>
  )
}
