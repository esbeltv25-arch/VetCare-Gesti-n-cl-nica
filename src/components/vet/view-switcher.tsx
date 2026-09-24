'use client'

import { Stethoscope, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ViewMode } from '@/app/page'

interface ViewSwitcherProps {
  view: ViewMode
  onChange: (v: ViewMode) => void
}

export function ViewSwitcher({ view, onChange }: ViewSwitcherProps) {
  return (
    <div className="fixed top-3 right-4 z-50 flex items-center gap-1 rounded-full border border-border bg-white/90 backdrop-blur-sm p-1 shadow-sm">
      <button
        onClick={() => onChange('staff')}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-all',
          view === 'staff'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Stethoscope className="h-3.5 w-3.5" />
        Personal clínica
      </button>
      <button
        onClick={() => onChange('client')}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-all',
          view === 'client'
            ? 'bg-violet-600 text-white shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <UserRound className="h-3.5 w-3.5" />
        Portal cliente
      </button>
    </div>
  )
}
