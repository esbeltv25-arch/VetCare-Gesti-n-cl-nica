'use client'
import { useTranslation } from '@/lib/vet-clinic-hooks'

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
  PackageX,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Topbar } from '@/components/vet/topbar'
import { cn } from '@/lib/utils'
import { useDashboard, usePets, useClients } from '@/lib/vet-hooks'
import { formatCurrency, formatDate, daysUntil } from '@/lib/vet-data'
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

const SPECIES_PIE_COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#0ea5e9', '#ec4899']

export function Dashboard({ onNavigate }: DashboardProps) {
  const { data, isLoading } = useDashboard(); const { t } = useTranslation()
  const { data: pets } = usePets()
  const { data: clients } = useClients()

  if (isLoading || !data) {
    return (
      <div>
        <Topbar title="Dashboard" subtitle={t("dashboard.subtitle")} actionLabel={t("topbar.newAppointment")}  onAction={() => onNavigate('appointments')} />
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  const kpis = data.kpis
  const kpiData = [
    {
      label: t('dashboard.activePatients'),
      value: kpis.pets,
      change: pets && pets.length > 8 ? `+${pets.length - 8} este mes` : 'Estable',
      icon: Dog,
      color: 'emerald',
      onClick: () => onNavigate('patients'),
    },
    {
      label: t('dashboard.todaysAppts'),
      value: kpis.todaysAppointmentsCount,
      change: `${kpis.confirmedToday} confirmadas`,
      icon: Calendar,
      color: 'sky',
      onClick: () => onNavigate('appointments'),
    },
    {
      label: t('dashboard.monthlyRevenue'),
      value: formatCurrency(kpis.paidRevenue),
      change: '+12% vs mes anterior',
      icon: DollarSign,
      color: 'amber',
      onClick: () => onNavigate('billing'),
    },
    {
      label: t('dashboard.clients'),
      value: kpis.clients,
      change: clients && clients.length > 6 ? `+${clients.length - 6} esta semana` : 'Estable',
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

  // Datos para gráficos
  const speciesData = Object.entries(data.speciesDistribution).map(([name, value]) => ({ name, value }))
  const criticalPetsData = (pets || []).filter(p => p.status !== 'Sano').map(p => ({ name: p.name, status: p.status, breed: p.breed }))

  return (
    <div>
      <Topbar title="Dashboard" subtitle={t("dashboard.subtitle")} actionLabel={t("topbar.newAppointment")}  onAction={() => onNavigate('appointments')} />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map(kpi => {
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
                <CardTitle className="text-base">{t("dashboard.todaysAgenda")}</CardTitle>
                <CardDescription className="text-xs">
                  {data.todaysAppointments.length} citas programadas
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigate('appointments')}>
                Ver todo
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="max-h-[420px] overflow-y-auto pr-1 space-y-2">
                {data.todaysAppointments.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No hay citas para hoy
                  </div>
                )}
                {data.todaysAppointments.map(apt => (
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
                          {apt.pet?.name} <span className="text-muted-foreground font-normal">· {apt.pet?.breed}</span>
                        </p>
                      </div>
                      <p className="truncate text-[12px] text-muted-foreground">
                        {apt.client?.name} · {apt.reason}
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
                      <span className="text-[11px] text-muted-foreground">{apt.vet?.name.split(' ').slice(-1)[0]}</span>
                    </div>
                  </div>
                ))}
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
              <CardDescription className="text-xs">{t("dashboard.requiresAttention")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {data.lowStock.length > 0 && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <PackageX className="h-4 w-4 text-rose-600" />
                    <p className="text-[12px] font-semibold text-rose-700">Stock bajo</p>
                    <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-[10px]">
                      {data.lowStock.length}
                    </Badge>
                  </div>
                  <ul className="space-y-1">
                    {data.lowStock.slice(0, 3).map(item => (
                      <li key={item.id} className="flex items-center justify-between text-[11px] text-rose-800">
                        <span className="truncate pr-2">{item.name}</span>
                        <span className="font-medium shrink-0">{item.stock}/{item.minStock}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.expiringSoon.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <p className="text-[12px] font-semibold text-amber-700">Próximas a vencer</p>
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px] bg-amber-100 text-amber-700">
                      {data.expiringSoon.length}
                    </Badge>
                  </div>
                  <ul className="space-y-1">
                    {data.expiringSoon.slice(0, 3).map(item => (
                      <li key={item.id} className="flex items-center justify-between text-[11px] text-amber-800">
                        <span className="truncate pr-2">{item.name}</span>
                        <span className="font-medium shrink-0">{formatDate(item.expiryDate!)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(data.pendingInvoices > 0 || data.overdueInvoices > 0) && (
                <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-sky-600" />
                    <p className="text-[12px] font-semibold text-sky-700">Facturas</p>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    {data.pendingInvoices > 0 && (
                      <div className="flex justify-between text-sky-800">
                        <span>Pendientes de cobro</span>
                        <Badge className="bg-sky-200 text-sky-800 hover:bg-sky-200 h-5 px-1.5 text-[10px]">
                          {data.pendingInvoices}
                        </Badge>
                      </div>
                    )}
                    {data.overdueInvoices > 0 && (
                      <div className="flex justify-between text-rose-800">
                        <span>Vencidas</span>
                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                          {data.overdueInvoices}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {criticalPetsData.length > 0 && (
                <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-violet-600" />
                    <p className="text-[12px] font-semibold text-violet-700">Pacientes a seguimiento</p>
                  </div>
                  <ul className="space-y-1">
                    {criticalPetsData.slice(0, 3).map(pet => (
                      <li key={pet.name} className="flex items-center justify-between text-[11px] text-violet-800">
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

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ingresos mensuales - Area chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{t("dashboard.revenueEvolution")}</CardTitle>
                  <CardDescription className="text-xs">Últimos 6 meses</CardDescription>
                </div>
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-semibold">+12%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthlyRevenue}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                      dot={{ r: 4, fill: '#10b981' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Distribución por especie - Pie chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("dashboard.bySpecies")}</CardTitle>
              <CardDescription className="text-xs">Distribución de pacientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={speciesData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={(entry: any) => `${entry.name}: ${entry.value}`}
                      labelLine={false}
                    >
                      {speciesData.map((_, i) => (
                        <Cell key={i} fill={SPECIES_PIE_COLORS[i % SPECIES_PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom row: Citas por día + Veterinarios */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Citas por día de la semana - Bar chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("dashboard.apptsByWeekday")}</CardTitle>
              <CardDescription className="text-xs">Distribución semanal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.appointmentsByWeekday}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                      formatter={(v: number) => [`${v} citas`, 'Citas']}
                    />
                    <Bar dataKey="citas" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Veterinarios performance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("dashboard.teamActivity")}</CardTitle>
              <CardDescription className="text-xs">Citas hoy por veterinario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.activeVets.map(vet => {
                const max = Math.max(...data.activeVets.map(v => v.appointmentsToday)) || 1
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
