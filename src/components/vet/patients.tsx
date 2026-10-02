'use client'

import { useState, useMemo } from 'react'
import {
  Dog,
  Cat,
  Rabbit,
  Bird,
  Search,
  Filter,
  Heart,
  Syringe,
  Calendar,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Weight,
  Venus,
  Mars,
  Microchip,
  ShieldCheck,
  Activity,
  Pill,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Topbar } from '@/components/vet/topbar'
import { cn } from '@/lib/utils'
import { usePets, useClients, useAppointments } from '@/lib/vet-hooks'
import type { Pet, Client, Appointment } from '@/lib/vet-data'
import { calculateAge, formatDate, daysUntil } from '@/lib/vet-data'
import { PetGallery } from '@/components/vet/pet-gallery'
import { NewPetDialog } from '@/components/vet/new-entity-dialogs'

const STATUS_STYLES: Record<string, string> = {
  'Sano': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'En tratamiento': 'bg-amber-100 text-amber-700 border-amber-200',
  'Crítico': 'bg-rose-100 text-rose-700 border-rose-200',
  'En observación': 'bg-sky-100 text-sky-700 border-sky-200',
}

const SPECIES_ICON: Record<string, any> = {
  'Perro': Dog,
  'Gato': Cat,
  'Conejo': Rabbit,
  'Ave': Bird,
}

const SPECIES_FILTERS = ['Todos', 'Perro', 'Gato', 'Conejo', 'Ave'] as const
const STATUS_FILTERS = ['Todos', 'Sano', 'En tratamiento', 'Crítico', 'En observación'] as const

export function PatientsView() {
  const { data: pets = [], isLoading } = usePets()
  const { data: clients = [] } = useClients()
  const [search, setSearch] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState<typeof SPECIES_FILTERS[number]>('Todos')
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_FILTERS[number]>('Todos')
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const [showNewPet, setShowNewPet] = useState(false)

  const filtered = useMemo(() => {
    return pets.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.breed.toLowerCase().includes(search.toLowerCase())
      const matchesSpecies = speciesFilter === 'Todos' || p.species === speciesFilter
      const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter
      return matchesSearch && matchesSpecies && matchesStatus
    })
  }, [pets, search, speciesFilter, statusFilter])

  const selectedPet = selectedPetId ? pets.find(p => p.id === selectedPetId) : null

  if (isLoading) {
    return (
      <div>
        <Topbar title="Pacientes" subtitle="Cargando..." />
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}><CardContent className="aspect-square bg-muted animate-pulse" /></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Topbar moduleKey="patients" title="Pacientes" subtitle={`${pets.length} mascotas registradas`} actionLabel="Nuevo paciente" onAction={() => setShowNewPet(true)} />

      <div className="p-6 space-y-4">
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o raza..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Filter className="h-4 w-4 text-muted-foreground self-center mr-1" />
              {SPECIES_FILTERS.map(s => (
                <Button
                  key={s}
                  size="sm"
                  variant={speciesFilter === s ? 'default' : 'outline'}
                  className={cn('h-8', speciesFilter === s && 'bg-emerald-600 hover:bg-emerald-700')}
                  onClick={() => setSpeciesFilter(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
            <div className="hidden lg:flex flex-wrap gap-2">
              {STATUS_FILTERS.map(s => (
                <Button
                  key={s}
                  size="sm"
                  variant={statusFilter === s ? 'default' : 'outline'}
                  className={cn('h-8', statusFilter === s && 'bg-emerald-600 hover:bg-emerald-700')}
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Dog className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No se encontraron pacientes con esos criterios</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(pet => {
              const Icon = SPECIES_ICON[pet.species] || Dog
              const client = clients.find(c => c.id === pet.clientId)
              return (
                <Card
                  key={pet.id}
                  className="cursor-pointer overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
                  onClick={() => setSelectedPetId(pet.id)}
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img src={pet.photoUrl} alt={pet.name} className="h-full w-full object-cover" />
                    <div className="absolute left-2 top-2">
                      <Badge variant="outline" className={cn('border bg-white/90 capitalize text-[10px]', STATUS_STYLES[pet.status])}>
                        {pet.status}
                      </Badge>
                    </div>
                    <div className="absolute right-2 top-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90">
                        <Icon className="h-4 w-4 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground truncate">{pet.name}</h3>
                      <span className="text-[11px] text-muted-foreground">{calculateAge(pet.birthDate)}</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground truncate">{pet.breed}</p>
                    <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                      <span className="text-[11px] text-muted-foreground truncate">
                        {client?.name.split(' ').slice(0, 2).join(' ')}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{pet.weight}kg</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={!!selectedPet} onOpenChange={open => !open && setSelectedPetId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          {selectedPet && (
            <PetDetail
              pet={selectedPet}
              client={clients.find(c => c.id === selectedPet.clientId) || null}
            />
          )}
        </DialogContent>
      </Dialog>

      <NewPetDialog
        open={showNewPet}
        onOpenChange={setShowNewPet}
        clients={clients}
      />
    </div>
  )
}

function PetDetail({ pet, client }: { pet: Pet; client: Client | null }) {
  const Icon = SPECIES_ICON[pet.species] || Dog
  const { data: allAppointments = [] } = useAppointments()
  const history = allAppointments
    .filter(a => a.petId === pet.id)
    .slice(0, 5)

  return (
    <div>
      <div className="relative h-48 bg-muted">
        <img src={pet.photoUrl} alt={pet.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="text-white">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{pet.name}</h2>
              <Badge variant="outline" className={cn('capitalize border-white/30 bg-white/20 text-white', STATUS_STYLES[pet.status])}>
                {pet.status}
              </Badge>
            </div>
            <p className="text-sm text-white/80">{pet.breed} · {calculateAge(pet.birthDate)}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <Icon className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox icon={Weight} label="Peso" value={`${pet.weight} kg`} color="emerald" />
          <StatBox icon={pet.sex === 'M' ? Mars : Venus} label="Sexo" value={pet.sex === 'M' ? 'Macho' : 'Hembra'} color="violet" />
          <StatBox icon={ShieldCheck} label="Esterilizado" value={pet.sterilized ? 'Sí' : 'No'} color="amber" />
          <StatBox icon={Microchip} label="Microchip" value={pet.microchip || 'Sin chip'} color="sky" />
        </div>

        {client && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" /> Dueño
            </h3>
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold', client.avatarColor)}>
                    {client.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{client.name}</p>
                    <p className="text-[12px] text-muted-foreground">Cliente desde {formatDate(client.since)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[12px]">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="truncate">{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{client.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" /> Alergias
              </h3>
              {pet.allergies.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">Sin alergias registradas</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {pet.allergies.map(a => (
                    <Badge key={a} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{a}</Badge>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-500" /> Condiciones crónicas
              </h3>
              {pet.chronicConditions.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">Sin condiciones registradas</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {pet.chronicConditions.map(c => (
                    <Badge key={c} variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">{c}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Photo gallery */}
          <PetGallery pet={pet} />

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Syringe className="h-4 w-4 text-emerald-600" /> Cartilla de vacunación
            </h3>
            {pet.vaccines.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">Sin vacunas registradas</p>
            ) : (
              <ul className="space-y-1.5">
                {pet.vaccines.map(v => {
                  const days = v.nextDue ? daysUntil(v.nextDue) : null
                  const overdue = days !== null && days < 0
                  const soon = days !== null && days >= 0 && days <= 30
                  return (
                    <li key={v.id} className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-1.5 text-[12px]">
                      <div>
                        <p className="font-medium text-foreground">{v.name}</p>
                        <p className="text-[11px] text-muted-foreground">Aplicada: {formatDate(v.date)}</p>
                      </div>
                      <div className="text-right">
                        {v.nextDue && (
                          <>
                            <p className="text-[11px] text-muted-foreground">Próxima</p>
                            <Badge variant="outline" className={cn(
                              'text-[10px]',
                              overdue && 'bg-rose-50 text-rose-700 border-rose-200',
                              soon && 'bg-amber-50 text-amber-700 border-amber-200',
                              !overdue && !soon && 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            )}>
                              {overdue ? 'Vencida' : formatDate(v.nextDue)}
                            </Badge>
                          </>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-violet-600" /> Historial clínico reciente
          </h3>
          {history.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">Sin consultas previas</p>
          ) : (
            <ul className="space-y-2">
              {history.map(apt => (
                <li key={apt.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50">
                    <Pill className="h-4 w-4 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-medium text-foreground">{apt.reason}</p>
                      <Badge variant="secondary" className="text-[10px]">{apt.type}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{formatDate(apt.date)} · {apt.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function StatBox({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const styles: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
    sky: 'bg-sky-50 text-sky-700',
  }
  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-md mb-1.5', styles[color])}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground truncate">{value}</p>
    </div>
  )
}
