'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// ============ Consultations CRUD ============

export interface ConsultationInput {
  id?: string
  petId: string
  vetId: string
  appointmentId?: string
  reason?: string
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
  audioTranscript?: string
  aiGenerated?: boolean
  aiSummary?: string
  weightKg?: number | null
  temperatureC?: number | null
  heartRate?: number | null
  respiratoryRate?: number | null
  bodyConditionScore?: number | null
  status?: string
  diagnoses?: Array<{
    name: string
    icdCode?: string
    confidence?: number
    isPrimary?: boolean
    isAiSuggested?: boolean
    accepted?: boolean
    notes?: string
  }>
  treatments?: Array<{
    drugName: string
    doseMg: number
    dosePerKg?: number
    frequency: string
    duration: string
    route: string
    notes?: string
    isAiSuggested?: boolean
    accepted?: boolean
  }>
}

export function useConsultations(petId?: string) {
  const qs = petId ? `?petId=${petId}` : ''
  return useQuery({
    queryKey: ['vet', 'consultations', petId],
    queryFn: async () => {
      const res = await fetch(`/api/vet/consultations${qs}`)
      if (!res.ok) throw new Error('Error al cargar consultas')
      return res.json()
    },
  })
}

export function useSaveConsultation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: ConsultationInput) => {
      const res = await fetch('/api/vet/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al guardar consulta')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vet', 'consultations'] })
    },
  })
}

export function useAutosaveConsultation() {
  return useMutation({
    mutationFn: async (data: { id: string } & Partial<ConsultationInput>) => {
      const res = await fetch('/api/vet/consultations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al autoguardar')
      return res.json()
    },
  })
}

// ============ AI Mutations ============

export interface SoapResult {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

export function useAIDictation() {
  return useMutation({
    mutationFn: async ({ audio_base64, pet }: { audio_base64: string; pet: any }) => {
      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_base64, pet }),
      })
      if (!res.ok) throw new Error('Error en transcripción IA')
      return res.json() as Promise<{ transcript: string; soap: SoapResult }>
    },
  })
}

export function useAISoapDraft() {
  return useMutation({
    mutationFn: async ({ text, pet }: { text: string; pet: any }) => {
      const res = await fetch('/api/ai/soap-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, pet }),
      })
      if (!res.ok) throw new Error('Error al estructurar SOAP')
      return res.json() as Promise<{ soap: SoapResult }>
    },
  })
}

export function useAIAnamnesis() {
  return useMutation({
    mutationFn: async ({ pet, reason }: { pet: any; reason: string }) => {
      const res = await fetch('/api/ai/anamnesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pet, reason }),
      })
      if (!res.ok) throw new Error('Error al generar anamnesis')
      return res.json() as Promise<{ questions: string[] }>
    },
  })
}

export interface Differential {
  name: string
  confidence: number
  rationale: string
  recommended_tests?: string
}

export function useAIDiagnosis() {
  return useMutation({
    mutationFn: async ({
      pet,
      subjective,
      objective,
      assessment,
    }: {
      pet: any
      subjective: string
      objective: string
      assessment: string
    }) => {
      const res = await fetch('/api/ai/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pet, subjective, objective, assessment }),
      })
      if (!res.ok) throw new Error('Error en diagnóstico IA')
      return res.json() as Promise<{ differentials: Differential[] }>
    },
  })
}

export interface Pattern {
  type: string
  severity: 'info' | 'warning' | 'critical'
  description: string
  recommendation: string
}

export function useAIPatternDetection() {
  return useMutation({
    mutationFn: async ({ pet, consultations }: { pet: any; consultations: any[] }) => {
      const res = await fetch('/api/ai/pattern-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pet, consultations }),
      })
      if (!res.ok) throw new Error('Error en detección de patrones')
      return res.json() as Promise<{ patterns: Pattern[] }>
    },
  })
}

export interface TelemedicineSummary {
  summary: string
  recommendations: string[]
  followUp: string
  prescriptions: Array<{ drugName: string; dose: string; duration: string }>
}

export function useAITelemedicineSummary() {
  return useMutation({
    mutationFn: async ({
      pet,
      vet,
      chatMessages,
      durationSec,
    }: {
      pet: any
      vet: any
      chatMessages: any[]
      durationSec: number
    }) => {
      const res = await fetch('/api/ai/telemedicine-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pet, vet, chatMessages, durationSec }),
      })
      if (!res.ok) throw new Error('Error al generar resumen')
      return res.json() as Promise<TelemedicineSummary>
    },
  })
}
