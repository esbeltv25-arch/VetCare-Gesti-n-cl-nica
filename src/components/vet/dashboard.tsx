'use client'

import {
  Dog,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Activity,
  ArrowUpRight,
  Syringe,
  PackageX,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Topbar } from '@/components/vet/topbar'
import {
  appointments,
  pets,
  clients,
  inventory,
  invoices,
  vets,
  getPet,
  getClient,
  getVet,
  formatCurrency,
  formatDate,
  daysUntil,
} from '@/lib/vet-data'
import type { ModuleKey } from '@/app/page'

interface DashboardProps {
  onNavigate: (key: ModuleKey) => void
}

const STATUS_COLORS: Record<string, string> = {
  'Sano': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'En tratamiento': 'bg-amber-100 text-amber-700 border-amber-200',
  'Crítico': 'bg-rose-100 text-rose-700 border-rose-200',
  'En observación': 'bg-sky-100 text-sky-700 border-sky-200',
}

const TYPE_ICONS: Record<string, string> = {
  'Consulta': '🩺',
  'Vacunación': '💉',
  'Cirugía': '🔬',
  'Control': '📋',
  'Urgencia': '🚨',
  'Peluquería': '✂️',
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const today = new Date().toISOString().split('T')[0]
  const todaysAppointments = appointments
    .filter(a => a.date === today)
    .sort((a, b) => a.time.localeCompare(b.time))

  const monthlyRevenue = invoices
    .filter(i => i.status === 'Pagada')
    .reduce((sum, i) => sum + i.total, 0)

  const pendingInvoices = invoices.filter(i => i.status === 'Pendiente').length
  const overdueInvoices = invoices.filter(i => i.status === 'Vencida').length

  const lowStock = inventory.filter(i => i.stock <= i.minStock)
  const expiringSoon = inventory.filter(
    i => i.expiryDate && daysUntil(i.expiryDate) <= 90 && daysUntil(i.expiryDate) > 0
  )

  const criticalPets = pets.filter(p => p.status === 'Crítico' || p.status === 'En tratamiento')
  const activeVets = vets.filter(v => v.active && v.role === 'Veterinario')

  const kpis = [
    {
      label: 'Pacientes activos',
      value: pets.length,
      change: '+2 este mes',
      icon: Dog,
      color: 'emerald',
      onClick: () => onNavigate('patients'),
    },
    {
      label: 'Citas hoy',
      value: todaysAppointments.length,
      change: `${todaysAppointments.filter(a => a.status === 'Confirmada').length} confirmadas`,
      icon: Calendar,
      color: 'sky',
      onClick: () => onNavigate('appointments'),
    },
    {
      label: 'Ingresos del mes',
      value: formatCurrency(monthlyRevenue),
      change: '+12% vs mes anterior',
      icon: DollarSign,
      color: 'amber',
      onClick: () => onNavigate('billing'),
    },
    {
      label: 'Clientes',
      value: clients.length,
      change: '+1 esta semana',
      icon: Users,
      color: 'violet',
      onClick: () => onNavigate('clients'),
    },
  ]

  const kpiStyles: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  }

  return (
    <div>
      <Topbar
        title="Dashboard"
        subtitle="Resumen general de la clínica"
        actionLabel="Nueva cita"
        onAction={() => onNavigate('appointments')}
      />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(kpi => {
            const Icon = kpi.icon
            return (
              <Card
                key={kpi.label}
                className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                onClick={kpi.onClick}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg ring-1', kpiStyles[kpi.color])}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-[13px] text-muted-foreground">{kpi.label}</p>
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-emerald-600">{kpi.change}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's appointments */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Agenda de hoy</CardTitle>
                <CardDescription className="text-xs">
                  {todaysAppointments.length} citas programadas
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigate('appointments')}>
                Ver todo
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="max-h-[420px] overflow-y-auto pr-1 space-y-2">
                {todaysAppointments.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No hay citas para hoy
                  </div>
                )}
                {todaysAppointments.map(apt => {
                  const pet = getPet(apt.petId)
                  const client = getClient(apt.clientId)
                  const vet = getVet(apt.vetId)
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex flex-col items-center justify-center w-14 shrink-0 rounded-lg bg-emerald-50 py-1.5 text-emerald-700">
                        <span className="text-[10px] font-medium uppercase">Hora</span>
                        <span className="text-sm font-bold">{apt.time}</span>
                      </div>
                      <div className="text-2xl">{TYPE_ICONS[apt.type]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-foreground">
                            {pet?.name} <span className="text-muted-foreground font-normal">· {pet?.breed}</span>
                          </p>
                        </div>
                        <p className="truncate text-[12px] text-muted-foreground">
                          {client?.name} · {apt.reason}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={apt.status === 'Confirmada' ? 'default' : 'secondary'}
                          className={cn(
                            'text-[10px]',
                            apt.status === 'Confirmada' && 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          )}
                        >
                          {apt.status}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">{vet?.name.split(' ').slice(-1)[0]}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Alertas
              </CardTitle>
              <CardDescription className="text-xs">Requieren atención</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {/* Low stock */}
              {lowStock.length > 0 && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <PackageX className="h-4 w-4 text-rose-600" />
                    <p className="text-[12px] font-semibold text-rose-700">Stock bajo</p>
                    <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-[10px]">
                      {lowStock.length}
                    </Badge>
                  </div>
                  <ul className="space-y-1">
                    {lowStock.slice(0, 3).map(item => (
                      <li key={item.id} className="flex items-center justify-between text-[11px] text-rose-800">
                        <span className="truncate pr-2">{item.name}</span>
                        <span className="font-medium shrink-0">{item.stock}/{item.minStock}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Expiring soon */}
              {expiringSoon.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <p className="text-[12px] font-semibold text-amber-700">Próximas a vencer</p>
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px] bg-amber-100 text-amber-700">
                      {expiringSoon.length}
                    </Badge>
                  </div>
                  <ul className="space-y-1">
                    {expiringSoon.slice(0, 3).map(item => (
                      <li key={item.id} className="flex items-center justify-between text-[11px] text-amber-800">
                        <span className="truncate pr-2">{item.name}</span>
                        <span className="font-medium shrink-0">{formatDate(item.expiryDate!)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pending invoices */}
              {(pendingInvoices > 0 || overdueInvoices > 0) && (
                <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-sky-600" />
                    <p className="text-[12px] font-semibold text-sky-700">Facturas</p>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    {pendingInvoices > 0 && (
                      <div className="flex justify-between text-sky-800">
                        <span>Pendientes de cobro</span>
                        <Badge className="bg-sky-200 text-sky-800 hover:bg-sky-200 h-5 px-1.5 text-[10px]">
                          {pendingInvoices}
                        </Badge>
                      </div>
                    )}
                    {overdueInvoices > 0 && (
                      <div className="flex justify-between text-rose-800">
                        <span>Vencidas</span>
                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                          {overdueInvoices}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Critical patients */}
              {criticalPets.length > 0 && (
                <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-violet-600" />
                    <p className="text-[12px] font-semibold text-violet-700">Pacientes a seguimiento</p>
                  </div>
                  <ul className="space-y-1">
                    {criticalPets.slice(0, 3).map(pet => (
                      <li key={pet.id} className="flex items-center justify-between text-[11px] text-violet-800">
                        <span className="truncate pr-2">{pet.name} · {pet.breed}</span>
                        <Badge
                          variant="outline"
          className={cn('h-5 px-1.5 text-[10px] capitalize border', STATUS_COLORS[pet.status])}
                        >
                          {pet.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income chart placeholder - bar chart of last 6 months */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Evolución de ingresos</CardTitle>
                  <CardDescription className="text-xs">Últimos 6 meses</CardDescription>
                </div>
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-semibold">+12%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MonthlyRevenueChart />
            </CardContent>
          </Card>

          {/* Veterinarians performance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Actividad del equipo</CardTitle>
              <CardDescription className="text-xs">Citas hoy por veterinario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeVets.map(vet => {
                const max = Math.max(...activeVets.map(v => v.appointmentsToday)) || 1
                const pct = (vet.appointmentsToday / max) * 100
                return (
                  <div key={vet.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-medium text-foreground truncate">
                        {vet.name}
                      </span>
                      <span className="text-[12px] text-muted-foreground ml-2 shrink-0">
                        {vet.appointmentsToday} citas
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MonthlyRevenueChart() {
  const months = [
    { label: 'Abr', value: 4200 },
    { label: 'May', value: 4800 },
    { label: 'Jun', value: 5100 },
    { label: 'Jul', value: 4600 },
    { label: 'Ago', value: 5900 },
    { label: 'Sep', value: 6500 },
  ]
  const max = Math.max(...months.map(m => m.value))
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3 h-44 px-2">
        {months.map(m => {
          const h = (m.value / max) * 100
          const isLast = m.label === 'Sep'
          return (
            <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full h-full flex items-end">
                <div
                  className={cn(
                    'w-full rounded-t-md transition-all',
                    isLast ? 'bg-emerald-500' : 'bg-emerald-200'
                  )}
                  style={{ height: `${h}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">{m.label}</span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-[12px] text-muted-foreground">Total acumulado: <strong className="text-foreground">{formatCurrency(31100)}</strong></span>
        <span className="text-[12px] text-muted-foreground">Promedio mensual: <strong className="text-foreground">{formatCurrency(5183)}</strong></span>
      </div>
    </div>
  )
}
