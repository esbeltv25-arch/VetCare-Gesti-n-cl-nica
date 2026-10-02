'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  Dog,
  Users,
  Calendar,
  Package,
  Receipt,
  UserCog,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserRound,
  HelpCircle,
  BedDouble,
  Palette,
  Moon,
  Sun,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { appointments, inventory } from '@/lib/vet-data'
import { ViewSwitcher } from '@/components/vet/view-switcher'
import { useClinicSettings, useApplyClinicSettings, useTranslation } from '@/lib/vet-clinic-hooks'
import type { ViewMode } from '@/app/page'

interface SidebarProps {
  active: string
  onChange: (key: any) => void
  view: ViewMode
  onViewChange: (v: ViewMode) => void
  onOpenGuide?: () => void
  onOpenSettings?: () => void
}

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { key: 'patients', label: 'Pacientes', icon: Dog, badge: '10' },
  { key: 'clients', label: 'Clientes', icon: Users, badge: '7' },
  { key: 'appointments', label: 'Agenda', icon: Calendar, badge: '12' },
  { key: 'emr', label: 'Historia Clínica', icon: Stethoscope, badge: 'IA' },
  { key: 'hospitalization', label: 'Internación', icon: BedDouble, badge: 'live' },
  { key: 'inventory', label: 'Inventario', icon: Package, badge: '!' },
  { key: 'billing', label: 'Facturación', icon: Receipt, badge: null },
  { key: 'staff', label: 'Personal', icon: UserCog, badge: null },
]

export function Sidebar({ active, onChange, view, onViewChange, onOpenGuide, onOpenSettings }: SidebarProps) {
  useApplyClinicSettings()
  const { data: settings } = useClinicSettings()
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const todaysAppointments = appointments.filter(
    a => a.date === today && a.status === t('status.confirmed')
  ).length
  const lowStockItems = inventory.filter(i => i.stock <= i.minStock).length

  return (
    <aside
      className={cn(
        'flex flex-col bg-white border-r border-border transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo + help */}
      <div className="flex items-center gap-3 p-4 border-b border-border h-16">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ background: settings?.primaryColor || '#10b981' }}
        >
          <Stethoscope className="h-6 w-6" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">{settings?.brandName || 'VetCare'}</span>
            <span className="text-[11px] text-muted-foreground">{settings?.brandSubtitle || 'Gestión clínica'}</span>
          </div>
        )}
        {onOpenSettings && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
            onClick={onOpenSettings}
            title="Personalizar"
          >
            <Palette className="h-4 w-4" />
          </Button>
        )}
        {onOpenGuide && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
            onClick={onOpenGuide}
            title="Abrir guía"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed(c => !c)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = active === item.key
          const displayLabel = settings?.moduleLabels?.[item.key] || t(`sidebar.${item.key}`)
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'shadow-sm text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center'
              )}
              style={isActive ? {
                background: `color-mix(in srgb, ${settings?.primaryColor || '#10b981'} 12%, white)`,
                color: settings?.primaryColor || '#10b981',
              } : undefined}
              title={collapsed ? displayLabel : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{displayLabel}</span>
                  {item.badge && (
                    <Badge
                      variant={item.badge === '!' ? 'destructive' : 'secondary'}
                      className={cn(
                        'h-5 min-w-5 justify-center px-1.5 text-[10px]',
                        item.badge === 'IA' && 'bg-violet-100 text-violet-700 hover:bg-violet-100',
                        item.badge === 'live' && 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                      )}
                    >
                      {item.badge === 'IA' && <Sparkles className="h-2.5 w-2.5 mr-0.5" />}
                      {item.badge === 'live' && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-0.5" />
                      )}
                      {item.badge === 'live' ? 'LIVE' : item.badge}
                    </Badge>
                  )}
                </>
              )}
            </button>
          )
        })}
      </nav>

      {/* Today summary */}
      {!collapsed && (
        <div className="m-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-50">
            Hoy
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-bold leading-none">{todaysAppointments}</span>
            <span className="text-xs text-emerald-50 pb-0.5">citas confirmadas</span>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-emerald-400/30 pt-2">
            <span className="text-[11px] text-emerald-50">Stock bajo</span>
            <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-[10px]">
              {lowStockItems}
            </Badge>
          </div>
        </div>
      )}

      {/* View switcher (staff → client) */}
      {!collapsed && <ViewSwitcher view={view} onChange={onViewChange} variant="sidebar" />}
      {collapsed && (
        <div className="m-3 flex justify-center">
          <button
            onClick={() => onViewChange('client')}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-700"
            title="Ir a Portal cliente"
          >
            <UserRound className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* User */}
      <div className="border-t border-border p-3">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
            CV
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-medium text-foreground">Carmen Vega</span>
              <span className="truncate text-[11px] text-muted-foreground">Administrador</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
