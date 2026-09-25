'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ============================================================================
// Tipos
// ============================================================================

export interface Hospitalization {
  id: string
  petId: string
  attendingVetId: string
  admissionDate: string
  dischargeDate: string | null
  cage: string
  status: 'active' | 'observation' | 'discharged'
  reason: string
  weightKg: number | null
  feedingPlan: string | null
  fluidTherapy: string | null
  notes: string | null
  pet?: {
    id: string
    name: string
    species: string
    breed: string
    photoUrl: string
    status: string
    client?: { id: string; name: string; phone: string }
  }
  attendingVet?: {
    id: string
    name: string
    specialty: string
    avatarColor: string
    role: string
  }
  shiftLogs?: ShiftLog[]
}

export type ShiftLogType = 'medication' | 'incident' | 'behavior' | 'vital' | 'note' | 'handover'

export interface ShiftLog {
  id: string
  hospitalizationId: string
  timestamp: string
  type: ShiftLogType
  reporterVetId: string
  incomingVetId: string | null
  content: string
  drugName: string | null
  doseMg: number | null
  dosePerKg: number | null
  route: string | null
  temperatureC: number | null
  heartRate: number | null
  respiratoryRate: number | null
  weightKg: number | null
  appetite: string | null
  hydration: string | null
  urination: string | null
  feces: string | null
  severity: 'info' | 'warning' | 'critical' | null
  reporterVet?: {
    id: string
    name: string
    role: string
    avatarColor: string
  }
  incomingVet?: {
    id: string
    name: string
    role: string
    avatarColor: string
  } | null
}

// ============================================================================
// Queries (con polling en tiempo real)
// ============================================================================

const POLL_INTERVAL = 5000 // 5 segundos — refresco automático

export function useHospitalizations(status: 'active' | 'all' = 'active') {
  return useQuery<Hospitalization[]>({
    queryKey: ['vet', 'hospitalizations', status],
    queryFn: async () => {
      const res = await fetch(`/api/vet/hospitalizations?status=${status}`)
      if (!res.ok) throw new Error('Error al cargar internaciones')
      return res.json()
    },
    // Polling en tiempo real: refresca cada 5s automáticamente
    refetchInterval: POLL_INTERVAL,
    refetchOnWindowFocus: true,
    staleTime: POLL_INTERVAL,
  })
}

export function useHospitalization(id: string | null) {
  return useQuery<Hospitalization>({
    queryKey: ['vet', 'hospitalizations', id],
    queryFn: async () => {
      if (!id) throw new Error('id required')
      const res = await fetch(`/api/vet/hospitalizations/${id}`)
      if (!res.ok) throw new Error('Error al cargar detalle')
      return res.json()
    },
    enabled: !!id,
    refetchInterval: POLL_INTERVAL,
    refetchOnWindowFocus: true,
    staleTime: POLL_INTERVAL,
  })
}

// ============================================================================
// Mutations
// ============================================================================

export interface NewHospitalizationInput {
  petId: string
  attendingVetId: string
  cage: string
  reason: string
  weightKg?: number
  feedingPlan?: string
  fluidTherapy?: string
  notes?: string
}

export function useCreateHospitalization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: NewHospitalizationInput) => {
      const res = await fetch('/api/vet/hospitalizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al admitir internación')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vet', 'hospitalizations'] })
    },
  })
}

export function useDischargeHospitalization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/vet/hospitalizations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al dar de alta')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vet', 'hospitalizations'] })
    },
  })
}

export interface NewShiftLogInput {
  hospitalizationId: string
  reporterVetId: string
  incomingVetId?: string
  type: ShiftLogType
  content: string
  drugName?: string
  doseMg?: number
  dosePerKg?: number
  route?: string
  temperatureC?: number
  heartRate?: number
  respiratoryRate?: number
  weightKg?: number
  appetite?: string
  hydration?: string
  urination?: string
  feces?: string
  severity?: 'info' | 'warning' | 'critical'
}

export function useAddShiftLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: NewShiftLogInput) => {
      const res = await fetch('/api/vet/shift-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al añadir entrada a bitácora')
      return res.json()
    },
    onSuccess: (_data, variables) => {
      // Invalidar tanto la lista como el detalle
      qc.invalidateQueries({ queryKey: ['vet', 'hospitalizations'] })
      qc.invalidateQueries({ queryKey: ['vet', 'shift-logs', variables.hospitalizationId] })
    },
  })
}
