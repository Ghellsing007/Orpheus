"use client"

import { Home, Search, Library, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/hooks/use-translations"

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useTranslations()

  const navItems = [
    { href: "/", icon: Home, label: t("home") },
    { href: "/search", icon: Search, label: t("search") },
    { href: "/library", icon: Library, label: t("library") },
    { href: "/settings", icon: Settings, label: t("settings") },
  ]

  return (
    <nav className="w-full glass border-t border-border md:hidden flex-shrink-0">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all",
                "active:scale-95",
                isActive ? "text-primary" : "text-foreground-muted hover:text-foreground",
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "drop-shadow-[0_0_8px_var(--color-primary)]")} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
