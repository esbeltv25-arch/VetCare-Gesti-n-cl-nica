'use client'

import { useTranslation } from '@/lib/vet-clinic-hooks'
import { useState } from 'react'
import {
  BedDouble,
  Search,
  Activity,
  Plus,
  Radio,
  Loader2,
  Clock,
  Stethoscope,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Topbar } from '@/components/vet/topbar'
import { cn } from '@/lib/utils'
import { useHospitalizations } from '@/lib/vet-hospitalization-hooks'
import { usePets, useVets } from '@/lib/vet-hooks'
import { formatDate } from '@/lib/vet-data'
import { HospitalizationDetail } from '@/components/vet/hospitalization/hospitalization-detail'
import { AdmissionDialog } from '@/components/vet/hospitalization/admission-dialog'

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-rose-100 text-rose-700 border-rose-200',
  observation: 'bg-amber-100 text-amber-700 border-amber-200',
  discharged: 'bg-slate-100 text-slate-700 border-slate-200',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  observation: 'Observación',
  discharged: 'Alta',
}

export function HospitalizationView() {
  const { data: hospitalizations = [], isLoading, isFetching, dataUpdatedAt } = useHospitalizations('active')
  const { t } = useTranslation()
  const { data: pets = [] } = usePets()
  const { data: vets = [] } = useVets()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAdmission, setShowAdmission] = useState(false)

  const filtered = hospitalizations.filter(h => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      h.pet?.name.toLowerCase().includes(q) ||
      h.pet?.breed.toLowerCase().includes(q) ||
      h.cage.toLowerCase().includes(q) ||
      h.reason.toLowerCase().includes(q)
    )
  })

  // KPIs rápidos
  const activeCount = hospitalizations.filter(h => h.status === 'active').length
  const observationCount = hospitalizations.filter(h => h.status === 'observation').length
  const lastIncidents = hospitalizations.reduce(
    (sum, h) => sum + (h.shiftLogs?.filter(l => l.type === 'incident').length || 0),
    0
  )
  const lastMeds = hospitalizations.reduce(
    (sum, h) => sum + (h.shiftLogs?.filter(l => l.type === 'medication').length || 0),
    0
  )

  if (selectedId) {
    return (
      <HospitalizationDetail
        id={selectedId}
        onBack={() => setSelectedId(null)}
      />
    )
  }

  const lastUpdate = dataUpdatedAt ? new Date(dataUpdatedAt) : null

  return (
    <div>
      <Topbar title="Internación / Guardia" subtitle="Bitácora en tiempo real de pacientes internados" actionLabel="Admitir paciente" onAction={() => setShowAdmission(true)} />

      <div className="p-6 space-y-4">
        {/* Status banner: real-time */}
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Radio className={cn('h-5 w-5', isFetching && 'animate-pulse')} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Sistema online · tiempo real</p>
              <p className="text-[12px] text-muted-foreground">
                {isFetching ? 'Sincronizando...' : 'Actualizado'} · Refresco automático cada 5s ·
                {lastUpdate && (
                  <span className="ml-1">
                    última sync: {lastUpdate.toLocaleTimeString('es-ES')}
                  </span>
                )}
              </p>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
              EN VIVO
            </Badge>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
                <BedDouble className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{activeCount}</p>
                <p className="text-[12px] text-muted-foreground">Internados activos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{observationCount}</p>
                <p className="text-[12px] text-muted-foreground">En observación</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{lastMeds}</p>
                <p className="text-[12px] text-muted-foreground">Medicamentos admin.</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{lastIncidents}</p>
                <p className="text-[12px] text-muted-foreground">Incidencias</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por mascota, box o motivo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="h-48 bg-muted animate-pulse" />
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <BedDouble className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No hay pacientes internados activos</p>
              <Button size="sm" className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAdmission(true)}>
                <Plus className="h-4 w-4" /> Admitir primera internación
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(h => {
              const lastLog = h.shiftLogs?.[0]
              const lastActivity = h.shiftLogs?.length || 0
              const incidents = h.shiftLogs?.filter(l => l.type === 'incident').length || 0
              return (
                <Card
                  key={h.id}
                  className="cursor-pointer overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
                  onClick={() => setSelectedId(h.id)}
                >
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      {h.pet && (
                        <img src={h.pet.photoUrl} alt={h.pet.name} className="h-14 w-14 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate">{h.pet?.name}</h3>
                          <Badge variant="outline" className={cn('text-[10px]', STATUS_STYLES[h.status])}>
                            {STATUS_LABELS[h.status]}
                          </Badge>
                        </div>
                        <p className="text-[12px] text-muted-foreground truncate">
                          {h.pet?.breed} · {h.cage}
                        </p>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="mt-3">
                      <p className="text-[10px] uppercase text-muted-foreground">Motivo</p>
                      <p className="text-[12px] text-foreground line-clamp-2">{h.reason}</p>
                    </div>

                    {/* Vet */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold', h.attendingVet?.avatarColor)}>
                        {h.attendingVet?.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-foreground truncate">{h.attendingVet?.name}</p>
                        <p className="text-[10px] text-muted-foreground">{h.attendingVet?.specialty}</p>
                      </div>
                    </div>

                    {/* Last activity */}
                    {lastLog && (
                      <div className="mt-3 rounded-md bg-muted/30 p-2 border-l-2 border-emerald-400">
                        <p className="text-[10px] text-muted-foreground uppercase">Última entrada · {new Date(lastLog.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-[11px] text-foreground line-clamp-2 mt-0.5">{lastLog.content}</p>
                      </div>
                    )}

                    {/* Footer stats */}
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[11px]">
                      <span className="text-muted-foreground">{lastActivity} entradas</span>
                      {incidents > 0 && (
                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                          {incidents} incidencia{incidents > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Admission dialog */}
      {showAdmission && (
        <AdmissionDialog
          pets={pets}
          vets={vets}
          onClose={() => setShowAdmission(false)}
        />
      )}
    </div>
  )
}
