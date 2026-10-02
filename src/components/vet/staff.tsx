'use client'

import { useTranslation } from '@/lib/vet-clinic-hooks'
import { useState, useMemo } from 'react'
import {
  Search,
  Star,
  Calendar,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Award,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Topbar } from '@/components/vet/topbar'
import { cn } from '@/lib/utils'
import { useVets } from '@/lib/vet-hooks'
import { NewVetDialog } from '@/components/vet/new-entity-dialogs'

const ROLE_FILTERS = ['Todos', 'Veterinario', 'Recepción', 'Peluquería', 'Administrador', 'Auxiliar'] as const

const ROLE_STYLES: Record<string, string> = {
  'Veterinario': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Recepción': 'bg-sky-100 text-sky-700 border-sky-200',
  'Peluquería': 'bg-pink-100 text-pink-700 border-pink-200',
  'Administrador': 'bg-violet-100 text-violet-700 border-violet-200',
  'Auxiliar': 'bg-amber-100 text-amber-700 border-amber-200',
}

const SHIFT_STYLES: Record<string, string> = {
  'Mañana': 'bg-amber-50 text-amber-700 border-amber-200',
  'Tarde': 'bg-violet-50 text-violet-700 border-violet-200',
  'Completo': 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export function StaffView() {
  const { data: vets = [], isLoading } = useVets(); const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<typeof ROLE_FILTERS[number]>('Todos')
  const [showNewVet, setShowNewVet] = useState(false)

  const filtered = useMemo(() => {
    return vets.filter(v => {
      const matchesSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.specialty.toLowerCase().includes(search.toLowerCase()) ||
        v.email.toLowerCase().includes(search.toLowerCase())
      const matchesRole = roleFilter === 'Todos' || v.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [vets, search, roleFilter])

  const activeCount = vets.filter(v => v.active).length
  const totalAppointmentsToday = vets.reduce((sum, v) => sum + v.appointmentsToday, 0)
  const avgRating = vets.length ? (vets.reduce((sum, v) => sum + v.rating, 0) / vets.length).toFixed(1) : '0'

  const stats = [
    { label: 'Equipo activo', value: `${activeCount}/${vets.length}`, icon: ShieldCheck, color: 'emerald', desc: 'Personal disponible' },
    { label: 'Citas hoy', value: totalAppointmentsToday, icon: Calendar, color: 'sky', desc: 'Total agenda' },
    { label: 'Rating medio', value: `${avgRating} ★`, icon: Star, color: 'amber', desc: 'Valoración clientes' },
    { label: 'Especialidades', value: new Set(vets.filter(v => v.role === 'Veterinario').map(v => v.specialty)).size, icon: Award, color: 'violet', desc: 'Áreas cubiertas' },
  ]

  const statStyles: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  }

  if (isLoading) {
    return (
      <div>
        <Topbar title="Personal" subtitle="Cargando..." />
        <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Card key={i}><CardContent className="h-32 bg-muted animate-pulse" /></Card>)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Topbar moduleKey="staff" title="Personal" subtitle={t("staff.subtitle")} actionLabel="Nuevo empleado" onAction={() => setShowNewVet(true)} />

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg ring-1', statStyles[stat.color])}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-[12px] text-muted-foreground">{stat.label}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">{stat.desc}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("staff.title")}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {ROLE_FILTERS.map(r => (
                <Button
                  key={r}
                  size="sm"
                  variant={roleFilter === r ? 'default' : 'outline'}
                  className={cn('h-8', roleFilter === r && 'bg-emerald-600 hover:bg-emerald-700')}
                  onClick={() => setRoleFilter(r)}
                >
                  {r}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(vet => {
            const initials = vet.name.split(' ').map(n => n[0]).slice(0, 2).join('')
            return (
              <Card key={vet.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-14 w-14 border-2 border-emerald-100">
                      <AvatarFallback className={cn('text-base font-semibold', vet.avatarColor)}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{vet.name}</h3>
                      <p className="text-[12px] text-muted-foreground truncate">{vet.specialty}</p>
                      <Badge variant="outline" className={cn('text-[10px] mt-1', ROLE_STYLES[vet.role])}>
                        {vet.role}
                      </Badge>
                    </div>
                    {!vet.active && (
                      <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                        Inactivo
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 space-y-1.5 text-[12px]">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{vet.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{vet.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>Turno: </span>
                      <Badge variant="outline" className={cn('text-[10px]', SHIFT_STYLES[vet.shift])}>
                        {vet.shift}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3">
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Calendar className="h-3 w-3 text-emerald-600" />
                        <span className="text-[10px] uppercase text-muted-foreground">Citas hoy</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{vet.appointmentsToday}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] uppercase text-muted-foreground">Rating</span>
                      </div>
                      <p className="text-sm font-semibold text-amber-600">{vet.rating} ★</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <NewVetDialog open={showNewVet} onOpenChange={setShowNewVet} />
    </div>
  )
}
