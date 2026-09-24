'use client'

import { Bell, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface TopbarProps {
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
}

export function Topbar({ title, subtitle, actionLabel, onAction }: TopbarProps) {
  const today = new Date()
  const dateStr = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-white/80 px-6 backdrop-blur-sm">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-[12px] text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente, cliente..."
            className="h-9 w-64 pl-9"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <Badge
            variant="destructive"
            className="absolute right-1 top-1 h-4 min-w-4 px-1 text-[9px]"
          >
            3
          </Badge>
        </Button>

        <div className="hidden lg:flex flex-col items-end text-right">
          <span className="text-[12px] font-medium text-foreground capitalize">{dateStr}</span>
          <span className="text-[11px] text-muted-foreground">Clínica VetCare Centro</span>
        </div>

        {actionLabel && (
          <Button onClick={onAction} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </div>
    </header>
  )
}
