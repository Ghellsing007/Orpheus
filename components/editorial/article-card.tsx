"use client"

import { ChevronRight, Clock, User } from "lucide-react"
import Link from "next/link"

interface ArticleCardProps {
  id: string
  title: string
  excerpt: string
  category: string
  author: string
  date: string
  image: string
  readTime: string
}

export function ArticleCard({ id, title, excerpt, category, author, date, image, readTime }: ArticleCardProps) {
  return (
    <Link 
      href={`/magazine/${id}`}
      className="group flex flex-col bg-card/40 border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 px-3 py-1 bg-background/80 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20">
          {category}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-3 text-[10px] text-foreground-muted mb-3">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {author}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {readTime}
          </div>
        </div>

        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        
        <p className="text-sm text-foreground-muted line-clamp-3 mb-4 flex-1">
          {excerpt}
        </p>

        <div className="flex items-center text-primary text-xs font-semibold gap-1 group-hover:gap-2 transition-all">
          Leer más <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}
