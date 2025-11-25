"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import QuotesList from "./quotes-list"
import CreateQuoteModal from "./create-quote-modal"

export default function CotizacionPage() {
  const [showModal, setShowModal] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleQuoteCreated = () => {
    setShowModal(false)
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cotizaciones</h1>
            <p className="text-muted-foreground mt-1">Gestiona tus cotizaciones</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Cotización
          </Button>
        </div>

        <QuotesList refreshTrigger={refreshTrigger} />
      </div>

      {showModal && <CreateQuoteModal onClose={() => setShowModal(false)} onSuccess={handleQuoteCreated} />}
    </>
  )
}
