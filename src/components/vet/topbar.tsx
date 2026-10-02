'use client'

import { useState } from 'react'
import { Bell, Search, Plus, PackageX, Clock, AlertTriangle, DollarSign, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useDashboard } from '@/lib/vet-hooks'
import { useTranslation, useClinicSettings } from '@/lib/vet-clinic-hooks'
import { formatCurrency, formatDate, daysUntil } from '@/lib/vet-data'
import type { ModuleKey } from '@/app/page'
import type { Language } from '@/lib/i18n'

const DATE_LOCALES: Record<string, string> = {
  es: 'es-ES', en: 'en-US', fr: 'fr-FR', de: 'de-DE',
  pt: 'pt-PT', 'pt-BR': 'pt-BR', it: 'it-IT', ca: 'ca-ES',
}

interface TopbarProps {
  title: string
  moduleKey?: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
  onNavigate?: (key: ModuleKey) => void
}

interface NotificationItem {
  id: string
  icon: any
  color: string
  bgColor: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'critical'
  module?: ModuleKey
}

export function Topbar({ title, moduleKey, subtitle, actionLabel, onAction, onNavigate }: TopbarProps) {
  const [open, setOpen] = useState(false)
  const { data: dashboard } = useDashboard()
  const { t, lang } = useTranslation()
  const { data: settings } = useClinicSettings()

  const today = new Date()
  const locale = DATE_LOCALES[lang] || 'es-ES'
  const dateStr = today.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  // Construir notificaciones reales
  const notifications: NotificationItem[] = []

  if (dashboard) {
    dashboard.lowStock?.forEach((item: any) => {
      notifications.push({
        id: `stock-${item.id}`,
        icon: PackageX,
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        title: `${t('dashboard.lowStock')}: ${item.name}`,
        description: `${item.stock} ${item.unit} (min: ${item.minStock})`,
        severity: 'critical',
        module: 'inventory',
      })
    })

    dashboard.expiringSoon?.forEach((item: any) => {
      const days = daysUntil(item.expiryDate!)
      notifications.push({
        id: `expiry-${item.id}`,
        icon: Clock,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        title: `${t('dashboard.expiringSoon')}: ${item.name}`,
        description: `${days}d (${formatDate(item.expiryDate!)})`,
        severity: 'warning',
        module: 'inventory',
      })
    })

    dashboard.expired?.forEach((item: any) => {
      notifications.push({
        id: `expired-${item.id}`,
        icon: AlertTriangle,
        color: 'text-rose-700',
        bgColor: 'bg-rose-100',
        title: `${t('inv.expired').toUpperCase()}: ${item.name}`,
        description: formatDate(item.expiryDate!),
        severity: 'critical',
        module: 'inventory',
      })
    })

    if (dashboard.pendingInvoices > 0) {
      notifications.push({
        id: 'inv-pending',
        icon: DollarSign,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        title: `${dashboard.pendingInvoices} ${t('dashboard.pendingPayment')}`,
        description: t('bill.requiresManagement'),
        severity: 'warning',
        module: 'billing',
      })
    }

    if (dashboard.overdueInvoices > 0) {
      notifications.push({
        id: 'inv-overdue',
        icon: DollarSign,
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        title: `${dashboard.overdueInvoices} ${t('dashboard.overdue')}`,
        description: t('bill.requiresManagement'),
        severity: 'critical',
        module: 'billing',
      })
    }

    dashboard.criticalPets?.forEach((pet: any) => {
      const statusKey = pet.status === t('status.critical') ? 'status.critical' : 'status.treatment'
      const statusLabel = t(statusKey)
      notifications.push({
        id: `pet-${pet.id}`,
        icon: AlertTriangle,
        color: pet.status === t('status.critical') ? 'text-rose-600' : 'text-amber-600',
        bgColor: pet.status === t('status.critical') ? 'bg-rose-50' : 'bg-amber-50',
        title: `${pet.name} — ${statusLabel}`,
        description: t('dashboard.criticalPatients'),
        severity: pet.status === t('status.critical') ? 'critical' : 'warning',
        module: 'patients',
      })
    })
  }

  const criticalCount = notifications.filter(n => n.severity === 'critical').length
  const totalCount = notifications.length

  function handleNotifClick(n: NotificationItem) {
    setOpen(false)
    if (n.module && onNavigate) {
      onNavigate(n.module)
    }
  }

  // Resolver título con override → traducción → fallback
  const displayTitle = settings?.moduleLabels?.[moduleKey || ''] || t(`sidebar.${moduleKey}`) || title

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-foreground">{displayTitle}</h1>
        {subtitle && (
          <p className="text-[12px] text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('topbar.search')}
            className="h-9 w-64 pl-9"
          />
        </div>

        {/* Notification bell */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {totalCount > 0 && (
                <Badge
                  variant={criticalCount > 0 ? 'destructive' : 'secondary'}
                  className={cn(
                    'absolute right-1 top-1 h-4 min-w-4 justify-center px-1 text-[9px]',
                    criticalCount === 0 && 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                  )}
                >
                  {totalCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{t('topbar.notifications')}</p>
                <p className="text-[11px] text-muted-foreground">
                  {totalCount > 0
                    ? `${totalCount} ${t('topbar.alertsActive')}`
                    : t('topbar.noNotificationsDesc')}
                </p>
              </div>
              {criticalCount > 0 && (
                <Badge variant="destructive" className="text-[10px]">
                  {criticalCount} {t('topbar.critical')}
                </Badge>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">{t('topbar.noNotifications')}</p>
                <p className="text-[11px] text-muted-foreground/70 mt-1">
                  {t('topbar.noNotificationsDesc')}
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="divide-y divide-border">
                  {notifications.map((n) => {
                    const Icon = n.icon
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', n.bgColor)}>
                          <Icon className={cn('h-4 w-4', n.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-foreground truncate">{n.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{n.description}</p>
                          {n.module && (
                            <Badge variant="outline" className="mt-1 text-[9px] opacity-60">
                              {t(`sidebar.${n.module}`)}
                            </Badge>
                          )}
                        </div>
                        {n.severity === 'critical' && (
                          <div className="h-2 w-2 rounded-full bg-rose-500 shrink-0 mt-1" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            )}

            {notifications.length > 0 && (
              <div className="border-t border-border px-4 py-2 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{t('topbar.clickToNavigate')}</span>
                <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setOpen(false)}>
                  <X className="h-3 w-3" /> {t('common.close')}
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <div className="hidden lg:flex flex-col items-end text-right">
          <span className="text-[12px] font-medium text-foreground capitalize">{dateStr}</span>
          <span className="text-[11px] text-muted-foreground">
            {settings?.brandName || 'VetCare'} · {settings?.brandSubtitle || t('sidebar.gestionClinica')}
          </span>
        </div>

        {actionLabel && (
          <Button onClick={onAction} className="text-white" style={{ background: settings?.primaryColor || '#10b981' }}>
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </div>
    </header>
  )
}
