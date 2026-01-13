"use client"

import Script from "next/script"
import { useSettings } from "@/contexts/settings-context"

export function AdScripts() {
  const { blockAds, isHydrated } = useSettings()
  
  // No cargar nada hasta que los ajustes estén hidratados desde localStorage
  if (!isHydrated) {
    return null
  }

  // Si los anuncios están bloqueados por el usuario, no cargamos los scripts de terceros
  if (blockAds) {
    return null
  }

  // Si la variable de entorno dice que no mostremos ads de terceros, tampoco cargamos
  if (process.env.NEXT_PUBLIC_SHOW_THIRD_PARTY_ADS === "false") {
    return null
  }

  return (
    <>
      {/* Google AdSense */}
      <Script 
        id="google-adsense"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2109167817151815"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      {/* Social Bar - nap5k */}
      <Script 
        id="nap5k-social"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='10458319',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
        }}
      />
      {/* Vignette - gizokraijaw */}
      <Script 
        id="gizokraijaw-vignette"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='10458326',s.src='https://gizokraijaw.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
        }}
      />
      {/* Banner - 3nbf4 */}
      <Script 
        id="3nbf4-banner"
        src="https://3nbf4.com/act/files/tag.min.js?z=10458329"
        data-cfasync="false"
        strategy="afterInteractive"
      />
      {/* Log de ads habilitados */}
      <Script 
        id="ads-init-log"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `console.log('[Orpheus Ads] 🚀 Scripts de monetización cargados')`
        }}
      />
    </>
  )
}
