'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

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
}

const DEFAULT_SETTINGS: ClinicSettings = {
  id: 'singleton',
  brandName: 'VetCare',
  brandSubtitle: 'Gestión clínica',
  primaryColor: '#10b981',
  accentColor: '#7c3aed',
  darkMode: false,
  moduleLabels: {},
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
    // Actualizar título del documento
    document.title = `${settings.brandName} · ${settings.brandSubtitle}`
  }, [settings])
}

// Helper para resolver etiqueta de módulo con override
export function useModuleLabel(key: string, fallback: string): string {
  const { data: settings } = useClinicSettings()
  return settings?.moduleLabels?.[key] || fallback
}

export { DEFAULT_SETTINGS }
