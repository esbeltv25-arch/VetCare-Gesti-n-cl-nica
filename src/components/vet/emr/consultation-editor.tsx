'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  ArrowLeft,
  Mic,
  Square,
  Loader2,
  Sparkles,
  Wand2,
  Stethoscope,
  Activity,
  AlertTriangle,
  Plus,
  Check,
  X,
  Save,
  FileText,
  Weight,
  Thermometer,
  Heart,
  Wind,
  Scale,
  Pill,
  ListChecks,
  Brain,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Topbar } from '@/components/vet/topbar'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/vet-clinic-hooks'
import {
  useConsultations,
  useSaveConsultation,
  useAutosaveConsultation,
  useAIDictation,
  useAISoapDraft,
  useAIAnamnesis,
  useAIDiagnosis,
  useAIPatternDetection,
  type ConsultationInput,
  type Differential,
  type Pattern,
} from '@/lib/vet-emr-hooks'
import { calculateAge } from '@/lib/vet-data'
import type { Pet, Vet } from '@/lib/vet-data'

interface ConsultationEditorProps {
  pet: Pet
  vet: Vet
  onBack: () => void
}

const ROUTES = ['Oral', 'IV', 'IM', 'SC', 'Tópica', 'Sublingual', 'Oftálmica', 'Ótica']

export function ConsultationEditor({ pet, vet, onBack }: ConsultationEditorProps) {
  const { data: existingConsultations = [] } = useConsultations(pet.id)
  const saveConsultation = useSaveConsultation()
  const autosave = useAutosaveConsultation()
  const diagnosisMutation = useAIDiagnosis()
  const soapMutation = useAISoapDraft()
  const { t } = useTranslation()

  const [consultationId, setConsultationId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [subjective, setSubjective] = useState('')
  const [objective, setObjective] = useState('')
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')
  const [transcript, setTranscript] = useState('')
  const [vitals, setVitals] = useState({
    weightKg: String(pet.weight ?? ''),
    temperatureC: '',
    heartRate: '',
    respiratoryRate: '',
    bodyConditionScore: '',
  })
  const [diagnoses, setDiagnoses] = useState<Array<{
    name: string
    confidence?: number
    isAiSuggested?: boolean
    accepted: boolean
    isPrimary: boolean
    notes?: string
  }>>([])
  const [treatments, setTreatments] = useState<Array<{
    drugName: string
    doseMg: number
    dosePerKg?: number
    frequency: string
    duration: string
    route: string
    notes?: string
    isAiSuggested?: boolean
    accepted: boolean
  }>>([])
  const [status, setStatus] = useState<'borrador' | 'finalizada'>('borrador')

  // Crear consulta al montar
  useEffect(() => {
    let cancelled = false
    async function createConsultation() {
      try {
        const res = await fetch('/api/vet/consultations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            petId: pet.id,
            vetId: vet.id,
            reason: '',
            status: 'borrador',
          } as ConsultationInput),
        })
        const data = await res.json()
        if (!cancelled) setConsultationId(data.id)
      } catch (e) {
        console.error('No se pudo crear borrador', e)
      }
    }
    createConsultation()
    return () => { cancelled = true }
  }, [pet.id, vet.id])

  // Autosave debounced
  useEffect(() => {
    if (!consultationId) return
    const timer = setTimeout(() => {
      autosave.mutate({
        id: consultationId,
        reason,
        subjective,
        objective,
        assessment,
        plan,
        audioTranscript: transcript || undefined,
        weightKg: vitals.weightKg ? Number(vitals.weightKg) : null,
        temperatureC: vitals.temperatureC ? Number(vitals.temperatureC) : null,
        heartRate: vitals.heartRate ? Number(vitals.heartRate) : null,
        respiratoryRate: vitals.respiratoryRate ? Number(vitals.respiratoryRate) : null,
        bodyConditionScore: vitals.bodyConditionScore ? Number(vitals.bodyConditionScore) : null,
        status,
      })
    }, 1500)
    return () => clearTimeout(timer)
  }, [consultationId, reason, subjective, objective, assessment, plan, transcript, vitals, status])

  const petContext = useMemo(() => ({
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: calculateAge(pet.birthDate),
    weight: vitals.weightKg ? Number(vitals.weightKg) : pet.weight,
    sex: pet.sex,
    sterilized: pet.sterilized,
    allergies: pet.allergies,
    chronicConditions: pet.chronicConditions,
    reason,
  }), [pet, vitals.weightKg, reason])

  async function diagnose() {
    if (!subjective && !objective && !assessment) {
      toast.error('Primero completa al menos el Subjetivo o el Objetivo')
      return
    }
    try {
      const result = await diagnosisMutation.mutateAsync({
        pet: petContext,
        subjective,
        objective,
        assessment,
      })
      const newDx: Differential[] = result.differentials || []
      setDiagnoses(prev => [
        ...prev,
        ...newDx.map(d => ({
          name: d.name,
          confidence: d.confidence,
          isAiSuggested: true,
          accepted: false,
          isPrimary: false,
          notes: `${d.rationale}${d.recommended_tests ? ` · Pruebas: ${d.recommended_tests}` : ''}`,
        })),
      ])
      toast.success(`${newDx.length} diagnósticos sugeridos por IA`)
    } catch (e: any) {
      toast.error('Error IA: ' + e.message)
    }
  }

  async function structureSoap() {
    const text = subjective || objective || assessment || plan || reason
    if (!text.trim()) {
      toast.error('Escribe algo en algún campo SOAP primero')
      return
    }
    try {
      const result = await soapMutation.mutateAsync({ text, pet: petContext })
      if (result.soap.subjective) setSubjective(result.soap.subjective)
      if (result.soap.objective) setObjective(result.soap.objective)
      if (result.soap.assessment) setAssessment(result.soap.assessment)
      if (result.soap.plan) setPlan(result.soap.plan)
      toast.success('SOAP estructurado por IA')
    } catch (e: any) {
      toast.error('Error IA: ' + e.message)
    }
  }

  async function handleSave(finalize: boolean) {
    if (!consultationId) {
      toast.error('La consulta aún se está inicializando...')
      return
    }
    try {
      const newStatus = finalize ? 'finalizada' : 'borrador'
      setStatus(newStatus)
      await saveConsultation.mutateAsync({
        id: consultationId,
        petId: pet.id,
        vetId: vet.id,
        reason,
        subjective,
        objective,
        assessment,
        plan,
        audioTranscript: transcript || undefined,
        aiGenerated: !!transcript,
        weightKg: vitals.weightKg ? Number(vitals.weightKg) : null,
        temperatureC: vitals.temperatureC ? Number(vitals.temperatureC) : null,
        heartRate: vitals.heartRate ? Number(vitals.heartRate) : null,
        respiratoryRate: vitals.respiratoryRate ? Number(vitals.respiratoryRate) : null,
        bodyConditionScore: vitals.bodyConditionScore ? Number(vitals.bodyConditionScore) : null,
        status: newStatus,
        diagnoses: diagnoses.filter(d => d.accepted).map(d => ({
          name: d.name,
          confidence: d.confidence,
          isPrimary: d.isPrimary,
          isAiSuggested: d.isAiSuggested,
          accepted: true,
        })),
        treatments: treatments.filter(t => t.accepted).map(t => ({
          drugName: t.drugName,
          doseMg: t.doseMg,
          dosePerKg: t.dosePerKg,
          frequency: t.frequency,
          duration: t.duration,
          route: t.route,
          notes: t.notes,
          isAiSuggested: t.isAiSuggested,
          accepted: true,
        })),
      })
      toast.success(finalize ? 'Consulta finalizada y guardada' : 'Borrador guardado')
      if (finalize) onBack()
    } catch (e: any) {
      toast.error('Error al guardar: ' + e.message)
    }
  }

  return (
    <div>
      <Topbar
        title={`Consulta · ${pet.name}`}
        subtitle={`${pet.breed} · ${calculateAge(pet.birthDate)} · ${vet.name}`}
        actionLabel="Finalizar consulta"
        onAction={() => handleSave(true)}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Back button + status */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
              <Sparkles className="h-3 w-3 mr-1" /> Copiloto IA activo
            </Badge>
            {status === 'borrador' && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                {autosave.isPending ? 'Guardando...' : 'Borrador autoguardado'}
              </Badge>
            )}
            {status === 'finalizada' && (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                <Check className="h-3 w-3 mr-1" /> Finalizada
              </Badge>
            )}
          </div>
        </div>

        {/* Allergies & chronic conditions banner */}
        {(pet.allergies.length > 0 || pet.chronicConditions.length > 0) && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <div className="flex-1 flex flex-wrap gap-2">
              {pet.allergies.length > 0 && (
                <span className="text-[12px] text-rose-700">
                  <strong>Alergias:</strong> {pet.allergies.join(', ')}
                </span>
              )}
              {pet.chronicConditions.length > 0 && (
                <span className="text-[12px] text-rose-700">
                  <strong>Condiciones crónicas:</strong> {pet.chronicConditions.join(', ')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pattern detection (if there's history) */}
        {existingConsultations.length >= 2 && (
          <PatternDetectionCard pet={petContext} consultations={existingConsultations} />
        )}

        {/* Reason + Vitals row */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Motivo de consulta y constantes</CardTitle>
            <CardDescription className="text-xs">Captura rápida para alimentar el copiloto IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-[12px] font-medium text-foreground mb-1.5 block">Motivo de consulta</label>
              <Input
                placeholder="Ej: vacunación anual, vómitos desde ayer, cojera en pata trasera..."
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <VitalInput icon={Weight} label="Peso (kg)" value={vitals.weightKg} onChange={v => setVitals(s => ({ ...s, weightKg: v }))} color="emerald" />
              <VitalInput icon={Thermometer} label="Temp (°C)" value={vitals.temperatureC} onChange={v => setVitals(s => ({ ...s, temperatureC: v }))} color="rose" />
              <VitalInput icon={Heart} label="FC (lpm)" value={vitals.heartRate} onChange={v => setVitals(s => ({ ...s, heartRate: v }))} color="sky" />
              <VitalInput icon={Wind} label="FR (rpm)" value={vitals.respiratoryRate} onChange={v => setVitals(s => ({ ...s, respiratoryRate: v }))} color="violet" />
              <VitalInput icon={Scale} label="BCS (1-9)" value={vitals.bodyConditionScore} onChange={v => setVitals(s => ({ ...s, bodyConditionScore: v }))} color="amber" />
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <AIActionButton icon={Mic} label="Dictar consulta" description="Graba y la IA estructura en SOAP" color="violet">
            <DictationPanel pet={petContext} onResult={(t, soap) => {
              setTranscript(t)
              if (soap.subjective) setSubjective(soap.subjective)
              if (soap.objective) setObjective(soap.objective)
              if (soap.assessment) setAssessment(soap.assessment)
              if (soap.plan) setPlan(soap.plan)
              toast.success('SOAP estructurado por IA')
            }} />
          </AIActionButton>

          <AIActionButton icon={ListChecks} label="Anamnesis IA" description="Preguntas adaptadas al paciente" color="emerald">
            <AnamnesisPanel pet={petContext} reason={reason} />
          </AIActionButton>

          <AIActionButton
            icon={Brain}
            label="Sugerir diagnósticos"
            description="Top-3 con score de confianza"
            color="sky"
            onClick={diagnose}
            loading={diagnosisMutation.isPending}
          />

          <AIActionButton icon={Pill} label="Calcular dosis" description="Por peso del paciente" color="amber">
            <DoseCalculatorPanel
              weightKg={vitals.weightKg ? Number(vitals.weightKg) : pet.weight}
              onAdd={(t) => {
                setTreatments(prev => [...prev, { ...t, accepted: true }])
                toast.success('Tratamiento añadido')
              }}
            />
          </AIActionButton>

          <AIActionButton
            icon={Wand2}
            label="Estructurar SOAP"
            description="Convierte texto libre a SOAP"
            color="rose"
            onClick={structureSoap}
            loading={soapMutation.isPending}
          />
        </div>

        {/* SOAP grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SoapCard letter="S" title="Subjetivo" description="Lo que relata el dueño" value={subjective} onChange={setSubjective} color="sky" />
          <SoapCard letter="O" title="Objetivo" description="Hallazgos clínicos" value={objective} onChange={setObjective} color="emerald" />
          <SoapCard letter="A" title="Assessment" description="Diagnóstico presuntivo" value={assessment} onChange={setAssessment} color="violet" />
          <SoapCard letter="P" title="Plan" description="Tratamiento y seguimiento" value={plan} onChange={setPlan} color="amber" />
        </div>

        {/* Transcript (audit) */}
        {transcript && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-600" /> Transcripción original del dictado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[12px] text-muted-foreground italic whitespace-pre-wrap bg-muted/30 rounded-md p-3">
                {transcript}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Differential diagnoses */}
        {diagnoses.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-sky-600" /> Diagnósticos diferenciales
              </CardTitle>
              <CardDescription className="text-xs">Acepta o rechaza las sugerencias IA. Puedes marcar uno como principal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {diagnoses.map((dx, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3',
                    dx.accepted ? 'border-emerald-200 bg-emerald-50' : 'border-border bg-muted/30',
                    dx.isAiSuggested && !dx.accepted && 'border-dashed'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">{dx.name}</p>
                      {dx.isAiSuggested && (
                        <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 text-[10px]">
                          <Sparkles className="h-2.5 w-2.5 mr-1" /> IA
                        </Badge>
                      )}
                      {dx.confidence !== undefined && (
                        <Badge variant="outline" className={cn(
                          'text-[10px]',
                          dx.confidence >= 0.7 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          dx.confidence >= 0.4 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        )}>
                          {Math.round(dx.confidence * 100)}% confianza
                        </Badge>
                      )}
                      {dx.isPrimary && (
                        <Badge className="bg-violet-600 text-white hover:bg-violet-600 text-[10px]">Principal</Badge>
                      )}
                    </div>
                    {dx.notes && <p className="text-[12px] text-muted-foreground mt-1">{dx.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className={cn('h-7 w-7 p-0', dx.accepted && 'text-emerald-600')} onClick={() => setDiagnoses(prev => prev.map((d, idx) => idx === i ? { ...d, accepted: !d.accepted } : d))}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-rose-600" onClick={() => setDiagnoses(prev => prev.filter((_, idx) => idx !== i))}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className={cn('h-7 px-2', dx.isPrimary && 'text-violet-600')} onClick={() => setDiagnoses(prev => prev.map((d, idx) => ({ ...d, isPrimary: idx === i })))}>
                      Principal
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Treatments */}
        {treatments.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Pill className="h-4 w-4 text-amber-600" /> Tratamientos prescritos
              </CardTitle>
              <CardDescription className="text-xs">{treatments.length} ítem(s) · dosis calculada por peso del paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {treatments.map((t, i) => (
                <div key={i} className={cn('flex items-center gap-3 rounded-lg border p-3', t.accepted ? 'border-amber-200 bg-amber-50' : 'border-dashed border-border bg-muted/30')}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <Pill className="h-4 w-4 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">{t.drugName}</p>
                      {t.isAiSuggested && (
                        <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 text-[10px]">
                          <Sparkles className="h-2.5 w-2.5 mr-1" /> IA
                        </Badge>
                      )}
                    </div>
                    <p className="text-[12px] text-muted-foreground">
                      {t.doseMg}mg
                      {t.dosePerKg && ` (${t.dosePerKg}mg/kg)`} · {t.frequency} · {t.duration} · vía {t.route}
                      {t.notes && ` · ${t.notes}`}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-rose-600" onClick={() => setTreatments(prev => prev.filter((_, idx) => idx !== i))}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Save bar */}
        <div className="flex items-center gap-2 sticky bottom-4 bg-white/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-md">
          <Badge variant="secondary" className="text-[11px]">
            {consultationId ? `ID: ${consultationId.slice(0, 8)}...` : 'Sin guardar'}
          </Badge>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={saveConsultation.isPending}>
              <Save className="h-4 w-4" /> Guardar borrador
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleSave(true)} disabled={saveConsultation.isPending}>
              <Check className="h-4 w-4" /> Finalizar consulta
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ Sub-components ============

function VitalInput({
  icon: Icon,
  label,
  value,
  onChange,
  color,
}: {
  icon: any
  label: string
  value: string
  onChange: (v: string) => void
  color: string
}) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    sky: 'bg-sky-50 text-sky-700',
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground mb-1 block">{label}</label>
      <div className="relative">
        <div className={cn('absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded flex items-center justify-center', colorMap[color])}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <Input type="number" step="0.1" value={value} onChange={e => onChange(e.target.value)} className="pl-9 h-9" placeholder="—" />
      </div>
    </div>
  )
}

function SoapCard({
  letter,
  title,
  description,
  value,
  onChange,
  color,
}: {
  letter: string
  title: string
  description: string
  value: string
  onChange: (v: string) => void
  color: string
}) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    sky: { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    violet: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  }
  const c = colorMap[color]
  return (
    <Card className={cn('border-2', c.border)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg font-bold text-base', c.bg, c.text)}>
            {letter}
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-[11px]">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={`Escribe o dicta el apartado ${title.toLowerCase()}...`}
          className="min-h-[120px] text-[13px]"
        />
      </CardContent>
    </Card>
  )
}

function AIActionButton({
  icon: Icon,
  label,
  description,
  color,
  onClick,
  loading,
  children,
}: {
  icon: any
  label: string
  description: string
  color: string
  onClick?: () => void
  loading?: boolean
  children?: React.ReactNode
}) {
  const colorMap: Record<string, string> = {
    violet: 'border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700',
    emerald: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700',
    sky: 'border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700',
    amber: 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700',
    rose: 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700',
  }
  // If children provided, render as container with embedded controls
  if (children) {
    return (
      <div className={cn('rounded-lg border p-3 transition-colors', colorMap[color])}>
        <div className="flex items-start gap-2">
          <Icon className={cn('h-5 w-5 shrink-0', loading && 'animate-pulse')} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium">{label}</p>
            <p className="text-[11px] opacity-80">{description}</p>
          </div>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    )
  }
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn('rounded-lg border p-3 transition-colors text-left disabled:opacity-50', colorMap[color])}
    >
      <div className="flex items-start gap-2">
        {loading ? <Loader2 className="h-5 w-5 shrink-0 animate-spin" /> : <Icon className="h-5 w-5 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium">{label}</p>
          <p className="text-[11px] opacity-80">{description}</p>
        </div>
      </div>
    </button>
  )
}

function PatternDetectionCard({ pet, consultations }: { pet: any; consultations: any[] }) {
  const patternMutation = useAIPatternDetection()
  const [patterns, setPatterns] = useState<Pattern[]>([])

  // Ejecutar detección solo cuando hay historial suficiente
  useEffect(() => {
    if (consultations.length < 2) return
    let cancelled = false
    patternMutation
      .mutateAsync({ pet, consultations })
      .then(r => {
        if (!cancelled) setPatterns(r.patterns || [])
      })
      .catch(e => console.error('Pattern error:', e))
    return () => { cancelled = true }
  }, [consultations.length])

  if (patterns.length === 0 && !patternMutation.isPending) return null

  const severityStyles: Record<string, string> = {
    info: 'border-sky-200 bg-sky-50 text-sky-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    critical: 'border-rose-200 bg-rose-50 text-rose-700',
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-rose-600" /> Detección de patrones IA
          {patternMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
        </CardTitle>
        <CardDescription className="text-xs">Análisis automático de {consultations.length} consultas previas del paciente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {patterns.map((p, i) => (
          <div key={i} className={cn('rounded-lg border p-3 flex items-start gap-3', severityStyles[p.severity] || severityStyles.info)}>
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[12px] font-medium">{p.description}</p>
              <p className="text-[11px] opacity-80 mt-0.5">→ {p.recommendation}</p>
            </div>
            <Badge variant="outline" className="text-[10px] capitalize">{p.severity}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ============ AI Inline panels ============

function DictationPanel({
  pet,
  onResult,
}: {
  pet: any
  onResult: (transcript: string, soap: { subjective: string; objective: string; assessment: string; plan: string }) => void
}) {
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const dictation = useAIDictation()

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1]
          try {
            const result = await dictation.mutateAsync({ audio_base64: base64, pet })
            onResult(result.transcript, result.soap)
          } catch (e: any) {
            setError(e.message)
          }
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start()
      mediaRecorderRef.current = mr
      setRecording(true)
      setError(null)
    } catch (e: any) {
      setError('No se pudo acceder al micrófono: ' + e.message)
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        {!recording ? (
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 w-full" onClick={startRecording}>
            <Mic className="h-4 w-4" /> Iniciar dictado
          </Button>
        ) : (
          <Button size="sm" variant="destructive" className="w-full" onClick={stopRecording}>
            <Square className="h-4 w-4" /> Detener y transcribir
          </Button>
        )}
      </div>
      {dictation.isPending && (
        <p className="text-[11px] text-violet-700 mt-2 flex items-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" /> Transcribiendo y estructurando con IA...
        </p>
      )}
      {error && <p className="text-[11px] text-rose-600 mt-2">{error}</p>}
      {recording && (
        <p className="text-[11px] text-rose-600 mt-2 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> Grabando...
        </p>
      )}
    </div>
  )
}

function AnamnesisPanel({ pet, reason }: { pet: any; reason: string }) {
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const anamnesis = useAIAnamnesis()

  async function generate() {
    try {
      const r = await anamnesis.mutateAsync({ pet, reason })
      setQuestions(r.questions || [])
    } catch (e: any) {
      toast.error('Error: ' + e.message)
    }
  }

  return (
    <div>
      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 w-full" onClick={generate} disabled={anamnesis.isPending}>
        {anamnesis.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListChecks className="h-4 w-4" />}
        {questions.length > 0 ? 'Regenerar preguntas' : 'Generar anamnesis'}
      </Button>
      {questions.length > 0 && (
        <div className="mt-2 space-y-2 max-h-72 overflow-y-auto pr-1">
          {questions.map((q, i) => (
            <div key={i} className="rounded-md border border-border bg-white p-2">
              <p className="text-[12px] font-medium text-foreground mb-1">Q{i + 1}. {q}</p>
              <Input
                placeholder="Respuesta..."
                value={answers[i] || ''}
                onChange={e => setAnswers(s => ({ ...s, [i]: e.target.value }))}
                className="h-8 text-[12px]"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DoseCalculatorPanel({
  weightKg,
  onAdd,
}: {
  weightKg: number
  onAdd: (t: {
    drugName: string
    doseMg: number
    dosePerKg?: number
    frequency: string
    duration: string
    route: string
    notes?: string
  }) => void
}) {
  const [drugName, setDrugName] = useState('')
  const [dosePerKg, setDosePerKg] = useState('')
  const [frequency, setFrequency] = useState('c/12h')
  const [duration, setDuration] = useState('7 días')
  const [route, setRoute] = useState('Oral')

  const totalDose = dosePerKg && weightKg ? Number(dosePerKg) * weightKg : 0

  return (
    <div className="space-y-2">
      <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-[11px] text-amber-700">
        Peso del paciente: <strong>{weightKg} kg</strong>
      </div>
      <Input placeholder="Nombre del fármaco" value={drugName} onChange={e => setDrugName(e.target.value)} className="h-8 text-[12px]" />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-muted-foreground">Dosis (mg/kg)</label>
          <Input type="number" step="0.1" placeholder="5" value={dosePerKg} onChange={e => setDosePerKg(e.target.value)} className="h-8 text-[12px]" />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground">Vía</label>
          <select value={route} onChange={e => setRoute(e.target.value)} className="h-8 w-full rounded-md border border-input bg-background px-2 text-[12px]">
            {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Frecuencia" value={frequency} onChange={e => setFrequency(e.target.value)} className="h-8 text-[12px]" />
        <Input placeholder="Duración" value={duration} onChange={e => setDuration(e.target.value)} className="h-8 text-[12px]" />
      </div>
      {totalDose > 0 && (
        <p className="text-[11px] text-amber-700 bg-amber-50 rounded p-1.5">
          Dosis total calculada: <strong>{totalDose.toFixed(2)} mg</strong> por administración
        </p>
      )}
      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 w-full" disabled={!drugName || !dosePerKg} onClick={() => {
        onAdd({
          drugName,
          doseMg: Number(totalDose.toFixed(2)),
          dosePerKg: Number(dosePerKg),
          frequency,
          duration,
          route,
        })
        setDrugName('')
        setDosePerKg('')
      }}>
        <Plus className="h-4 w-4" /> Añadir tratamiento
      </Button>
    </div>
  )
}
