'use client'

import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Dog,
  Plus,
  Filter,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Topbar } from '@/components/vet/topbar'
import { cn } from '@/lib/utils'
import {
  appointments,
  pets,
  vets,
  getPet,
  getClient,
  getVet,
  formatCurrency,
} from '@/lib/vet-data'

const TYPE_STYLES: Record<string, string> = {
  'Consulta': 'bg-sky-100 text-sky-700 border-sky-200',
  'Vacunación': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Cirugía': 'bg-violet-100 text-violet-700 border-violet-200',
  'Control': 'bg-amber-100 text-amber-700 border-amber-200',
  'Urgencia': 'bg-rose-100 text-rose-700 border-rose-200',
  'Peluquería': 'bg-pink-100 text-pink-700 border-pink-200',
}

const TYPE_DOT: Record<string, string> = {
  'Consulta': 'bg-sky-500',
  'Vacunación': 'bg-emerald-500',
  'Cirugía': 'bg-violet-500',
  'Control': 'bg-amber-500',
  'Urgencia': 'bg-rose-500',
  'Peluquería': 'bg-pink-500',
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function AppointmentsView() {
  const [view, setView] = useState<'day' | 'week'>('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(
    new Date().toISOString().split('T')[0]
  )

  // Generate week days
  const weekDays = useMemo(() => {
    const date = new Date(currentDate)
    const day = date.getDay()
    const diff = day === 0 ? -6 : 1 - day // Monday as first
    date.setDate(date.getDate() + diff)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(date)
      d.setDate(d.getDate() + i)
      return {
        date: d,
        dateStr: d.toISOString().split('T')[0],
        dayNum: d.getDate(),
        weekday: WEEKDAYS[i],
        isToday: d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0],
      }
    })
  }, [currentDate])

  const selectedAppointments = useMemo(() => {
    if (view === 'week') {
      const weekDateStrs = weekDays.map(d => d.dateStr)
      return appointments
        .filter(a => weekDateStrs.includes(a.date))
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    }
    const targetDate = selectedDate || new Date().toISOString().split('T')[0]
    return appointments
      .filter(a => a.date === targetDate)
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [view, selectedDate, weekDays])

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction * 7)
    setCurrentDate(newDate)
  }

  const navigateDay = (direction: number) => {
    const newDate = new Date(selectedDate || new Date())
    newDate.setDate(newDate.getDate() + direction)
    setSelectedDate(newDate.toISOString().split('T')[0])
  }

  return (
    <div>
      <Topbar title="Agenda" subtitle="Gestión de turnos y citas" actionLabel="Nuevo turno" />

      <div className="p-6 space-y-4">
        {/* View toggle */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={view === 'day' ? 'default' : 'outline'}
              className={view === 'day' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={() => setView('day')}
            >
              Día
            </Button>
            <Button
              size="sm"
              variant={view === 'week' ? 'default' : 'outline'}
              className={view === 'week' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={() => setView('week')}
            >
              Semana
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => view === 'day' ? navigateDay(-1) : navigateWeek(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setCurrentDate(new Date())
              setSelectedDate(new Date().toISOString().split('T')[0])
            }}>
              Hoy
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => view === 'day' ? navigateDay(1) : navigateWeek(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Mini calendar / week strip */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-emerald-600" />
                {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <CardDescription className="text-xs capitalize">
                {view === 'day' ? 'Vista diaria' : 'Vista semanal'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {view === 'week' ? (
                <div className="grid grid-cols-7 gap-1 text-center">
                  {weekDays.map(d => {
                    const dayAppts = appointments.filter(a => a.date === d.dateStr)
                    return (
                      <button
                        key={d.dateStr}
                        onClick={() => {
                          setSelectedDate(d.dateStr)
                          setView('day')
                        }}
                        className={cn(
                          'flex flex-col items-center rounded-lg p-2 transition-colors',
                          d.isToday ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-muted'
                        )}
                      >
                        <span className="text-[10px] font-medium uppercase text-muted-foreground">{d.weekday}</span>
                        <span className={cn(
                          'text-sm font-semibold',
                          d.isToday ? 'text-emerald-700' : 'text-foreground'
                        )}>{d.dayNum}</span>
                        {dayAppts.length > 0 && (
                          <div className="flex gap-0.5 mt-1 h-1">
                            {dayAppts.slice(0, 3).map(a => (
                              <span key={a.id} className={cn('h-1 w-1 rounded-full', TYPE_DOT[a.type])} />
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <MiniMonthCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
              )}
            </CardContent>
          </Card>

          {/* Appointments list */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {view === 'day' && selectedDate
                    ? new Date(selectedDate).toLocaleDateString('es-ES', {
                        weekday: 'long', day: 'numeric', month: 'long'
                      })
                    : `Semana del ${weekDays[0].dayNum} al ${weekDays[6].dayNum}`}
                </CardTitle>
                <CardDescription className="text-xs capitalize">
                  {selectedAppointments.length} citas programadas
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                {selectedAppointments.filter(a => a.status === 'Confirmada').length} confirmadas
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto pr-1 space-y-2">
                {selectedAppointments.length === 0 ? (
                  <div className="py-12 text-center">
                    <CalendarIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No hay citas programadas</p>
                    <Button size="sm" className="mt-3 bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4" /> Agendar primera cita
                    </Button>
                  </div>
                ) : (
                  selectedAppointments.map(apt => {
                    const pet = getPet(apt.petId)
                    const client = getClient(apt.clientId)
                    const vet = getVet(apt.vetId)
                    return (
                      <div
                        key={apt.id}
                        className="flex items-stretch gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors"
                      >
                        {/* Time block */}
                        <div className="flex flex-col items-center justify-center w-16 shrink-0 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 py-2">
                          <span className="text-sm font-bold text-emerald-700">{apt.time}</span>
                          <span className="text-[10px] text-emerald-600">{apt.duration}min</span>
                        </div>

                        {/* Pet avatar */}
                        {pet && (
                          <img src={pet.photoUrl} alt={pet.name} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-foreground truncate">{pet?.name}</p>
                            <Badge
                              variant="outline"
                              className={cn('text-[10px] border', TYPE_STYLES[apt.type])}
                            >
                              {apt.type}
                            </Badge>
                            {view === 'week' && (
                              <span className="text-[11px] text-muted-foreground">
                                {new Date(apt.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] text-muted-foreground truncate">
                            {apt.reason}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {client?.name} · {vet?.name}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col items-end justify-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px]',
                              apt.status === 'Confirmada' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                              apt.status === 'Pendiente' && 'bg-amber-50 text-amber-700 border-amber-200',
                              apt.status === 'Cancelada' && 'bg-rose-50 text-rose-700 border-rose-200',
                              apt.status === 'Completada' && 'bg-sky-50 text-sky-700 border-sky-200',
                            )}
                          >
                            {apt.status}
                          </Badge>
                          <Button size="sm" variant="ghost" className="h-7 text-[11px]">
                            Editar
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MiniMonthCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: string | null
  onSelect: (date: string) => void
}) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startWeekday = (firstDay.getDay() + 6) % 7 // Monday = 0
  const daysInMonth = lastDay.getDate()
  const todayStr = today.toISOString().split('T')[0]

  const cells: (string | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    cells.push(date.toISOString().split('T')[0])
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {WEEKDAYS.map(w => (
          <span key={w} className="text-[10px] font-medium uppercase text-muted-foreground">{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={i} className="h-8" />
          const dayNum = parseInt(dateStr.split('-')[2], 10)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const dayAppts = appointments.filter(a => a.date === dateStr)
          return (
            <button
              key={i}
              onClick={() => onSelect(dateStr)}
              className={cn(
                'flex flex-col items-center justify-center h-8 rounded-md text-[12px] transition-colors relative',
                isSelected ? 'bg-emerald-600 text-white' : isToday ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-muted text-foreground'
              )}
            >
              {dayNum}
              {dayAppts.length > 0 && !isSelected && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-emerald-500" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-[10px] uppercase font-medium text-muted-foreground mb-2">Tipos de cita</p>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(TYPE_DOT).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className={cn('h-2 w-2 rounded-full', color)} />
              <span>{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
