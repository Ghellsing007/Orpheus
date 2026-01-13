import { MainLayout } from "@/components/layout/main-layout"
import { Mail, MessageSquare, Send } from "lucide-react"

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contáctanos</h1>
          <p className="text-foreground-muted">
            ¿Tienes preguntas, sugerencias o problemas técnicos? Estamos aquí para ayudarte.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Correo Electrónico</h3>
                <p className="text-foreground-muted">Soporte general y consultas</p>
                <a href="mailto:support@orpheus.music" className="text-primary hover:underline font-medium">
                  support@orpheus.music
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Comunidad</h3>
                <p className="text-foreground-muted">Reportes de la comunidad y colaboraciones</p>
                <a href="#" className="text-primary hover:underline font-medium">
                  @orpheus_music_app
                </a>
              </div>
            </div>
          </div>

          <form className="space-y-4 bg-card/50 p-6 rounded-2xl border border-border">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground-muted">Nombre</label>
              <input 
                type="text" 
                placeholder="Tu nombre"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground-muted">Email</label>
              <input 
                type="email" 
                placeholder="tu@email.com"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground-muted">Mensaje</label>
              <textarea 
                rows={4}
                placeholder="¿En qué podemos ayudarte?"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
              ></textarea>
            </div>
            <button 
              type="button"
              className="w-full h-11 gradient-primary rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Envía tu mensaje
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}
