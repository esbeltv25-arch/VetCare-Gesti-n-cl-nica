'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  useCreatePet,
  useCreateInventoryItem,
  useCreateVet,
  useCreateInvoice,
} from '@/lib/vet-clinic-hooks'
import { useCreateClient, useCreateAppointment } from '@/lib/vet-hooks'

const AVATAR_COLORS = [
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-cyan-100 text-cyan-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
]

export function NewClientDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const create = useCreateClient()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')

  async function handleSubmit() {
    if (!name || !phone || !email) {
      toast.error('Nombre, teléfono y email son obligatorios')
      return
    }
    try {
      await create.mutateAsync({
        name,
        phone,
        email,
        address,
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      })
      toast.success(`Cliente "${name}" creado`)
      setName(''); setPhone(''); setEmail(''); setAddress('')
      onOpenChange(false)
    } catch (e: any) {
      toast.error('Error: ' + e.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nombre completo *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="María González" />
          </div>
          <div>
            <Label>Teléfono *</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+34 611 22 33 44" />
          </div>
          <div>
            <Label>Email *</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="maria@email.com" />
          </div>
          <div>
            <Label>Dirección</Label>
            <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="C/ Mayor 12, Madrid" />
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit} disabled={create.isPending}>
              {create.isPending ? 'Creando...' : 'Crear cliente'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Nuevo paciente (mascota)
// ============================================================================

const PET_PHOTO_PLACEHOLDERS: Record<string, string> = {
  'Perro': 'https://images.unsplash.com/photo-1552053846-06e9c81b4a8?w=400&h=400&fit=crop',
  'Gato': 'https://images.unsplash.com/photo-1514888286974-8cd8d4d3b6c4?w=400&h=400&fit=crop',
  'Conejo': 'https://images.unsplash.com/photo-1591389703635-e16386f9d44b?w=400&h=400&fit=crop',
  'Ave': 'https://images.unsplash.com/photo-1522858547137-f1d8de3a96ed?w=400&h=400&fit=crop',
  'Reptil': 'https://images.unsplash.com/photo-1591378196625-b71f2fa4d2b2?w=400&h=400&fit=crop',
}

export function NewPetDialog({
  open,
  onOpenChange,
  clients,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  clients: Array<{ id: string; name: string }>
}) {
  const create = useCreatePet()
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('Perro')
  const [breed, setBreed] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [weight, setWeight] = useState('')
  const [sex, setSex] = useState('M')
  const [clientId, setClientId] = useState('')
  const [microchip, setMicrochip] = useState('')
  const [sterilized, setSterilized] = useState(false)
  const [allergies, setAllergies] = useState('')
  const [chronicConditions, setChronicConditions] = useState('')

  async function handleSubmit() {
    if (!name || !breed || !birthDate || !clientId) {
      toast.error('Nombre, raza, fecha de nacimiento y dueño son obligatorios')
      return
    }
    try {
      await create.mutateAsync({
        name,
        species,
        breed,
        birthDate,
        weight: weight ? Number(weight) : 0,
        sex,
        microchip,
        sterilized,
        photoUrl: PET_PHOTO_PLACEHOLDERS[species] || PET_PHOTO_PLACEHOLDERS['Perro'],
        allergies: allergies ? allergies.split(',').map(a => a.trim()) : [],
        chronicConditions: chronicConditions ? chronicConditions.split(',').map(c => c.trim()) : [],
        clientId,
      })
      toast.success(`Paciente "${name}" creado`)
      // Reset
      setName(''); setBreed(''); setBirthDate(''); setWeight('')
      setClientId(''); setMicrochip(''); setSterilized(false)
      setAllergies(''); setChronicConditions('')
      onOpenChange(false)
    } catch (e: any) {
      toast.error('Error: ' + e.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo paciente</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nombre *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Luna" />
            </div>
            <div>
              <Label>Especie *</Label>
              <select
                value={species}
                onChange={e => setSpecies(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
              >
                <option>Perro</option>
                <option>Gato</option>
                <option>Conejo</option>
                <option>Ave</option>
                <option>Reptil</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Raza *</Label>
              <Input value={breed} onChange={e => setBreed(e.target.value)} placeholder="Labrador Retriever" />
            </div>
            <div>
              <Label>Fecha de nacimiento *</Label>
              <Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Peso (kg)</Label>
              <Input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="12.5" />
            </div>
            <div>
              <Label>Sexo</Label>
              <select
                value={sex}
                onChange={e => setSex(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
              >
                <option value="M">Macho</option>
                <option value="H">Hembra</option>
              </select>
            </div>
            <div>
              <Label>Esterilizado</Label>
              <select
                value={sterilized ? 'si' : 'no'}
                onChange={e => setSterilized(e.target.value === 'si')}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
              >
                <option value="no">No</option>
                <option value="si">Sí</option>
              </select>
            </div>
          </div>
          <div>
            <Label>Dueño *</Label>
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
            >
              <option value="">Selecciona un cliente...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Microchip</Label>
            <Input value={microchip} onChange={e => setMicrochip(e.target.value)} placeholder="985141052345678" />
          </div>
          <div>
            <Label>Alergias (separadas por comas)</Label>
            <Input value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="Polen, polvo" />
          </div>
          <div>
            <Label>Condiciones crónicas (separadas por comas)</Label>
            <Input value={chronicConditions} onChange={e => setChronicConditions(e.target.value)} placeholder="Displasia de cadera" />
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit} disabled={create.isPending}>
              {create.isPending ? 'Creando...' : 'Crear paciente'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Nuevo producto (inventario)
// ============================================================================

const CATEGORIES = ['Medicamento', 'Alimento', 'Insumo médico', 'Accesorio', 'Higiene']

export function NewInventoryItemDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const create = useCreateInventoryItem()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Medicamento')
  const [stock, setStock] = useState('')
  const [minStock, setMinStock] = useState('')
  const [unit, setUnit] = useState('unidades')
  const [supplier, setSupplier] = useState('')
  const [price, setPrice] = useState('')
  const [lot, setLot] = useState('')
  const [expiryDate, setExpiryDate] = useState('')

  async function handleSubmit() {
    if (!name || !category || stock === '' || minStock === '') {
      toast.error('Nombre, categoría, stock y stock mínimo son obligatorios')
      return
    }
    try {
      await create.mutateAsync({
        name,
        category,
        stock: Number(stock),
        minStock: Number(minStock),
        unit,
        supplier,
        price: price ? Number(price) : 0,
        lot,
        expiryDate: expiryDate || undefined,
      })
      toast.success(`Producto "${name}" creado`)
      setName(''); setStock(''); setMinStock(''); setSupplier('')
      setPrice(''); setLot(''); setExpiryDate('')
      onOpenChange(false)
    } catch (e: any) {
      toast.error('Error: ' + e.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo producto de inventario</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nombre *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Vacuna Antirrábica (Nobivac)" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoría *</Label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label>Unidad</Label>
              <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="dosis / comprimidos / frascos" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Stock *</Label>
              <Input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="24" />
            </div>
            <div>
              <Label>Stock mínimo *</Label>
              <Input type="number" value={minStock} onChange={e => setMinStock(e.target.value)} placeholder="10" />
            </div>
            <div>
              <Label>Precio (€)</Label>
              <Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="18.50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Lote</Label>
              <Input value={lot} onChange={e => setLot(e.target.value)} placeholder="RAB-2024-08" />
            </div>
            <div>
              <Label>Vencimiento</Label>
              <Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Proveedor</Label>
            <Input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="MSD Animal Health" />
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit} disabled={create.isPending}>
              {create.isPending ? 'Creando...' : 'Crear producto'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Nuevo empleado (personal)
// ============================================================================

const ROLES = ['Veterinario', 'Recepción', 'Peluquería', 'Administrador', 'Auxiliar']
const SHIFTS = ['Mañana', 'Tarde', 'Completo']

export function NewVetDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const create = useCreateVet()
  const [name, setName] = useState('')
  const [role, setRole] = useState('Veterinario')
  const [specialty, setSpecialty] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [shift, setShift] = useState('Completo')

  async function handleSubmit() {
    if (!name || !role) {
      toast.error('Nombre y rol son obligatorios')
      return
    }
    try {
      await create.mutateAsync({
        name,
        role,
        specialty,
        phone,
        email,
        shift,
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      })
      toast.success(`Empleado "${name}" creado`)
      setName(''); setSpecialty(''); setPhone(''); setEmail('')
      onOpenChange(false)
    } catch (e: any) {
      toast.error('Error: ' + e.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo empleado</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nombre completo *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Dra. Elena Torres" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Rol *</Label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
              >
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <Label>Turno</Label>
              <select
                value={shift}
                onChange={e => setShift(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
              >
                {SHIFTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label>Especialidad</Label>
            <Input value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Cirugía y traumatología" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Teléfono</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+34 600 11 22 33" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="elena@vetcare.com" />
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit} disabled={create.isPending}>
              {create.isPending ? 'Creando...' : 'Crear empleado'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Nueva factura
// ============================================================================

const PAYMENT_METHODS = ['Tarjeta', 'Efectivo', 'Bizum']
const INVOICE_STATUSES = ['Pagada', 'Pendiente', 'Vencida']

export function NewInvoiceDialog({
  open,
  onOpenChange,
  clients,
  pets,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  clients: Array<{ id: string; name: string }>
  pets: Array<{ id: string; name: string; clientId: string }>
}) {
  const create = useCreateInvoice()
  const [clientId, setClientId] = useState('')
  const [petId, setPetId] = useState('')
  const [status, setStatus] = useState('Pendiente')
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta')
  const [items, setItems] = useState<Array<{ description: string; qty: number; unitPrice: number }>>([
    { description: '', qty: 1, unitPrice: 0 },
  ])

  const filteredPets = pets.filter(p => !clientId || p.clientId === clientId)

  function addItem() {
    setItems(prev => [...prev, { description: '', qty: 1, unitPrice: 0 }])
  }
  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }
  function updateItem(idx: number, field: 'description' | 'qty' | 'unitPrice', value: string) {
    setItems(prev => prev.map((it, i) =>
      i === idx ? { ...it, [field]: field === 'description' ? value : Number(value) } : it
    ))
  }

  async function handleSubmit() {
    if (!clientId || !petId) {
      toast.error('Cliente y mascota son obligatorios')
      return
    }
    const cleanItems = items.filter(i => i.description && i.qty > 0)
    if (cleanItems.length === 0) {
      toast.error('Añade al menos un item con descripción')
      return
    }
    const number = `F-2025-${String(Date.now()).slice(-4)}`
    try {
      await create.mutateAsync({
        number,
        clientId,
        petId,
        status,
        paymentMethod,
        items: cleanItems,
      })
      toast.success(`Factura ${number} creada`)
      setClientId(''); setPetId(''); setStatus('Pendiente')
      setItems([{ description: '', qty: 1, unitPrice: 0 }])
      onOpenChange(false)
    } catch (e: any) {
      toast.error('Error: ' + e.message)
    }
  }

  const total = items.reduce((sum, it) => sum + (it.qty * it.unitPrice), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva factura</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cliente *</Label>
              <select
                value={clientId}
                onChange={e => { setClientId(e.target.value); setPetId('') }}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
              >
                <option value="">Selecciona cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Mascota *</Label>
              <select
                value={petId}
                onChange={e => setPetId(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
                disabled={!clientId}
              >
                <option value="">Selecciona mascota...</option>
                {filteredPets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Estado</Label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
              >
                {INVOICE_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label>Método de pago</Label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
              >
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between mb-2">
              <Label>Items</Label>
              <Button size="sm" variant="outline" onClick={addItem}>+ Añadir item</Button>
            </div>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="Descripción"
                    value={it.description}
                    onChange={e => updateItem(idx, 'description', e.target.value)}
                    className="flex-1 h-9 text-[13px]"
                  />
                  <Input
                    type="number"
                    placeholder="Cant."
                    value={it.qty}
                    onChange={e => updateItem(idx, 'qty', e.target.value)}
                    className="w-20 h-9 text-[13px]"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Precio €"
                    value={it.unitPrice}
                    onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                    className="w-24 h-9 text-[13px]"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-rose-600"
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                  >
                    <span className="text-lg">×</span>
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-2 text-right text-sm font-bold">
              Total: {total.toFixed(2)} €
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit} disabled={create.isPending}>
              {create.isPending ? 'Creando...' : 'Crear factura'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Nuevo turno (cita)
// ============================================================================

const APPOINTMENT_TYPES = ['Consulta', 'Vacunación', 'Cirugía', 'Control', 'Urgencia', 'Peluquería']

export function NewAppointmentDialog({
  open,
  onOpenChange,
  pets,
  clients,
  vets,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  pets: Array<{ id: string; name: string; clientId: string }>
  clients: Array<{ id: string; name: string }>
  vets: Array<{ id: string; name: string; role: string; active: boolean }>
}) {
  const create = useCreateAppointment()
  const [petId, setPetId] = useState('')
  const [vetId, setVetId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState('09:00')
  const [duration, setDuration] = useState('30')
  const [reason, setReason] = useState('')
  const [type, setType] = useState('Consulta')
  const [status, setStatus] = useState('Pendiente')

  const selectedPet = pets.find(p => p.id === petId)
  const clientId = selectedPet?.clientId || ''
  const activeVets = vets.filter(v => v.active)

  async function handleSubmit() {
    if (!petId || !vetId || !date || !time) {
      toast.error('Mascota, veterinario, fecha y hora son obligatorios')
      return
    }
    try {
      await create.mutateAsync({
        petId,
        vetId,
        clientId,
        date,
        time,
        duration: Number(duration),
        reason: reason || `${type} - ${selectedPet?.name || ''}`,
        type,
        status,
      })
      toast.success('Turno creado')
      setPetId(''); setVetId(''); setReason('')
      onOpenChange(false)
    } catch (e: any) {
      toast.error('Error: ' + e.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo turno</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Mascota *</Label>
            <select
              value={petId}
              onChange={e => setPetId(e.target.value)}
              className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
            >
              <option value="">Selecciona mascota...</option>
              {pets.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({clients.find(c => c.id === p.clientId)?.name || 'sin dueño'})
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Veterinario *</Label>
            <select
              value={vetId}
              onChange={e => setVetId(e.target.value)}
              className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
            >
              <option value="">Selecciona veterinario...</option>
              {activeVets.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.role})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Fecha *</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Hora *</Label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
              >
                {APPOINTMENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label>Duración (min)</Label>
              <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="30" />
            </div>
          </div>
          <div>
            <Label>Motivo</Label>
            <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Vacunación anual, control post-op, etc." />
          </div>
          <div>
            <Label>Estado</Label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
            >
              <option>Pendiente</option>
              <option>Confirmada</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit} disabled={create.isPending}>
              {create.isPending ? 'Creando...' : 'Crear turno'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
