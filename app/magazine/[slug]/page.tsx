"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { AdSlot } from "@/components/ui/ad-slot"
import { ArrowLeft, Clock, User, Calendar, Share2, Bookmark, ThumbsUp, Search } from "lucide-react"

// Mock data de artículos (en producción vendría de una API o CMS)
const ARTICLES_DATA: Record<string, {
  title: string
  category: string
  author: string
  authorAvatar: string
  date: string
  readTime: string
  image: string
  content: string[]
  relatedTracks: { name: string; artist: string }[]
}> = {
  "review-nuevo-album-weeknd": {
    title: "Reseña: 'Midnight Shadows' – ¿La obra maestra definitiva de The Weeknd?",
    category: "Reseña",
    author: "Marco Beat",
    authorAvatar: "/placeholder-user.jpg",
    date: "10 Enero 2024",
    readTime: "8 min",
    image: "/dark-emotional-portrait-album-art.jpg",
    content: [
      "The Weeknd ha vuelto a sorprender al mundo con su último lanzamiento, 'Midnight Shadows'. Un álbum que desde los primeros acordes nos transporta a un universo sonoro completamente nuevo, pero que mantiene esa esencia oscura y melancólica que ha definido su carrera.",
      "La producción, a cargo de Max Martin y Oscar Holter, alcanza niveles cinematográficos. Cada pista se siente como una escena de una película que aún no existe, con capas de sintetizadores que evocan los mejores momentos del synth-pop de los 80.",
      "El disco abre con 'Dawn of Despair', un tema de 6 minutos que construye lentamente hasta un clímax emocional devastador. La voz de Abel nunca había sonado tan vulnerable y al mismo tiempo tan poderosa.",
      "Destacan también 'Neon Hearts' y 'Last Dance in Paradise', dos canciones que podrían convertirse en himnos generacionales. La primera es un medio tiempo perfecto para contemplar la ciudad de noche, mientras que la segunda es pura euforia controlada.",
      "En conclusión, 'Midnight Shadows' no es solo un álbum más en la discografía de The Weeknd. Es una declaración artística que lo consolida como uno de los artistas más importantes de nuestra era. Puntuación: 9.5/10"
    ],
    relatedTracks: [
      { name: "Dawn of Despair", artist: "The Weeknd" },
      { name: "Neon Hearts", artist: "The Weeknd" },
      { name: "Last Dance in Paradise", artist: "The Weeknd" },
    ]
  },
  "tendencias-musicales-2024": {
    title: "El Resurgimiento del Synth-Pop: Por qué los 80 están más vivos que nunca",
    category: "Análisis",
    author: "Elena Ritmo",
    authorAvatar: "/placeholder-user.jpg",
    date: "12 Enero 2024",
    readTime: "5 min",
    image: "/neon-city-night-synthwave-album-cover.jpg",
    content: [
      "El synth-pop está viviendo una segunda edad dorada. Artistas como Dua Lipa, The Weeknd, y una nueva generación de productores están devolviendo el brillo a los sintetizadores analógicos y las baterías electrónicas.",
      "Todo comenzó con 'Future Nostalgia' en 2020, un álbum que demostró que los sonidos de los 80 podían sonar frescos y modernos. Desde entonces, las listas de éxitos se han llenado de bajos pulsantes y arpegiadores cristalinos.",
      "Pero, ¿por qué esta obsesión con el pasado? Los expertos señalan que en tiempos de incertidumbre, la música nostálgica ofrece confort. Los 80 representan una era de optimismo tecnológico que contrasta con la ansiedad digital actual.",
      "Artistas emergentes como Men I Trust, Jungle y Parcels están llevando el género a nuevos territorios, fusionando la estética retro con sensibilidades contemporáneas sobre género, identidad y tecnología.",
      "El synth-pop no solo ha vuelto: ha evolucionado. Y todo indica que seguirá dominando las pistas de baile por muchos años más."
    ],
    relatedTracks: [
      { name: "Levitating", artist: "Dua Lipa" },
      { name: "Blinding Lights", artist: "The Weeknd" },
      { name: "Say Yes To Heaven", artist: "Lana Del Rey" },
    ]
  },
  "top-10-indie-2023": {
    title: "Top 10: Los álbumes Indie que definieron el 2023",
    category: "Rankings",
    author: "Sofía Indie",
    authorAvatar: "/placeholder-user.jpg",
    date: "08 Enero 2024",
    readTime: "12 min",
    image: "/psychedelic-dreamy-hazy-album-cover.jpg",
    content: [
      "El 2023 fue un año excepcional para la música independiente. Desde el bedroom pop hasta el post-punk revival, la escena indie nos regaló algunos de los discos más innovadores de la década.",
      "En el puesto #1 encontramos 'Guts' de Olivia Rodrigo, un álbum que aunque comercialmente masivo, mantiene una sensibilidad indie innegable. Sus letras crudas y su producción sin pulir lo convierten en un clásico instantáneo.",
      "Le sigue 'The Record' de boygenius, el supergrupo formado por Phoebe Bridgers, Julien Baker y Lucy Dacus. Un disco que demuestra que la colaboración artística puede producir magia.",
      "Mención especial para 'I Inside the Old Year Dying' de PJ Harvey, una obra maestra de folk experimental que nos recuerda por qué esta artista sigue siendo relevante después de tres décadas.",
      "Completan el top 5: 'Desire, I Want to Turn Into You' de caroline Polachek y 'Javelin' de Sufjan Stevens. Ambos discos exploran el amor y la pérdida con una honestidad desgarradora."
    ],
    relatedTracks: [
      { name: "vampire", artist: "Olivia Rodrigo" },
      { name: "Not Strong Enough", artist: "boygenius" },
      { name: "A Prayer for England", artist: "PJ Harvey" },
    ]
  }
}

export default function ArticleDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const article = ARTICLES_DATA[slug]
  
  if (!article) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-black mb-4">Artículo no encontrado</h1>
          <p className="text-foreground-muted mb-8">El artículo que buscas no existe o ha sido eliminado.</p>
          <Link href="/magazine" className="text-primary font-semibold hover:underline">
            ← Volver a la revista
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        {/* Back Button */}
        <Link 
          href="/magazine" 
          className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver a la revista</span>
        </Link>

        {/* Article Header */}
        <article>
          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase tracking-wide">
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-muted mb-8">
            <div className="flex items-center gap-2">
              <img 
                src={article.authorAvatar} 
                alt={article.author}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-medium text-foreground">{article.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{article.readTime} de lectura</span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-8">
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Social Actions */}
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-border/50">
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium hover:border-primary/50 transition-colors">
              <ThumbsUp className="w-4 h-4" />
              <span>Me gusta</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium hover:border-primary/50 transition-colors">
              <Bookmark className="w-4 h-4" />
              <span>Guardar</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium hover:border-primary/50 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Compartir</span>
            </button>
          </div>

          {/* Article Content */}
          <div className="prose prose-invert prose-lg max-w-none mb-12">
            {article.content.map((paragraph, index) => (
              <p key={index} className="text-foreground/90 leading-relaxed mb-6">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Ad Slot */}
          <AdSlot type="banner" className="mb-12" />

          {/* Related Tracks */}
          <div className="bg-card/50 border border-border/50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">🎵 Canciones mencionadas</h3>
            <div className="space-y-3">
              {article.relatedTracks.map((track, index) => (
                <Link 
                  key={index}
                  href={`/search?q=${encodeURIComponent(track.name + " " + track.artist)}`}
                  className="flex items-center gap-3 p-3 bg-background/50 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{track.name}</p>
                    <p className="text-xs text-foreground-muted truncate">{track.artist}</p>
                  </div>
                  <Search className="w-4 h-4 text-foreground-muted group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Author Bio */}
          <div className="bg-card/30 border border-border/50 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <img 
                src={article.authorAvatar} 
                alt={article.author}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <p className="text-xs text-foreground-muted uppercase tracking-wide mb-1">Escrito por</p>
                <h4 className="font-bold text-lg mb-2">{article.author}</h4>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  Crítico musical y colaborador de Orpheus Magazine. Especializado en música electrónica, R&B y las tendencias que definen la cultura pop contemporánea.
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </MainLayout>
  )
}
