'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Download,
  Search,
  Sparkles,
  Stethoscope,
  Home,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

const CALLOUT_STYLES: Record<string, { bg: string; border: string; icon: string; title: string; text: string }> = {
  info: { bg: 'bg-sky-50', border: 'border-sky-200', icon: 'ℹ️', title: 'text-sky-800', text: 'text-slate-700' },
  warning: { bg: 'bg-rose-50', border: 'border-rose-200', icon: '⚠️', title: 'text-rose-800', text: 'text-slate-700' },
  tip: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '💡', title: 'text-amber-800', text: 'text-slate-700' },
  ai: { bg: 'bg-violet-50', border: 'border-violet-200', icon: '✨', title: 'text-violet-800', text: 'text-slate-700' },
}

export function GuideModal({ open, onOpenChange }: GuideModalProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>('intro')
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Flatten sections
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

  // ESC to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
      if (e.key === 'ArrowLeft') navigate(-1)
      if (e.key === 'ArrowRight') navigate(1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, activeIndex])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSearch('')
    }
  }, [open])

  // Lock body scroll while modal open
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] bg-white flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'shrink-0 border-r border-border bg-slate-50 flex flex-col transition-all duration-300',
          sidebarOpen ? 'w-80' : 'w-0 border-r-0'
        )}
      >
        {sidebarOpen && (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-violet-500 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">Guía VetCare</p>
                  <p className="text-[11px] text-muted-foreground">Manual completo · {allSections.length} secciones</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar en la guía..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-9 pl-9"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Intro */}
              {search.trim() === '' && (
                <button
                  onClick={() => setActiveSectionId('intro')}
                  className={cn(
                    'w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors',
                    activeSectionId === 'intro'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'hover:bg-slate-100 text-foreground'
                  )}
                >
                  <Home className="h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Introducción</p>
                    <p className="text-[11px] text-muted-foreground">Resumen y cómo usar la guía</p>
                  </div>
                </button>
              )}

              {GUIDE_CHAPTERS.filter(c => search.trim() === '' || c.sections.some(s =>
                filteredSections.some(fs => fs.section.id === s.id)
              )).map(chapter => (
                <div key={chapter.id}>
                  <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                    <Badge variant="outline" className={cn('text-[10px] px-1.5', AUDIENCE_STYLES[chapter.audience])}>
                      {AUDIENCE_LABELS[chapter.audience]}
                    </Badge>
                    <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 truncate">
                      {chapter.title}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {chapter.sections
                      .filter(s => search.trim() === '' || filteredSections.some(fs => fs.section.id === s.id))
                      .map(section => (
                        <button
                          key={section.id}
                          onClick={() => setActiveSectionId(section.id)}
                          className={cn(
                            'w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-left transition-colors',
                            activeSectionId === section.id
                              ? 'bg-emerald-100 text-emerald-700 border-l-2 border-emerald-600'
                              : 'hover:bg-slate-100 text-foreground'
                          )}
                        >
                          <span className="text-base shrink-0">{section.icon}</span>
                          <span className="text-[13px] font-medium truncate">{section.title}</span>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Download PDF */}
            <div className="p-3 border-t border-border space-y-2">
              <Button size="sm" variant="outline" className="w-full" asChild>
                <a href="/guia-vetcare.pdf" target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </a>
              </Button>
            </div>
          </>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-2 px-6 h-14 border-b border-border bg-white shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setSidebarOpen(s => !s)}
            title={sidebarOpen ? 'Ocultar índice' : 'Mostrar índice'}
          >
            {sidebarOpen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => navigate(-1)}
              disabled={activeSectionId === 'intro'}
              title="Sección anterior (←)"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-[12px] text-muted-foreground min-w-[60px] text-center">
              {activeSectionId === 'intro'
                ? 'Portada'
                : `${activeIndex + 1} / ${allSections.length}`}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => navigate(1)}
              disabled={activeIndex === allSections.length - 1}
              title="Sección siguiente (→)"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Keyboard hint */}
          <div className="hidden lg:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-md bg-slate-100 text-[11px] text-slate-500">
            <kbd className="font-mono">←</kbd>
            <kbd className="font-mono">→</kbd>
            <span>navegar</span>
            <span className="mx-1">·</span>
            <kbd className="font-mono">Esc</kbd>
            <span>cerrar</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <a href="/guia-vetcare.pdf" target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">PDF</span>
              </a>
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onOpenChange(false)} title="Cerrar (Esc)">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Body: scrollable reading area */}
        <div className="flex-1 overflow-y-auto">
          {activeSectionId === 'intro' ? (
            <IntroPage />
          ) : active ? (
            <SectionContent section={active.section} chapter={active.chapter} />
          ) : null}
        </div>
      </main>
    </div>
  )
}

function IntroPage() {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-emerald-700 px-8 py-16 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Stethoscope className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-violet-100 font-medium uppercase tracking-wide">Manual de usuario</p>
              <h1 className="text-5xl font-bold">{GUIDE_INTRO.title}</h1>
            </div>
          </div>
          <p className="text-lg text-violet-50 leading-relaxed max-w-3xl">
            {GUIDE_INTRO.subtitle}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <p className="text-base text-slate-700 leading-relaxed mb-8">
          {GUIDE_INTRO.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {GUIDE_INTRO.stats.map(stat => (
            <div key={stat.label} className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
              <p className="text-3xl font-bold text-emerald-600">{stat.value}</p>
              <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Chapters overview */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Estructura de la guía</h2>
        <p className="text-base text-slate-700 mb-6 leading-relaxed">
          La guía está dividida en {GUIDE_CHAPTERS.length} capítulos, organizados por audiencia. Cada sección incluye descripción, features clave, flujos numerados cuando hay un procedimiento principal, y callouts (consejos, advertencias, notas IA).
        </p>

        <div className="space-y-4 mb-12">
          {GUIDE_CHAPTERS.map(chapter => (
            <div
              key={chapter.id}
              className="rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={cn('text-[11px] px-2 py-0.5', AUDIENCE_STYLES[chapter.audience])}>
                  {AUDIENCE_LABELS[chapter.audience]}
                </Badge>
                <p className="text-lg font-semibold text-slate-900">{chapter.title}</p>
                <span className="ml-auto text-[12px] text-slate-500">
                  {chapter.sections.length} secciones
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{chapter.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {chapter.sections.map(s => (
                  <span key={s.id} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {s.icon} {s.title}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* IA callout */}
        <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <p className="text-base font-semibold text-violet-800">Copiloto IA integrado</p>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            La IA está mencionada en cada módulo donde aplica (no tiene sección propia): dictado de consultas en EMR, anamnesis adaptativa, diagnósticos diferenciales, detección de patrones, dosis por peso, y resumen automático de telemedicina. Las sugerencias IA son siempre eso: sugerencias. El veterinario mantiene la responsabilidad clínica.
          </p>
        </div>
      </div>
    </div>
  )
}

function SectionContent({ section, chapter }: { section: GuideSection; chapter: GuideChapter }) {
  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className={cn('text-[11px] px-2 py-0.5', AUDIENCE_STYLES[chapter.audience])}>
          {AUDIENCE_LABELS[chapter.audience]}
        </Badge>
        <span className="text-[12px] text-slate-400">/</span>
        <span className="text-[12px] text-slate-500">{chapter.title}</span>
      </div>

      {/* Title */}
      <div className="flex items-center gap-4 mb-2">
        <span className="text-5xl">{section.icon}</span>
        <h1 className="text-4xl font-bold text-slate-900">{section.title}</h1>
      </div>
      {section.subtitle && (
        <p className="text-lg text-slate-500 mb-8 leading-relaxed">{section.subtitle}</p>
      )}

      {/* Blocks */}
      <div className="space-y-5">
        {section.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>

      {/* Bottom navigation */}
      <div className="mt-12 pt-6 border-t border-slate-200 text-[13px] text-slate-500">
        Fin de la sección «{section.title}». Usa las flechas <kbd className="px-1.5 py-0.5 rounded border border-slate-300 bg-slate-50 font-mono text-[11px]">←</kbd> <kbd className="px-1.5 py-0.5 rounded border border-slate-300 bg-slate-50 font-mono text-[11px]">→</kbd> para navegar.
      </div>
    </div>
  )
}

function BlockRenderer({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-[15px] text-slate-700 leading-relaxed">
          {block.text}
        </p>
      )

    case 'list':
      return (
        <ul className="space-y-2.5 my-2">
          {block.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[15px] text-slate-700 leading-relaxed">
              <span className="text-emerald-600 mt-1.5 shrink-0">▸</span>
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ul>
      )

    case 'steps':
      return (
        <ol className="space-y-4 my-4">
          {block.steps?.map((step, i) => (
            <li key={i} className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-bold">
                {i + 1}
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-[15px] font-semibold text-slate-900 mb-1">{step.title}</p>
                <p className="text-[14px] text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      )

    case 'callout': {
      const style = block.variant ? CALLOUT_STYLES[block.variant] : CALLOUT_STYLES.info
      const titles: Record<string, string> = {
        info: 'Información',
        warning: 'Atención',
        tip: 'Consejo',
        ai: 'Copiloto IA',
      }
      const title = block.variant ? titles[block.variant] : 'Nota'
      return (
        <div className={cn('rounded-lg border-2 p-5 flex items-start gap-3', style.bg, style.border)}>
          <span className="text-2xl shrink-0 leading-none mt-0.5">{style.icon}</span>
          <div className="flex-1">
            <p className={cn('text-[11px] font-bold uppercase tracking-wide mb-1.5', style.title)}>{title}</p>
            <p className={cn('text-[14px] leading-relaxed', style.text)}>{block.text}</p>
          </div>
        </div>
      )
    }

    case 'code':
      return (
        <pre className="rounded-lg bg-slate-900 text-slate-100 p-4 overflow-x-auto text-[12px] font-mono leading-relaxed my-3">
          <code>{block.text}</code>
        </pre>
      )

    case 'kbd':
      return (
        <kbd className="rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-[13px] font-mono">
          {block.text}
        </kbd>
      )

    default:
      return null
  }
}
