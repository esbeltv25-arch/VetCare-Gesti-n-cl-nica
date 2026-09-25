'use client'

import { Stethoscope, UserRound, ArrowLeftRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ViewMode } from '@/app/page'

interface ViewSwitcherProps {
  view: ViewMode
  onChange: (v: ViewMode) => void
  /**
   * 'sidebar' — compacto, vertical, para colocar al pie del sidebar (modo staff).
   * 'header' — inline horizontal, para colocar en la cabecera del portal cliente.
   * 'floating' — botón flotante fixed (legacy, no recomendado).
   */
  variant?: 'sidebar' | 'header' | 'floating'
}

export function ViewSwitcher({ view, onChange, variant = 'sidebar' }: ViewSwitcherProps) {
  if (variant === 'floating') {
    // Legacy floating button (mantenido solo para retrocompatibilidad, no usar)
    return (
      <div className="fixed top-3 right-4 z-50 flex items-center gap-1 rounded-full border border-border bg-white/90 backdrop-blur-sm p-1 shadow-sm">
        <SwitcherButton view={view} onChange={onChange} mode="staff" compact />
        <SwitcherButton view={view} onChange={onChange} mode="client" compact />
      </div>
    )
  }

  if (variant === 'header') {
    // Inline horizontal para cabecera del portal cliente
    return (
      <div className="flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1">
        <SwitcherButton view={view} onChange={onChange} mode="staff" compact />
        <SwitcherButton view={view} onChange={onChange} mode="client" compact />
      </div>
    )
  }

  // variant === 'sidebar' (default)
  // Tarjeta vertical compacta para el pie del sidebar de staff
  return (
    <div className="m-3 rounded-xl border border-border bg-gradient-to-br from-emerald-50 to-violet-50 p-2">
      <div className="flex items-center gap-1.5 px-1.5 pb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <ArrowLeftRight className="h-3 w-3" />
        Cambiar de vista
      </div>
      <div className="space-y-1">
        <SwitcherButton view={view} onChange={onChange} mode="staff" block />
        <SwitcherButton view={view} onChange={onChange} mode="client" block />
      </div>
    </div>
  )
}

interface SwitcherButtonProps {
  view: ViewMode
  onChange: (v: ViewMode) => void
  mode: ViewMode
  compact?: boolean
  block?: boolean
}

function SwitcherButton({ view, onChange, mode, compact, block }: SwitcherButtonProps) {
  const isActive = view === mode
  const Icon = mode === 'staff' ? Stethoscope : UserRound
  const label = mode === 'staff' ? 'Personal clínica' : 'Portal cliente'
  const activeClass = mode === 'staff' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-violet-600 text-white shadow-sm'
  const inactiveClass = 'text-muted-foreground hover:text-foreground hover:bg-muted/50'

  return (
    <button
      onClick={() => onChange(mode)}
      className={cn(
        'flex items-center gap-1.5 rounded-lg font-medium transition-all',
        compact ? 'px-3 py-1.5 text-[12px]' : 'px-2.5 py-2 text-[12px]',
        block && 'w-full justify-start',
        isActive ? activeClass : inactiveClass
      )}
      title={label}
    >
      <Icon className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4', 'shrink-0')} />
      <span className="truncate">{label}</span>
    </button>
  )
}
