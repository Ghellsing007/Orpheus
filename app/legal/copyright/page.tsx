import { MainLayout } from "@/components/layout/main-layout"
import { AlertTriangle } from "lucide-react"

export default function CopyrightPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold">DMCA & Política de Copyright</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-foreground-muted">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Notificación de Infracción de Derechos de Autor</h2>
            <p>
              Orpheus respeta la propiedad intelectual de otros. Si creas que tu trabajo ha sido copiado de manera que constituye una infracción de derechos de autor, por favor proporciona a nuestro agente de copyright la siguiente información por escrito:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Una firma electrónica o física de la persona autorizada para actuar en nombre del propietario del interés de los derechos de autor.</li>
              <li>Una descripción del trabajo protegido por derechos de autor que afirmas que ha sido infringido.</li>
              <li>Una descripción de dónde se encuentra el material que afirmas que es infractor en el sitio.</li>
              <li>Tu dirección, número de teléfono y dirección de correo electrónico.</li>
              <li>Una declaración tuya de que tienes una creencia de buena fe de que el uso en disputa no está autorizado por el propietario del copyright, su agente o la ley.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Procedimiento de Reclamación</h2>
            <p>
              Puedes enviar tus notificaciones de reclamación por infracción de derechos de autor a través de nuestro formulario de contacto o enviando un correo a: <span className="text-primary">copyright@orpheus.music</span>
            </p>
          </section>

          <section className="pt-8 border-t border-border">
            <p className="text-sm">Este sitio opera como un motor de búsqueda y agregador de contenido musical de fuentes públicas.</p>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}
