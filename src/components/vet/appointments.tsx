'use client'

import { useTranslation } from '@/lib/vet-clinic-hooks'
import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Topbar } from '@/components/vet/topbar'
import { NewAppointmentDialog } from '@/components/vet/new-entity-dialogs'
import { cn } from '@/lib/utils'
import { useAppointments, useUpdateAppointment, usePets, useClients, useVets } from '@/lib/vet-hooks'
import type { Appointment } from '@/lib/vet-data'

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
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 to 20:00

export function AppointmentsView() {
  const [view, setView] = useState<'day' | 'week'>('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [showNewAppointment, setShowNewAppointment] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  // Build query params
  const query = useMemo(() => {
    if (view === 'week') {
      const date = new Date(currentDate)
      const day = date.getDay()
      const diff = day === 0 ? -6 : 1 - day
      date.setDate(date.getDate() + diff)
      const from = date.toISOString().split('T')[0]
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 6)
      return { from, to: endDate.toISOString().split('T')[0] }
    }
    return { date: selectedDate }
  }, [view, selectedDate, currentDate])

  const { data: appointments = [], isLoading } = useAppointments(query)
  const { data: pets = [] } = usePets()
  const { data: clients = [] } = useClients()
  const { data: vets = [] } = useVets()
  const updateAppointment = useUpdateAppointment()

  const weekDays = useMemo(() => {
    const date = new Date(currentDate)
    const day = date.getDay()
    const diff = day === 0 ? -6 : 1 - day
    date.setDate(date.getDate() + diff)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(date)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      return {
        date: d,
        dateStr,
        dayNum: d.getDate(),
        weekday: WEEKDAYS[i],
        isToday: dateStr === new Date().toISOString().split('T')[0],
      }
    })
  }, [currentDate])

  const getPet = (id: string) => pets.find(p => p.id === id)
  const getClient = (id: string) => clients.find(c => c.id === id)
  const getVet = (id: string) => vets.find(v => v.id === id)

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction * 7)
    setCurrentDate(newDate)
  }

  const navigateDay = (direction: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + direction)
    setSelectedDate(newDate.toISOString().split('T')[0])
  }

  const handleDragStart = (e: DragStartEvent) => {
    setActiveDragId(e.active.id as string)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragId(null)
    const { active, over } = e
    if (!over) return
    const aptId = active.id as string
    const target = over.id as string // format: "date|HH:MM" or "date|HH"
    const [newDate, newTime] = target.split('|')
    const apt = appointments.find(a => a.id === aptId)
    if (!apt) return
    if (apt.date === newDate && apt.time === newTime) return
    updateAppointment.mutate({ id: aptId, date: newDate, time: newTime })
  }

  const activeApt = activeDragId ? appointments.find(a => a.id === activeDragId) : null

  return (
    <div>
      <Topbar moduleKey="appointments" title="Agenda" subtitle={t("appointments.subtitle")} actionLabel="Nuevo turno" onAction={() => setShowNewAppointment(true)} />

      <div className="p-6 space-y-4">
        {/* View toggle + navigation */}
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
            <Badge variant="secondary" className="bg-violet-100 text-violet-700 ml-2">
              ✋ Arrastrable
            </Badge>
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

        {/* Calendar grid */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base capitalize">
              {view === 'day'
                ? new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
                : `Semana del ${weekDays[0].dayNum} al ${weekDays[6].dayNum}`}
            </CardTitle>
            <CardDescription className="text-xs">
              {appointments.length} citas · Arrastra cualquier cita para moverla a otro horario o día
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-96 bg-muted animate-pulse rounded-lg" />
            ) : (
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="overflow-x-auto">
                  {/* Header row */}
                  <div
                    className={cn(
                      'grid border-b border-border pb-2 mb-2',
                      view === 'week' ? 'grid-cols-[60px_repeat(7,1fr)]' : 'grid-cols-[60px_1fr]'
                    )}
                  >
                    <div></div>
                    {(view === 'week' ? weekDays : [{
                      dateStr: selectedDate,
                      dayNum: new Date(selectedDate).getDate(),
                      weekday: WEEKDAYS[(new Date(selectedDate).getDay() + 6) % 7],
                      isToday: selectedDate === new Date().toISOString().split('T')[0],
                    }]).map(d => (
                      <div key={d.dateStr} className="text-center px-1">
                        <p className="text-[11px] uppercase text-muted-foreground font-medium">{d.weekday}</p>
                        <p className={cn(
                          'text-base font-bold',
                          d.isToday ? 'text-emerald-600' : 'text-foreground'
                        )}>{d.dayNum}</p>
                      </div>
                    ))}
                  </div>

                  {/* Time grid */}
                  <div className="max-h-[600px] overflow-y-auto">
                    {HOURS.map(hour => (
                      <div
                        key={hour}
                        className={cn(
                          'grid border-b border-border/50',
                          view === 'week' ? 'grid-cols-[60px_repeat(7,1fr)]' : 'grid-cols-[60px_1fr]'
                        )}
                      >
                        <div className="text-[11px] text-muted-foreground py-1 pr-2 text-right">
                          {String(hour).padStart(2, '0')}:00
                        </div>
                        {(view === 'week' ? weekDays : [{
                          dateStr: selectedDate,
                          isToday: selectedDate === new Date().toISOString().split('T')[0],
                        }]).map(d => {
                          const slotId = `${d.dateStr}|${String(hour).padStart(2, '0')}:00`
                          const slotAppts = appointments.filter(a =>
                            a.date === d.dateStr && parseInt(a.time.split(':')[0], 10) === hour
                          ).sort((a, b) => a.time.localeCompare(b.time))
                          return (
                            <DroppableSlot
                              key={slotId}
                              id={slotId}
                              isToday={d.isToday}
                            >
                              {slotAppts.map(apt => {
                                const pet = getPet(apt.petId)
                                const client = getClient(apt.clientId)
                                const vet = getVet(apt.vetId)
                                return (
                                  <DraggableAppointment
                                    key={apt.id}
                                    id={apt.id}
                                    apt={apt}
                                    petName={pet?.name || ''}
                                    petBreed={pet?.breed || ''}
                                    clientName={client?.name || ''}
                                    vetName={vet?.name || ''}
                                    compact={view === 'week'}
                                  />
                                )
                              })}
                            </DroppableSlot>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <DragOverlay>
                  {activeApt ? (
                    <div className="rotate-2 opacity-90">
                      <DraggableCard
                        apt={activeApt}
                        petName={getPet(activeApt.petId)?.name || ''}
                        petBreed={getPet(activeApt.petId)?.breed || ''}
                        clientName={getClient(activeApt.clientId)?.name || ''}
                        vetName={getVet(activeApt.vetId)?.name || ''}
                        compact={view === 'week'}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] uppercase font-medium text-muted-foreground">Tipos de cita:</span>
              {Object.entries(TYPE_DOT).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
                  {type}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <NewAppointmentDialog
        open={showNewAppointment}
        onOpenChange={setShowNewAppointment}
        pets={pets}
        clients={clients}
        vets={vets}
      />
    </div>
  )
}

function DroppableSlot({ id, isToday, children }: { id: string; isToday: boolean; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[56px] p-1 border-l border-border/30 transition-colors',
        isToday && 'bg-emerald-50/40',
        isOver && 'bg-emerald-100 ring-2 ring-inset ring-emerald-300'
      )}
    >
      {children}
    </div>
  )
}

function DraggableAppointment({
  id,
  apt,
  petName,
  petBreed,
  clientName,
  vetName,
  compact,
}: {
  id: string
  apt: Appointment
  petName: string
  petBreed: string
  clientName: string
  vetName: string
  compact: boolean
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'mb-1 cursor-grab active:cursor-grabbing rounded-md border px-1.5 py-1 text-[11px] transition-all',
        TYPE_STYLES[apt.type],
        isDragging && 'opacity-30'
      )}
    >
      <DraggableCard
        apt={apt}
        petName={petName}
        petBreed={petBreed}
        clientName={clientName}
        vetName={vetName}
        compact={compact}
      />
    </div>
  )
}

function DraggableCard({
  apt,
  petName,
  petBreed,
  clientName,
  vetName,
  compact,
}: {
  apt: Appointment
  petName: string
  petBreed: string
  clientName: string
  vetName: string
  compact: boolean
}) {
  return (
    <div className={cn('rounded-md border px-1.5 py-1 text-[11px]', TYPE_STYLES[apt.type])}>
      <div className="flex items-center justify-between gap-1">
        <span className="font-semibold truncate">{petName}</span>
        <span className="text-[10px] font-medium">{apt.time}</span>
      </div>
      {!compact && (
        <>
          <p className="text-[10px] truncate opacity-80">{petBreed}</p>
          <p className="text-[10px] truncate opacity-70">{clientName}</p>
          <p className="text-[10px] truncate opacity-70">{vetName.split(' ').slice(-1)[0]}</p>
        </>
      )}
    </div>
  )
}
