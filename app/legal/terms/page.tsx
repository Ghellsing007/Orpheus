import { MainLayout } from "@/components/layout/main-layout"
import { FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold">Términos de Uso</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-foreground-muted">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar Orpheus, aceptas cumplir con estos Términos de Uso y todas las leyes y regulaciones aplicables. Si no estás de acuerdo con alguno de estos términos, tienes prohibido usar o acceder a este sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. Licencia de Uso</h2>
            <p>
              Orpheus es una plataforma de descubrimiento y streaming musical. El contenido visual y la interfaz son propiedad de Orpheus. El contenido musical se sirve a través de integraciones de terceros y está sujeto a sus propios términos de licencia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. Restricciones</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>No está permitido el uso de scripts automatizados para extraer datos.</li>
              <li>No se permite la redistribución comercial del servicio sin autorización.</li>
              <li>El usuario es responsable de mantener la confidencialidad de su cuenta.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. Limitación de Responsabilidad</h2>
            <p>
              Orpheus no garantiza que el servicio sea ininterrumpido o libre de errores. El uso del servicio es bajo tu propio riesgo.
            </p>
          </section>

          <section className="pt-8 border-t border-border">
            <p className="text-sm">Última actualización: 13 de enero de 2024</p>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}
