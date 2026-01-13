import { MainLayout } from "@/components/layout/main-layout"
import { Users, MessageCircle, Share2, Heart } from "lucide-react"

export default function CommunityPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Comunidad Orpheus</h1>
            <p className="text-foreground-muted underline decoration-primary/30 underline-offset-4">
              Conecta con otros amantes de la música
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Social Feed Placeholder */}
          <div className="bg-card/40 border border-border/50 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
              <MessageCircle className="w-10 h-10 text-foreground-muted" />
            </div>
            <h2 className="text-2xl font-bold mb-3">El Feed Social está en camino</h2>
            <p className="text-foreground-muted max-w-lg mx-auto mb-8">
              Pronto podrás ver qué escuchan tus amigos, compartir tus descubrimientos y participar en debates sobre los últimos lanzamientos.
            </p>
            <div className="flex justify-center gap-4">
               <div className="flex flex-col items-center gap-2">
                 <div className="w-12 h-12 rounded-full border border-dashed border-primary/40 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary/40" />
                 </div>
                 <span className="text-[10px] text-foreground-subtle uppercase">Likes</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <div className="w-12 h-12 rounded-full border border-dashed border-primary/40 flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-primary/40" />
                 </div>
                 <span className="text-[10px] text-foreground-subtle uppercase">Share</span>
               </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card/30 border border-border/50 rounded-2xl p-6">
              <h3 className="font-bold mb-2">Ranking de Oyentes</h3>
              <p className="text-sm text-foreground-muted mb-4">Usuarios más activos de la semana</p>
              <div className="space-y-3 opacity-50 blur-[1px] select-none">
                 {[1,2,3].map(i => (
                   <div key={i} className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-border" />
                     <div className="h-4 bg-border w-24 rounded" />
                   </div>
                 ))}
              </div>
            </div>
            <div className="bg-card/30 border border-border/50 rounded-2xl p-6">
              <h3 className="font-bold mb-2">Salas de Chat</h3>
              <p className="text-sm text-foreground-muted mb-4">Debate en tiempo real por géneros</p>
              <div className="space-y-3 opacity-50 blur-[1px] select-none">
                 {[1,2,3].map(i => (
                   <div key={i} className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded bg-border" />
                     <div className="h-4 bg-border w-32 rounded" />
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
