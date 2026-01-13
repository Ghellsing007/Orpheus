"use client"

import { useSettings } from "@/contexts/settings-context"
import { cn } from "@/lib/utils"

interface AdSlotProps {
  type: "banner" | "sidebar" | "video" | "square" | "horizontal"
  className?: string
}

export function AdSlot({ type, className }: AdSlotProps) {
  const { role } = useSettings()

  // Si el usuario es premium, no mostrar anuncios
  if (role === "premium") return null

  return (
    <div
      className={cn(
        "bg-card/40 border border-border/50 rounded-xl flex items-center justify-center overflow-hidden transition-all group hover:border-primary/20",
        type === "banner" && "w-full h-24 md:h-28 my-4",
        type === "horizontal" && "w-full h-20 md:h-24",
        type === "sidebar" && "w-full aspect-square md:aspect-[4/5] p-2",
        type === "square" && "aspect-square w-full max-w-[300px]",
        className,
      )}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4 text-center">
        <span className="absolute top-2 left-2 text-[9px] text-foreground-muted uppercase tracking-[0.2em] font-semibold">
          Anuncio
        </span>
        
        <div className="flex flex-col items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
             <span className="text-[10px] font-bold">$</span>
           </div>
           <div className="text-xs font-medium text-foreground-subtle">Espacio Publicitario</div>
           <p className="text-[10px] text-foreground-muted max-w-[200px] leading-tight">
             Suscríbete a Orpheus Premium para disfrutar de música sin interrupciones.
           </p>
        </div>
        
        {/* Google AdSense Unit */}
        <div className="w-full flex justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%", height: "100%" }}
            data-ad-client="ca-pub-2109167817151815"
            data-ad-slot="auto"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
      </div>
    </div>
  )
}
