'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { translate, type Language } from '@/lib/i18n'

// ============================================================================
// Tipos
// ============================================================================

export interface ClinicSettings {
  id: string
  brandName: string
  brandSubtitle: string
  primaryColor: string  // hex
  accentColor: string   // hex
  darkMode: boolean
  moduleLabels: Record<string, string>  // overrides de etiquetas del sidebar
  moduleLayout: {
    order?: string[]
    hidden?: string[]
  }
  language: Language
}

const DEFAULT_SETTINGS: ClinicSettings = {
  id: 'singleton',
  brandName: 'VetCare',
  brandSubtitle: 'Gestión clínica',
  primaryColor: '#10b981',
  accentColor: '#7c3aed',
  darkMode: false,
  moduleLabels: {},
  moduleLayout: {},
  language: 'es',
}

// ============================================================================
// Queries
// ============================================================================

export function useClinicSettings() {
  return useQuery<ClinicSettings>({
    queryKey: ['vet', 'clinic-settings'],
    queryFn: async () => {
      const res = await fetch('/api/vet/clinic-settings')
      if (!res.ok) throw new Error('Error al cargar settings')
      return res.json()
    },
    staleTime: 60_000, // 1 minuto
  })
}

export function useUpdateClinicSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (updates: Partial<ClinicSettings>) => {
      const res = await fetch('/api/vet/clinic-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Error al guardar settings')
      return res.json()
    },
    onSuccess: (data) => {
      qc.setQueryData(['vet', 'clinic-settings'], data)
    },
  })
}

export function useUpdatePet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (updates: { id: string; galleryPhotos?: string[]; photoUrl?: string }) => {
      const res = await fetch('/api/vet/pets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Error al actualizar mascota')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vet', 'pets'] })
    },
  })
}

// ============================================================================
// Hook que aplica los settings al documento (CSS variables + dark mode)
// ============================================================================

export function useApplyClinicSettings() {
  const { data: settings } = useClinicSettings()

  useEffect(() => {
    if (!settings) return
    const root = document.documentElement
    // Aplicar modo oscuro
    if (settings.darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    // Aplicar colores como CSS variables
    root.style.setProperty('--clinic-primary', settings.primaryColor)
    root.style.setProperty('--clinic-accent', settings.accentColor)
    // Aplicar idioma al documento
    root.lang = settings.language || 'es'
    // Actualizar título del documento
    document.title = `${settings.brandName} · ${settings.brandSubtitle}`
  }, [settings])
}

// Hook de traducción: usa el idioma de los settings
export function useTranslation() {
  const { data: settings } = useClinicSettings()
  const lang: Language = (settings?.language as Language) || 'es'
  const t = (key: string): string => translate(key, lang)
  return { t, lang }
}

// Helper para resolver etiqueta de módulo con override
export function useModuleLabel(key: string, fallback: string): string {
  const { data: settings } = useClinicSettings()
  // Primero check override del usuario, luego traducción del idioma, luego fallback
  if (settings?.moduleLabels?.[key]) return settings.moduleLabels[key]
  const lang = (settings?.language as Language) || 'es'
  const translated = translate(`sidebar.${key}`, lang)
  return translated !== `sidebar.${key}` ? translated : fallback
}

export { DEFAULT_SETTINGS }

// ============================================================================
// Mutaciones de creación (botones "Nuevo X")
// ============================================================================

export function useCreatePet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      name: string
      species: string
      breed: string
      birthDate: string
      weight?: number
      sex?: string
      microchip?: string
      sterilized?: boolean
      photoUrl?: string
      allergies?: string[]
      chronicConditions?: string[]
      status?: string
      clientId: string
    }) => {
      const res = await fetch('/api/vet/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al crear mascota')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vet', 'pets'] })
      qc.invalidateQueries({ queryKey: ['vet', 'dashboard'] })
    },
  })
}

export function useCreateInventoryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      name: string
      category: string
      stock: number
      minStock: number
      unit?: string
      expiryDate?: string
      supplier?: string
      price?: number
      lot?: string
    }) => {
      const res = await fetch('/api/vet/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al crear producto')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vet', 'inventory'] })
      qc.invalidateQueries({ queryKey: ['vet', 'dashboard'] })
    },
  })
}

export function useCreateVet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      name: string
      role: string
      specialty?: string
      phone?: string
      email?: string
      shift?: string
      avatarColor?: string
    }) => {
      const res = await fetch('/api/vet/vets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al crear empleado')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vet', 'vets'] })
      qc.invalidateQueries({ queryKey: ['vet', 'dashboard'] })
    },
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      number: string
      clientId: string
      petId: string
      date?: string
      status?: string
      paymentMethod?: string
      items: Array<{ description: string; qty: number; unitPrice: number }>
    }) => {
      const res = await fetch('/api/vet/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al crear factura')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vet', 'invoices'] })
      qc.invalidateQueries({ queryKey: ['vet', 'dashboard'] })
    },
  })
}

export function useUpdateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string; status?: string; paymentMethod?: string }) => {
      const res = await fetch('/api/vet/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al actualizar factura')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vet', 'invoices'] })
      qc.invalidateQueries({ queryKey: ['vet', 'dashboard'] })
    },
  })
}
