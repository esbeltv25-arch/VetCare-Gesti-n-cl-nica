'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Client,
  Pet,
  Vet,
  Appointment,
  InventoryItem,
  Invoice,
} from '@/lib/vet-data'

// Hook para datos del dashboard (KPIs, alertas, gráficos)
export interface DashboardData {
  kpis: {
    clients: number
    pets: number
    activeVets: number
    totalRevenue: number
    paidRevenue: number
    pendingRevenue: number
    overdueRevenue: number
    todaysAppointmentsCount: number
    confirmedToday: number
  }
  todaysAppointments: (Appointment & { pet: { name: string; breed: string; photoUrl: string }; client: { name: string }; vet: { name: string } })[]
  activeVets: Vet[]
  speciesDistribution: Record<string, number>
  criticalPets: { id: string; species: string; status: string }[]
  lowStock: InventoryItem[]
  expiringSoon: InventoryItem[]
  expired: InventoryItem[]
  pendingInvoices: number
  overdueInvoices: number
  monthlyRevenue: { month: string; value: number }[]
  appointmentsByWeekday: { day: string; citas: number }[]
  invoicesSummary: { total: number; paid: number; pending: number; overdue: number }
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['vet', 'dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/vet/dashboard')
      if (!res.ok) throw new Error('Error al cargar dashboard')
      return res.json()
    },
  })
}

export function usePets() {
  return useQuery<Pet[]>({
    queryKey: ['vet', 'pets'],
    queryFn: async () => {
      const res = await fetch('/api/vet/pets')
      if (!res.ok) throw new Error('Error al cargar mascotas')
      return res.json()
    },
  })
}

export function useClients() {
  return useQuery<Client[]>({
    queryKey: ['vet', 'clients'],
    queryFn: async () => {
      const res = await fetch('/api/vet/clients')
      if (!res.ok) throw new Error('Error al cargar clientes')
      return res.json()
    },
  })
}

export function useVets() {
  return useQuery<Vet[]>({
    queryKey: ['vet', 'vets'],
    queryFn: async () => {
      const res = await fetch('/api/vet/vets')
      if (!res.ok) throw new Error('Error al cargar personal')
      return res.json()
    },
  })
}

export function useInventory() {
  return useQuery<InventoryItem[]>({
    queryKey: ['vet', 'inventory'],
    queryFn: async () => {
      const res = await fetch('/api/vet/inventory')
      if (!res.ok) throw new Error('Error al cargar inventario')
      return res.json()
    },
  })
}

export function useInvoices() {
  return useQuery<Invoice[]>({
    queryKey: ['vet', 'invoices'],
    queryFn: async () => {
      const res = await fetch('/api/vet/invoices')
      if (!res.ok) throw new Error('Error al cargar facturas')
      return res.json()
    },
  })
}

export interface AppointmentQuery {
  date?: string
  from?: string
  to?: string
}

export function useAppointments(query: AppointmentQuery = {}) {
  const params = new URLSearchParams()
  if (query.date) params.set('date', query.date)
  if (query.from) params.set('from', query.from)
  if (query.to) params.set('to', query.to)
  const qs = params.toString()
  return useQuery<Appointment[]>({
    queryKey: ['vet', 'appointments', query],
    queryFn: async () => {
      const res = await fetch(`/api/vet/appointments${qs ? `?${qs}` : ''}`)
      if (!res.ok) throw new Error('Error al cargar citas')
      return res.json()
    },
  })
}

// Mutación para mover una cita (drag-and-drop)
export function useUpdateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (updates: Partial<Appointment> & { id: string }) => {
      const res = await fetch('/api/vet/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Error al actualizar cita')
      return res.json()
    },
    onMutate: async (updates) => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: ['vet', 'appointments'] })
      const previousQueries = qc.getQueriesData<Appointment[]>({ queryKey: ['vet', 'appointments'] })
      qc.setQueriesData<Appointment[]>({ queryKey: ['vet', 'appointments'] }, (old) => {
        if (!old) return old
        return old.map(a => a.id === updates.id ? { ...a, ...updates } : a)
      })
      return { previousQueries }
    },
    onError: (_err, _updates, ctx) => {
      ctx?.previousQueries.forEach(([key, data]) => {
        qc.setQueryData(key, data)
      })
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['vet', 'appointments'] })
      qc.invalidateQueries({ queryKey: ['vet', 'dashboard'] })
    },
  })
}

// Mutación para crear cita
export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Appointment, 'id'>) => {
      const res = await fetch('/api/vet/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al crear cita')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vet', 'appointments'] })
      qc.invalidateQueries({ queryKey: ['vet', 'dashboard'] })
    },
  })
}

// Mutación para crear cliente
export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Client>) => {
      const res = await fetch('/api/vet/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al crear cliente')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vet', 'clients'] })
      qc.invalidateQueries({ queryKey: ['vet', 'dashboard'] })
    },
  })
}

// Helper para cliente por id
export function useClient(id: string | null) {
  return useQuery({
    queryKey: ['vet', 'clients', id],
    queryFn: async () => {
      if (!id) return null
      const res = await fetch(`/api/vet/clients/${id}`)
      if (!res.ok) throw new Error('Error al cargar cliente')
      return res.json()
    },
    enabled: !!id,
  })
}
