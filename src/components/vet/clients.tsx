'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  Dog,
  Phone,
  Mail,
  MapPin,
  Heart,
  Award,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Topbar } from '@/components/vet/topbar'
import { cn } from '@/lib/utils'
import { useClients, usePets, useInvoices } from '@/lib/vet-hooks'
import { formatDate, formatCurrency } from '@/lib/vet-data'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function ClientsView() {
  const { data: clients = [], isLoading } = useClients()
  const { data: pets = [] } = usePets()
  const { data: invoices = [] } = useInvoices()
  const [search, setSearch] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return clients.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    )
  }, [clients, search])

  return (
    <div>
      <Topbar title="Clientes" subtitle={`${clients.length} dueños registrados`} actionLabel="Nuevo cliente" />

      <div className="p-6 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Card key={i}><CardContent className="h-48 bg-muted animate-pulse" /></Card>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(client => {
              const clientPets = pets.filter(p => p.clientId === client.id)
              const clientInvoices = invoices.filter(i => i.clientId === client.id)
              const totalSpent = clientInvoices.filter(i => i.status === 'Pagada').reduce((sum, i) => sum + i.total, 0)
              return (
                <Card
                  key={client.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                  onClick={() => setSelectedClientId(client.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold', client.avatarColor)}>
                        {client.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{client.name}</h3>
                        <p className="text-[12px] text-muted-foreground">Desde {formatDate(client.since)}</p>
                      </div>
                      {client.loyaltyPoints > 300 && <Award className="h-4 w-4 text-amber-500 shrink-0" />}
                    </div>

                    <div className="mt-4 space-y-1.5 text-[12px]">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground">Mascotas</p>
                        <p className="text-sm font-semibold text-foreground">{clientPets.length}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground">Puntos</p>
                        <p className="text-sm font-semibold text-amber-600">{client.loyaltyPoints}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground">Gastado</p>
                        <p className="text-sm font-semibold text-emerald-600">{formatCurrency(totalSpent)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={!!selectedClientId} onOpenChange={open => !open && setSelectedClientId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedClientId && (
            <ClientDetail
              clientId={selectedClientId}
              pets={pets}
              invoices={invoices}
              clients={clients}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ClientDetail({
  clientId,
  pets,
  invoices,
  clients,
}: {
  clientId: string
  pets: any[]
  invoices: any[]
  clients: any[]
}) {
  const client = clients.find(c => c.id === clientId)
  const clientPets = pets.filter(p => p.clientId === clientId)
  const clientInvoices = invoices.filter(i => i.clientId === clientId)

  if (!client) return null

  return (
    <div>
      <DialogHeader className="pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold', client.avatarColor)}>
            {client.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <DialogTitle className="text-xl">{client.name}</DialogTitle>
            <p className="text-[12px] text-muted-foreground">Cliente desde {formatDate(client.since)}</p>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-5 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Phone className="h-3.5 w-3.5" />
              <span className="text-[11px] uppercase">Teléfono</span>
            </div>
            <p className="text-sm text-foreground">{client.phone}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Mail className="h-3.5 w-3.5" />
              <span className="text-[11px] uppercase">Email</span>
            </div>
            <p className="text-sm text-foreground truncate">{client.email}</p>
          </div>
          <div className="rounded-lg border border-border p-3 sm:col-span-2">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-[11px] uppercase">Dirección</span>
            </div>
            <p className="text-sm text-foreground">{client.address}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Dog className="h-4 w-4 text-emerald-600" /> Mascotas ({clientPets.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {clientPets.map(pet => (
              <div key={pet.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <img src={pet.photoUrl} alt={pet.name} className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{pet.name}</p>
                  <p className="text-[12px] text-muted-foreground truncate">{pet.breed}</p>
                </div>
                <Badge variant="outline" className="capitalize text-[10px]">{pet.species}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" /> Facturas ({clientInvoices.length})
          </h3>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Nº</th>
                  <th className="px-3 py-2 text-left font-medium">Fecha</th>
                  <th className="px-3 py-2 text-right font-medium">Importe</th>
                  <th className="px-3 py-2 text-right font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {clientInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">Sin facturas</td>
                  </tr>
                ) : (
                  clientInvoices.map(inv => (
                    <tr key={inv.id} className="border-t border-border">
                      <td className="px-3 py-2 font-mono text-[12px]">{inv.number}</td>
                      <td className="px-3 py-2 text-[12px]">{formatDate(inv.date)}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(inv.total)}</td>
                      <td className="px-3 py-2 text-right">
                        <Badge variant="outline" className={cn(
                          'text-[10px]',
                          inv.status === 'Pagada' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          inv.status === 'Pendiente' && 'bg-amber-50 text-amber-700 border-amber-200',
                          inv.status === 'Vencida' && 'bg-rose-50 text-rose-700 border-rose-200',
                        )}>
                          {inv.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-semibold text-amber-700">Programa de fidelización</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-700">{client.loyaltyPoints}</span>
            <span className="text-sm text-amber-600">puntos acumulados</span>
          </div>
          <p className="text-[12px] text-amber-600/80 mt-1">
            {client.loyaltyPoints >= 500
              ? 'Nivel Premium · 15% de descuento en próxima visita'
              : client.loyaltyPoints >= 200
              ? 'Nivel Plata · 10% de descuento en próxima visita'
              : 'Acumula más puntos para obtener descuentos'}
          </p>
        </div>
      </div>
    </div>
  )
}
