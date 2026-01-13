import { MainLayout } from "@/components/layout/main-layout"
import { Shield } from "lucide-react"

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold">Política de Privacidad</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-foreground-muted">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Introducción</h2>
            <p>
              En Orpheus, nos tomamos muy en serio tu privacidad. Esta política explica cómo recopilamos, usamos y protegemos tu información personal cuando utilizas nuestro servicio de streaming de música.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. Información que Recopilamos</h2>
            <p>
              Recopilamos información técnica necesaria para el funcionamiento del servicio, incluyendo:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Datos de uso: historial de reproducción y favoritos para mejorar tus recomendaciones.</li>
              <li>Información del dispositivo: tipo de navegador y sistema operativo.</li>
              <li>Cookies y tecnologías de seguimiento: Utilizamos Google AdSense y Umami Analytics para monetización y análisis.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. Derechos del Usuario</h2>
            <p>
              Tienes derecho a acceder, rectificar o eliminar tus datos en cualquier momento a través de la sección de Ajustes de la aplicación.
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
