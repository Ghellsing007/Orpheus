import { useSettings } from "@/contexts/settings-context"
import { translations, type TranslationKey } from "@/lib/i18n"

export function useTranslations() {
    const { language } = useSettings()

    // Si por alguna razón el idioma no existe en el diccionario, por defecto español
    const t = (key: TranslationKey) => {
        const lang = (language === "en" || language === "es") ? language : "es"
        return translations[lang][key] || key
    }

    return { t, language }
}
