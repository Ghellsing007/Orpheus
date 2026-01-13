import { MainLayout } from "@/components/layout/main-layout"
import { HelpCircle } from "lucide-react"

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center mb-6">
          <HelpCircle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Centro de Ayuda</h1>
        <p className="text-foreground-muted max-w-md">
          ¿Tienes dudas o problemas con Orpheus? Estamos preparando guías y un sistema de soporte para ayudarte.
        </p>
      </div>
    </MainLayout>
  )
}
