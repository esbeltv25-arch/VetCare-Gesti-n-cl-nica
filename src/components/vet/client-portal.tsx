'use client'

import { useState, useMemo } from 'react'
import {
  Stethoscope,
  LogIn,
  LogOut,
  Dog,
  Cat,
  Rabbit,
  Bird,
  Calendar,
  Syringe,
  Video,
  Phone,
  Mail,
  Heart,
  Award,
  Send,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageCircle,
  Settings,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useClients, usePets, useAppointments, useVets } from '@/lib/vet-hooks'
import { calculateAge, formatDate, daysUntil, formatCurrency } from '@/lib/vet-data'
import { TelemedicineCall } from '@/components/vet/telemedicine-call'

const SPECIES_ICON: Record<string, any> = {
  'Perro': Dog,
  'Gato': Cat,
  'Conejo': Rabbit,
  'Ave': Bird,
}

const TYPE_STYLES: Record<string, string> = {
  'Consulta': 'bg-sky-100 text-sky-700 border-sky-200',
  'Vacunación': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Cirugía': 'bg-violet-100 text-violet-700 border-violet-200',
  'Control': 'bg-amber-100 text-amber-700 border-amber-200',
  'Urgencia': 'bg-rose-100 text-rose-700 border-rose-200',
  'Peluquería': 'bg-pink-100 text-pink-700 border-pink-200',
}

export function ClientPortal() {
  const { data: clients = [] } = useClients()
  const [clientId, setClientId] = useState<string | null>(null)
  const [email, setEmail] = useState('')

  const selectedClient = clientId ? clients.find(c => c.id === clientId) : null

  // Login mock: si el email coincide con un cliente, inicia sesión
  const handleLogin = () => {
    const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase())
    if (client) {
      setClientId(client.id)
    } else if (email && clients.length > 0) {
      // Demo: si es email nuevo pero hay clientes, asigna el primero
      setClientId(clients[0].id)
    }
  }

  const handleLogout = () => {
    setClientId(null)
    setEmail('')
  }

  if (!selectedClient) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-violet-50 via-white to-emerald-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-emerald-500 text-white shadow-md">
              <Stethoscope className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Portal del cliente</CardTitle>
            <CardDescription>Accede para ver la cartilla de tus mascotas, pedir turnos y hacer videollamadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <p className="text-[11px] text-muted-foreground">
                Demo: usa cualquier email (se asigna el primer cliente). O prueba: <code className="bg-muted px-1 rounded">maria.gonzalez@email.com</code>
              </p>
            </div>
            <Button
              onClick={handleLogin}
              className="w-full bg-violet-600 hover:bg-violet-700"
              disabled={!email}
            >
              <LogIn className="h-4 w-4" />
              Iniciar sesión
            </Button>
            <div className="rounded-lg bg-violet-50 border border-violet-200 p-3 text-[11px] text-violet-700">
              <p className="font-medium mb-1">Funciones disponibles:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Cartilla digital de tus mascotas</li>
                <li>Solicitud de turnos online</li>
                <li>Telemedicina (videollamadas)</li>
                <li>Recordatorios de vacunas</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <ClientDashboard clientId={selectedClient.id} onLogout={handleLogout} />
}

function ClientDashboard({ clientId, onLogout }: { clientId: string; onLogout: () => void }) {
  const { data: clients = [] } = useClients()
  const { data: pets = [] } = usePets()
  const { data: appointments = [] } = useAppointments()
  const { data: vets = [] } = useVets()
  const [telemedicinePetId, setTelemedicinePetId] = useState<string | null>(null)

  const client = clients.find(c => c.id === clientId)
  const clientPets = useMemo(() => pets.filter(p => p.clientId === clientId), [pets, clientId])
  const clientAppointments = useMemo(() => appointments.filter(a => a.clientId === clientId), [appointments, clientId])

  if (!client) return null

  const upcomingAppts = clientAppointments
    .filter(a => new Date(a.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  return (
    <div>
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-white/90 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-emerald-500 text-white">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">VetCare · Portal cliente</p>
            <p className="text-[11px] text-muted-foreground">Hola, {client.name.split(' ')[0]}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Award className="h-3 w-3 mr-1" />
            {client.loyaltyPoints} puntos
          </Badge>
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold', client.avatarColor)}>
            {client.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Welcome banner */}
        <div className="rounded-2xl bg-gradient-to-br from-violet-500 via-violet-600 to-emerald-600 p-6 text-white shadow-md">
          <p className="text-[12px] font-medium uppercase tracking-wide text-violet-100">Bienvenida a tu portal</p>
          <h1 className="mt-1 text-2xl font-bold">{client.name.split(' ')[0]}, cuidamos a tus mascotas 🐾</h1>
          <p className="mt-1 text-sm text-violet-50">Tienes {clientPets.length} mascota(s) registrada(s) y {upcomingAppts.length} cita(s) próxima(s).</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Dog className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{clientPets.length}</p>
                <p className="text-[12px] text-muted-foreground">Mascotas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{upcomingAppts.length}</p>
                <p className="text-[12px] text-muted-foreground">Próximas citas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <Syringe className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{clientPets.reduce((s, p) => s + p.vaccines.length, 0)}</p>
                <p className="text-[12px] text-muted-foreground">Vacunas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">On</p>
                <p className="text-[12px] text-muted-foreground">Telemedicina</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My pets with vaccine cards and telemedicine */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" /> Mis mascotas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientPets.map(pet => {
              const Icon = SPECIES_ICON[pet.species] || Dog
              const vaccinesDueSoon = pet.vaccines.filter(v => {
                if (!v.nextDue) return false
                const days = daysUntil(v.nextDue)
                return days <= 60
              })
              return (
                <Card key={pet.id} className="overflow-hidden">
                  <div className="relative h-32 bg-muted">
                    <img src={pet.photoUrl} alt={pet.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div className="text-white">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold">{pet.name}</h3>
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                            <Icon className="h-4 w-4 text-emerald-600" />
                          </div>
                        </div>
                        <p className="text-[12px] text-white/80">{pet.breed} · {calculateAge(pet.birthDate)}</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-md bg-muted/30 py-2">
                        <p className="text-sm font-bold text-foreground">{pet.weight}kg</p>
                        <p className="text-[10px] text-muted-foreground">Peso</p>
                      </div>
                      <div className="rounded-md bg-muted/30 py-2">
                        <p className="text-sm font-bold text-foreground capitalize">{pet.sex === 'M' ? 'Macho' : 'Hembra'}</p>
                        <p className="text-[10px] text-muted-foreground">Sexo</p>
                      </div>
                      <div className="rounded-md bg-muted/30 py-2">
                        <p className="text-sm font-bold text-foreground">{pet.sterilized ? 'Sí' : 'No'}</p>
                        <p className="text-[10px] text-muted-foreground">Esteril.</p>
                      </div>
                    </div>

                    {/* Vaccines due soon */}
                    {vaccinesDueSoon.length > 0 && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Syringe className="h-3.5 w-3.5 text-amber-600" />
                          <p className="text-[11px] font-medium text-amber-700">Vacunas próximas</p>
                        </div>
                        {vaccinesDueSoon.map(v => {
                          const days = daysUntil(v.nextDue!)
                          return (
                            <div key={v.id} className="flex items-center justify-between text-[11px] text-amber-800">
                              <span>{v.name}</span>
                              <Badge variant="outline" className={cn(
                                'text-[10px] border-amber-300',
                                days < 0 ? 'bg-rose-50 text-rose-700' : 'bg-amber-100 text-amber-700'
                              )}>
                                {days < 0 ? 'Vencida' : `En ${days}d`}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setTelemedicinePetId(pet.id)}
                      >
                        <Video className="h-4 w-4" />
                        Videollamada
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Calendar className="h-4 w-4" />
                        Pedir turno
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" /> Próximas citas
          </h2>
          <Card>
            <CardContent className="p-0">
              {upcomingAppts.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No tienes citas programadas
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {upcomingAppts.map(apt => {
                    const pet = pets.find(p => p.id === apt.petId)
                    const vet = vets.find(v => v.id === apt.vetId)
                    return (
                      <li key={apt.id} className="flex items-center gap-3 p-3 hover:bg-muted/30">
                        <div className="flex flex-col items-center justify-center w-14 shrink-0 rounded-lg bg-emerald-50 py-1.5 text-emerald-700">
                          <span className="text-[10px] font-medium uppercase">{new Date(apt.date).toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                          <span className="text-sm font-bold">{new Date(apt.date).getDate()}</span>
                          <span className="text-[10px]">{apt.time}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-foreground">{apt.reason}</p>
                            <Badge variant="outline" className={cn('text-[10px]', TYPE_STYLES[apt.type])}>
                              {apt.type}
                            </Badge>
                          </div>
                          <p className="text-[12px] text-muted-foreground">
                            {pet?.name} · {vet?.name}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          {apt.status}
                        </Badge>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Telemedicine modal */}
      {telemedicinePetId && (
        <TelemedicineCall
          petId={telemedicinePetId}
          clientId={clientId}
          onClose={() => setTelemedicinePetId(null)}
        />
      )}
    </div>
  )
}
