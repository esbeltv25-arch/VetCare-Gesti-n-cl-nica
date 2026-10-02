'use client'

import { useTranslation } from '@/lib/vet-clinic-hooks'
import { useState, useMemo } from 'react'
import {
  Search,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  Check,
  X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Topbar } from '@/components/vet/topbar'
import { cn } from '@/lib/utils'
import { useInvoices, useClients, usePets } from '@/lib/vet-hooks'
import { formatCurrency, formatDate } from '@/lib/vet-data'
import { NewInvoiceDialog } from '@/components/vet/new-entity-dialogs'
import { useUpdateInvoice } from '@/lib/vet-clinic-hooks'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const STATUS_FILTERS = ['Todos', 'Pagada', 'Pendiente', 'Vencida'] as const

const STATUS_STYLES: Record<string, string> = {
  'Pagada': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Pendiente': 'bg-amber-100 text-amber-700 border-amber-200',
  'Vencida': 'bg-rose-100 text-rose-700 border-rose-200',
}

const PAYMENT_ICONS: Record<string, any> = {
  'Tarjeta': CreditCard,
  'Efectivo': Banknote,
  'Bizum': Smartphone,
}

export function BillingView() {
  const { data: invoices = [], isLoading } = useInvoices(); const { t } = useTranslation()
  const { data: clients = [] } = useClients()
  const { data: pets = [] } = usePets()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_FILTERS[number]>('Todos')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [showNewInvoice, setShowNewInvoice] = useState(false)

  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      const client = clients.find(c => c.id === inv.clientId)
      const pet = pets.find(p => p.id === inv.petId)
      const matchesSearch =
        inv.number.toLowerCase().includes(search.toLowerCase()) ||
        client?.name.toLowerCase().includes(search.toLowerCase()) ||
        pet?.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'Todos' || inv.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [invoices, clients, pets, search, statusFilter])

  const totalPaid = invoices.filter(i => i.status === 'Pagada').reduce((sum, i) => sum + i.total, 0)
  const totalPending = invoices.filter(i => i.status === 'Pendiente').reduce((sum, i) => sum + i.total, 0)
  const totalOverdue = invoices.filter(i => i.status === 'Vencida').reduce((sum, i) => sum + i.total, 0)
  const totalRevenue = totalPaid + totalPending + totalOverdue

  const stats = [
    { label: 'Ingresos totales', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'emerald', desc: 'Histórico acumulado' },
    { label: 'Cobrado', value: formatCurrency(totalPaid), icon: TrendingUp, color: 'sky', desc: 'Facturas pagadas' },
    { label: 'Pendiente de cobro', value: formatCurrency(totalPending), icon: Clock, color: 'amber', desc: 'Por cobrar' },
    { label: 'Vencido', value: formatCurrency(totalOverdue), icon: AlertCircle, color: 'rose', desc: 'Requiere gestión' },
  ]

  const statStyles: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  }

  if (isLoading) {
    return (
      <div>
        <Topbar title="Facturación" subtitle="Cargando..." />
        <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Card key={i}><CardContent className="h-32 bg-muted animate-pulse" /></Card>)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Topbar moduleKey="billing" title="Facturación" subtitle={t("bill.subtitle")} actionLabel="Nueva factura" onAction={() => setShowNewInvoice(true)} />

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
                placeholder={t("bill.searchByNumber")}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
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

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-[11px] uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Nº factura</th>
                    <th className="px-4 py-3 text-left font-medium">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Mascota</th>
                    <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Pago</th>
                    <th className="px-4 py-3 text-right font-medium">Importe</th>
                    <th className="px-4 py-3 text-right font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        <Receipt className="h-10 w-10 mx-auto mb-2 opacity-40" />
                        No se encontraron facturas
                      </td>
                    </tr>
                  ) : (
                    filtered.map(inv => {
                      const client = clients.find(c => c.id === inv.clientId)
                      const pet = pets.find(p => p.id === inv.petId)
                      const PayIcon = inv.paymentMethod ? PAYMENT_ICONS[inv.paymentMethod] : null
                      return (
                        <tr
                          key={inv.id}
                          className="border-t border-border hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => setSelectedInvoiceId(inv.id)}
                        >
                          <td className="px-4 py-3 font-mono text-[12px] font-medium text-foreground">{inv.number}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground truncate">{client?.name}</p>
                            <p className="text-[11px] text-muted-foreground">{inv.items.length} ítems</p>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-[12px] text-muted-foreground">{pet?.name}</td>
                          <td className="px-4 py-3 hidden sm:table-cell text-[12px] text-muted-foreground">{formatDate(inv.date)}</td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {inv.paymentMethod && PayIcon ? (
                              <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                                <PayIcon className="h-3.5 w-3.5" />
                                {inv.paymentMethod}
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="font-semibold text-foreground">{formatCurrency(inv.total)}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Badge variant="outline" className={cn('text-[10px]', STATUS_STYLES[inv.status])}>
                              {inv.status}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedInvoiceId} onOpenChange={open => !open && setSelectedInvoiceId(null)}>
        <DialogContent className="max-w-lg">
          {selectedInvoiceId && (
            <InvoiceDetail
              invoiceId={selectedInvoiceId}
              invoices={invoices}
              clients={clients}
              pets={pets}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InvoiceDetail({ invoiceId, invoices, clients, pets }: { invoiceId: string; invoices: any[]; clients: any[]; pets: any[] }) {
  const inv = invoices.find(i => i.id === invoiceId)
  const markPaid = useUpdateInvoice()
  if (!inv) return null
  const client = clients.find(c => c.id === inv.clientId)
  const pet = pets.find(p => p.id === inv.petId)
  const PayIcon = inv.paymentMethod ? PAYMENT_ICONS[inv.paymentMethod] : null

  return (
    <div>
      <DialogHeader className="pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="font-mono text-base">{inv.number}</DialogTitle>
            <p className="text-[12px] text-muted-foreground">{formatDate(inv.date)}</p>
          </div>
          <Badge variant="outline" className={cn('text-[10px]', STATUS_STYLES[inv.status])}>
            {inv.status}
          </Badge>
        </div>
      </DialogHeader>

      <div className="space-y-4 pt-4">
        <div className="rounded-lg bg-muted/30 p-3">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold', client?.avatarColor)}>
              {client?.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{client?.name}</p>
              <p className="text-[12px] text-muted-foreground">Paciente: {pet?.name} · {pet?.breed}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[12px] font-medium uppercase text-muted-foreground mb-2">Detalle</p>
          <div className="space-y-1.5">
            {inv.items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-start justify-between gap-3 rounded-md border border-border p-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground">{item.description}</p>
                  <p className="text-[11px] text-muted-foreground">{item.qty} × {formatCurrency(item.unitPrice)}</p>
                </div>
                <p className="text-[13px] font-medium text-foreground shrink-0">
                  {formatCurrency(item.qty * item.unitPrice)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-700">Total</span>
            <span className="text-2xl font-bold text-emerald-700">{formatCurrency(inv.total)}</span>
          </div>
          {inv.paymentMethod && PayIcon && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-emerald-200">
              <PayIcon className="h-4 w-4 text-emerald-600" />
              <span className="text-[12px] text-emerald-700">Pagado con {inv.paymentMethod}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {inv.status !== 'Pagada' && (
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={async () => {
                try {
                  await markPaid.mutateAsync({ id: inv.id, status: 'Pagada', paymentMethod: 'Tarjeta' })
                  toast.success(`Factura ${inv.number} marcada como pagada`)
                } catch (e: any) {
                  toast.error('Error: ' + e.message)
                }
              }}
              disabled={markPaid.isPending}
            >
              <Check className="h-4 w-4" />
              {markPaid.isPending ? 'Marcando...' : 'Marcar como pagada'}
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => toast.info(`PDF de la factura ${inv.number} en desarrollo — usa el botón "Imprimir" del navegador (Ctrl+P) mientras tanto`)}
          >
            <Receipt className="h-4 w-4" />
            Descargar PDF
          </Button>
          {inv.status !== 'Pagada' && (
            <Button variant="ghost" size="icon" className="text-rose-600 hover:text-rose-700">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <NewInvoiceDialog
        open={showNewInvoice}
        onOpenChange={setShowNewInvoice}
        clients={clients}
        pets={pets}
      />
    </div>
  )
}
