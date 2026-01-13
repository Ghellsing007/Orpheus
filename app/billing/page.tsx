import { MainLayout } from "@/components/layout/main-layout"
import { CreditCard } from "lucide-react"

export default function BillingPage() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center mb-6">
          <CreditCard className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Planes y Facturación</h1>
        <p className="text-foreground-muted max-w-md">
          Estamos trabajando en esta funcionalidad. Pronto podrás gestionar tus suscripciones y métodos de pago aquí.
        </p>
      </div>
    </MainLayout>
  )
}
