import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { UpdateModal } from "@/components/updates/update-modal"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Orpheus - Disfruta tu música",
  description: "Orpheus es una plataforma web que permite descubrir y escuchar música en una interfaz moderna tipo streaming. Los usuarios pueden explorar artistas, tendencias y géneros, crear listas de reproducción y disfrutar de una experiencia optimizada para música.",
  applicationName: "Orpheus",
  manifest: "/manifest.json",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Orpheus",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      { url: "/icon-maskable-192.png", type: "image/png", sizes: "192x192", purpose: "maskable" },
      { url: "/icon-maskable-512.png", type: "image/png", sizes: "512x512", purpose: "maskable" },
    ],
    apple: "/apple-icon-180.png",
    shortcut: "/icon-192.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#0d0f14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

import { InitialLoader } from "@/components/ui/initial-loader"
import Script from "next/script"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Orpheus" />
        
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <InitialLoader />
        <Providers>{children}</Providers>
        <InstallPrompt />
        <UpdateModal />
        
        {/* Scripts de Terceros con next/script para evitar errores de hidratacion */}
        <Script 
          defer 
          src="https://umami.gvslabs.cloud/script.js" 
          data-website-id="85302052-7bec-42b5-8aed-e2a8d0f5c232"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
