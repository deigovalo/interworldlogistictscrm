"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

import UsersList from "./users-list"
import CreateUserModal from "./create-user-modal"

export default function AdminUsuariosPage() {
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUserCreated = () => {
    setShowModal(false)
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
            <p className="text-muted-foreground mt-1">Crea, edita y desactiva usuarios</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por email, nombre..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <UsersList searchTerm={searchTerm} refreshTrigger={refreshTrigger} setRefreshTrigger={setRefreshTrigger} />
      </div>

      {showModal && <CreateUserModal onClose={() => setShowModal(false)} onSuccess={handleUserCreated} />}
    </>
  )
}
