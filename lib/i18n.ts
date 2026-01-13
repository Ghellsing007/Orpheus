export const translations = {
    es: {
        // Navigation
        home: "Inicio",
        search: "Buscar",
        library: "Biblioteca",
        settings: "Ajustes",
        config: "Configuración",

        // Auth / Sync
        comingSoon: "Próximamente",
        syncDevices: "Sincronizar cuenta",
        connectDevices: "Conecta tus dispositivos",
        syncPlaylists: "Sincroniza tus playlists",
        notifyme: "Notificarme",
        syncSoon: "Sincronización entre dispositivos próximamente",

        // Home
        welcome: "Bienvenido a Orpheus",
        discover: "Descubre nueva música",
        heroDesc: "Explora millones de canciones, crea playlists personalizadas y disfruta de la mejor experiencia musical.",
        startListening: "Comenzar a escuchar",
        featuredPlaylists: "Playlists destacadas",
        trending: "Tendencias",
        popularArtists: "Artistas populares",
        recommendations: "Recomendaciones para ti",
        recentlyPlayed: "Escuchado recientemente",

        // Settings
        language: "Idioma",
        theme: "Tema",
        accentColor: "Color de acento",
        quality: "Calidad de audio",
        autoSkipSponsor: "Saltar sponsors automáticamente",
        blockAds: "Bloqueador de anuncios",
        blockAdsDesc: "Ocultar todos los banners y anuncios de la app",
        adBlockTitle: "¿Apoyar a Orpheus?",
        adBlockMessage: "Los anuncios nos ayudan a mantener el servicio gratuito y a mejorar la app constantemente. ¿Estás seguro de que quieres bloquearlos?",
        adBlockConfirm: "Bloquear de todos modos",
        adBlockCancel: "Seguir apoyando",
        adBannerText: "Mostramos anuncios externos (no gestionados por nosotros) para mantener el soporte y el servicio gratuito. No interfieren con tu música y puedes desactivarlos en Ajustes.",
        adBannerSettings: "Ajustes",
        light: "Claro",
        dark: "Oscuro",

        // Player
        playing: "Reproduciendo",
        lyrics: "Letra",
        queue: "Cola",
        next: "Siguiente",
        previous: "Anterior",

        // Library
        yourLibrary: "Tu biblioteca",
        likedSongs: "Canciones favoritas",
        recentPlayed: "Reproducido reciente",
        createPlaylist: "Crear playlist",
        preferences: "Preferencias",

        // Misc
        community: "Comunidad",
        magazine: "Revista",
        logout: "Cerrar sesión",
        billing: "Planes y Facturación",
        help: "Ayuda",
        privacy: "Privacidad",
    },
    en: {
        // Navigation
        home: "Home",
        search: "Search",
        library: "Library",
        settings: "Settings",
        config: "Configuration",

        // Auth / Sync
        comingSoon: "Coming Soon",
        syncDevices: "Sync Account",
        connectDevices: "Connect your devices",
        syncPlaylists: "Sync your playlists",
        notifyme: "Notify me",
        syncSoon: "Device synchronization coming soon",

        // Home
        welcome: "Welcome to Orpheus",
        discover: "Discover New Music",
        heroDesc: "Explore millions of songs, create custom playlists and enjoy the best musical experience.",
        startListening: "Start Listening",
        featuredPlaylists: "Featured Playlists",
        trending: "Trending",
        popularArtists: "Popular Artists",
        recommendations: "Recommendations for you",
        recentlyPlayed: "Recently Played",

        // Settings
        language: "Language",
        theme: "Theme",
        accentColor: "Accent Color",
        quality: "Audio Quality",
        autoSkipSponsor: "Auto Skip Sponsors",
        blockAds: "Ad Blocker",
        blockAdsDesc: "Hide all banners and ads in the app",
        adBlockTitle: "Support Orpheus?",
        adBlockMessage: "Ads help us keep the service free and constantly improve the app. Are you sure you want to block them?",
        adBlockConfirm: "Block anyway",
        adBlockCancel: "Keep supporting",
        adBannerText: "We show external ads (not managed by us) to maintain background support and free service. They don't interfere with your music and can be disabled in Settings.",
        adBannerSettings: "Settings",
        light: "Light",
        dark: "Dark",

        // Player
        playing: "Now Playing",
        lyrics: "Lyrics",
        queue: "Queue",
        next: "Next",
        previous: "Previous",

        // Library
        yourLibrary: "Your Library",
        likedSongs: "Favorite Songs",
        recentPlayed: "Recently Played",
        createPlaylist: "Create Playlist",
        preferences: "Preferences",

        // Misc
        community: "Community",
        magazine: "Magazine",
        logout: "Log Out",
        billing: "Plans & Billing",
        help: "Help",
        privacy: "Privacy",
    }
}

export type TranslationKey = keyof typeof translations.es
