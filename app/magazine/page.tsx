import { MainLayout } from "@/components/layout/main-layout"
import { ArticleCard } from "@/components/editorial/article-card"
import { AdSlot } from "@/components/ui/ad-slot"
import { Newspaper, TrendingUp, Star, Award } from "lucide-react"

const MOCK_ARTICLES = [
  {
    id: "tendencias-musicales-2024",
    title: "El Resurgimiento del Synth-Pop: Por qué los 80 están más vivos que nunca",
    excerpt: "Analizamos cómo artistas modernos están adoptando sintetizadores analógicos y estéticas retro para dominar las listas de éxitos mundiales.",
    category: "Análisis",
    author: "Elena Ritmo",
    date: "12 Ene 2024",
    image: "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=800&auto=format&fit=crop",
    readTime: "5 min"
  },
  {
    id: "review-nuevo-album-weeknd",
    title: "Reseña: 'Midnight Shadows' – ¿La obra maestra definitiva de The Weeknd?",
    excerpt: "Desglosamos pista por pista el último lanzamiento que ha dejado al mundo en silencio. Desde la producción hasta las letras más profundas.",
    category: "Reseña",
    author: "Marco Beat",
    date: "10 Ene 2024",
    image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=800&auto=format&fit=crop",
    readTime: "8 min"
  },
  {
    id: "top-10-indie-2023",
    title: "Top 10: Los álbumes Indie que definieron el 2023",
    excerpt: "Nuestra selección editorial de las joyas ocultas que no puedes dejar de escuchar si quieres estar al día con la escena independiente.",
    category: "Rankings",
    author: "Sofía Indie",
    date: "08 Ene 2024",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop",
    readTime: "12 min"
  }
]

export default function MagazinePage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-card border border-border/60 mb-12 h-[300px] md:h-[400px]">
          <img 
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 max-w-2xl">
            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-4">
              <Star className="w-5 h-5 fill-current" />
              DESTACADO DEL MES
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Orpheus Magazine: La Voz de la Escena Musical
            </h1>
            <p className="text-foreground-muted text-lg mb-6 line-clamp-2 md:line-clamp-none">
              Descubre reseñas profundas, entrevistas exclusivas y los rankings que están marcando el ritmo de la industria.
            </p>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2 scrollbar-none">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold whitespace-nowrap">
            <Newspaper className="w-4 h-4" /> Todos
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:border-primary/50 rounded-full text-foreground-muted hover:text-foreground text-sm font-semibold transition-all whitespace-nowrap">
            <Star className="w-4 h-4" /> Reseñas
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:border-primary/50 rounded-full text-foreground-muted hover:text-foreground text-sm font-semibold transition-all whitespace-nowrap">
            <TrendingUp className="w-4 h-4" /> Noticias
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:border-primary/50 rounded-full text-foreground-muted hover:text-foreground text-sm font-semibold transition-all whitespace-nowrap">
            <Award className="w-4 h-4" /> Rankings
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <div className="grid md:grid-cols-2 gap-6">
              {MOCK_ARTICLES.map((article) => (
                <ArticleCard key={article.id} {...article} />
              ))}
            </div>
            
            <AdSlot type="banner" className="h-32" />

            <div className="bg-card/30 border border-border/50 rounded-3xl p-8 text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">¡Queremos tu reseña!</h3>
              <p className="text-foreground-muted mb-6">
                En Orpheus, la comunidad es lo primero. Comparte tu opinión sobre tus álbumes favoritos y ayuda a otros a descubrir nuevas joyas.
              </p>
              <button className="px-8 h-12 gradient-primary rounded-xl font-bold text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Escribir Reseña
              </button>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-card/50 border border-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Tendencias
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 group cursor-pointer">
                    <span className="text-2xl font-black text-foreground-muted/30 group-hover:text-primary transition-colors">0{i}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">Título del Artículo de Tendencia {i}</p>
                      <p className="text-[10px] text-foreground-muted">Por Redacción Orpheus</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <AdSlot type="sidebar" className="h-64" />

            <div className="bg-gradient-to-br from-primary/20 to-background border border-primary/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-2">Editor's Picks</h3>
              <p className="text-xs text-foreground-muted mb-4 leading-relaxed">
                Nuestra selección semanal de los artistas que están rompiendo moldes.
              </p>
              <div className="aspect-square bg-black/40 rounded-xl border border-white/5 mb-4 flex items-center justify-center text-foreground-muted italic text-sm">
                [Playlist Curada Image]
              </div>
              <button className="w-full h-10 bg-white text-black font-bold rounded-lg text-xs hover:bg-white/90 transition-all">
                Escuchar ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
