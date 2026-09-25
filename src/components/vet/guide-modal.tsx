'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Download,
  Search,
  Sparkles,
  Dog,
  Users,
  Calendar,
  Stethoscope,
  Package,
  Receipt,
  UserCog,
  LayoutDashboard,
  Settings,
  Home,
  Video,
  Phone,
  Lock,
  Cpu,
  Database,
  Plug,
  Wrench,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  GUIDE_CHAPTERS,
  GUIDE_INTRO,
  type GuideBlock,
  type GuideSection,
  type GuideChapter,
} from '@/lib/guide-content'

interface GuideModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AUDIENCE_STYLES: Record<string, string> = {
  staff: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  owner: 'bg-violet-100 text-violet-700 border-violet-200',
  admin: 'bg-sky-100 text-sky-700 border-sky-200',
  all: 'bg-amber-100 text-amber-700 border-amber-200',
}

const AUDIENCE_LABELS: Record<string, string> = {
  staff: 'Personal clínico',
  owner: 'Dueño',
  admin: 'Admin/IT',
  all: 'Todos',
}

const CALLOUT_STYLES: Record<string, { bg: string; border: string; icon: string; title: string }> = {
  info: { bg: 'bg-sky-50', border: 'border-sky-200', icon: 'ℹ️', title: 'Información' },
  warning: { bg: 'bg-rose-50', border: 'border-rose-200', icon: '⚠️', title: 'Atención' },
  tip: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '💡', title: 'Consejo' },
  ai: { bg: 'bg-violet-50', border: 'border-violet-200', icon: '✨', title: 'Copiloto IA' },
}

export function GuideModal({ open, onOpenChange }: GuideModalProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>('intro')
  const [search, setSearch] = useState('')

  // Flatten sections for navigation
  const allSections = useMemo(() => {
    const flat: Array<{ section: GuideSection; chapter: GuideChapter; index: number }> = []
    let index = 0
    GUIDE_CHAPTERS.forEach(chapter => {
      chapter.sections.forEach(section => {
        flat.push({ section, chapter, index: index++ })
      })
    })
    return flat
  }, [])

  // Filter by search
  const filteredSections = useMemo(() => {
    if (!search.trim()) return allSections
    const q = search.toLowerCase()
    return allSections.filter(({ section }) =>
      section.title.toLowerCase().includes(q) ||
      section.subtitle?.toLowerCase().includes(q) ||
      section.blocks.some(b =>
        b.text?.toLowerCase().includes(q) ||
        b.items?.some(i => i.toLowerCase().includes(q))
      )
    )
  }, [search, allSections])

  const activeIndex = useMemo(() => {
    if (activeSectionId === 'intro') return -1
    return allSections.findIndex(s => s.section.id === activeSectionId)
  }, [activeSectionId, allSections])

  const active = activeIndex >= 0 ? allSections[activeIndex] : null

  const navigate = (direction: number) => {
    if (activeIndex === -1 && direction === 1) {
      setActiveSectionId(allSections[0].section.id)
      return
    }
    if (activeIndex === -1 && direction === -1) return
    const newIndex = activeIndex + direction
    if (newIndex < 0) {
      setActiveSectionId('intro')
    } else if (newIndex < allSections.length) {
      setActiveSectionId(allSections[newIndex].section.id)
    }
  }

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSearch('')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="flex h-[85vh]">
          {/* Sidebar de navegación */}
          <aside className="w-72 shrink-0 border-r border-border bg-muted/30 flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-violet-500 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Guía VetCare</p>
                  <p className="text-[10px] text-muted-foreground">Manual completo</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar sección..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-8 pl-8 text-[12px]"
                />
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-2 space-y-3">
              {/* Intro */}
              {search.trim() === '' && (
                <button
                  onClick={() => setActiveSectionId('intro')}
                  className={cn(
                    'w-full flex items-start gap-2 rounded-md px-2.5 py-2 text-left transition-colors',
                    activeSectionId === 'intro'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <Home className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium">Introducción</p>
                    <p className="text-[10px] text-muted-foreground truncate">Resumen general</p>
                  </div>
                </button>
              )}

              {GUIDE_CHAPTERS.filter(c => search.trim() === '' || c.sections.some(s =>
                filteredSections.some(fs => fs.section.id === s.id)
              )).map(chapter => (
                <div key={chapter.id}>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    <Badge variant="outline" className={cn('text-[9px] px-1', AUDIENCE_STYLES[chapter.audience])}>
                      {AUDIENCE_LABELS[chapter.audience]}
                    </Badge>
                    <span className="truncate">{chapter.title}</span>
                  </div>
                  <div className="space-y-0.5">
                    {chapter.sections
                      .filter(s => search.trim() === '' || filteredSections.some(fs => fs.section.id === s.id))
                      .map(section => (
                        <button
                          key={section.id}
                          onClick={() => setActiveSectionId(section.id)}
                          className={cn(
                            'w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors',
                            activeSectionId === section.id
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'hover:bg-muted text-foreground'
                          )}
                        >
                          <span className="text-sm shrink-0">{section.icon}</span>
                          <span className="text-[12px] font-medium truncate">{section.title}</span>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-3 border-t border-border space-y-2">
              <Button size="sm" variant="outline" className="w-full h-8" asChild>
                <a href="/guia-vetcare.pdf" target="_blank" rel="noopener noreferrer">
                  <Download className="h-3.5 w-3.5" />
                  Descargar PDF
                </a>
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">
                {allSections.length} secciones · {GUIDE_CHAPTERS.length} capítulos
              </p>
            </div>
          </aside>

          {/* Contenido principal */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-6 h-14 border-b border-border bg-background shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigate(-1)}
                disabled={activeSectionId === 'intro'}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-[12px] text-muted-foreground">
                {activeSectionId === 'intro'
                  ? 'Portada'
                  : `${activeIndex + 1} / ${allSections.length}`}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigate(1)}
                disabled={activeIndex === allSections.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="ml-auto">
                <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)} className="h-8">
                  <X className="h-4 w-4" />
                  Cerrar
                </Button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {activeSectionId === 'intro' ? (
                <IntroPage />
              ) : active ? (
                <SectionContent
                  section={active.section}
                  chapter={active.chapter}
                />
              ) : null}
            </div>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function IntroPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-violet-500 to-violet-600 text-white shadow-lg mb-4">
          <Stethoscope className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">{GUIDE_INTRO.title}</h1>
        <p className="text-base text-muted-foreground mt-2">{GUIDE_INTRO.subtitle}</p>
      </div>

      <p className="text-[14px] text-foreground leading-relaxed mb-6">
        {GUIDE_INTRO.description}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {GUIDE_INTRO.stats.map(stat => (
          <div key={stat.label} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Cómo usar esta guía</h2>
        <p className="text-[13px] text-foreground leading-relaxed">
          La guía está dividida en {GUIDE_CHAPTERS.length} capítulos, organizados por audiencia:
        </p>
        <div className="space-y-2">
          {GUIDE_CHAPTERS.map(chapter => (
            <div
              key={chapter.id}
              className="rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={cn('text-[10px]', AUDIENCE_STYLES[chapter.audience])}>
                  {AUDIENCE_LABELS[chapter.audience]}
                </Badge>
                <p className="text-sm font-semibold text-foreground">{chapter.title}</p>
              </div>
              <p className="text-[12px] text-muted-foreground">{chapter.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-lg bg-gradient-to-br from-violet-50 to-emerald-50 border border-violet-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-violet-600" />
          <p className="text-sm font-semibold text-violet-700">Copiloto IA integrado</p>
        </div>
        <p className="text-[12px] text-violet-700/80">
          La IA está mencionada en cada módulo donde aplica (no tiene sección propia): dictado de consultas, anamnesis adaptativa, diagnósticos diferenciales, detección de patrones, dosis por peso, y resumen automático de telemedicina.
        </p>
      </div>
    </div>
  )
}

function SectionContent({ section, chapter }: { section: GuideSection; chapter: GuideChapter }) {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className={cn('text-[10px]', AUDIENCE_STYLES[chapter.audience])}>
          {AUDIENCE_LABELS[chapter.audience]}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {chapter.title}
        </Badge>
      </div>
      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">{section.icon}</span>
        <h1 className="text-2xl font-bold text-foreground">{section.title}</h1>
      </div>
      {section.subtitle && (
        <p className="text-[13px] text-muted-foreground mb-6">{section.subtitle}</p>
      )}

      <div className="space-y-4">
        {section.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>
    </div>
  )
}

function BlockRenderer({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-[13px] text-foreground leading-relaxed">
          {block.text}
        </p>
      )

    case 'list':
      return (
        <ul className="space-y-1.5">
          {block.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-foreground">
              <span className="text-emerald-600 mt-0.5">▸</span>
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ul>
      )

    case 'steps':
      return (
        <ol className="space-y-3">
          {block.steps?.map((step, i) => (
            <li key={i} className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-[12px] font-bold">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-foreground">{step.title}</p>
                <p className="text-[12px] text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      )

    case 'callout': {
      const style = block.variant ? CALLOUT_STYLES[block.variant] : CALLOUT_STYLES.info
      return (
        <div className={cn('rounded-lg border p-3 flex items-start gap-2', style.bg, style.border)}>
          <span className="text-base shrink-0">{style.icon}</span>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'inherit' }}>
              {style.title}
            </p>
            <p className="text-[13px] text-foreground">{block.text}</p>
          </div>
        </div>
      )
    }

    case 'code':
      return (
        <pre className="rounded-lg bg-slate-900 text-slate-100 p-3 overflow-x-auto text-[11px] font-mono leading-relaxed">
          <code>{block.text}</code>
        </pre>
      )

    case 'kbd':
      return (
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-mono">
          {block.text}
        </kbd>
      )

    default:
      return null
  }
}
