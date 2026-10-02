'use client'

import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Radio,
  Loader2,
  Clock,
  Activity,
  Pill,
  AlertTriangle,
  MessageSquare,
  Heart,
  FileText,
  ArrowLeftRight,
  Plus,
  Send,
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
import { useHospitalization, useAddShiftLog, useDischargeHospitalization, type ShiftLogType, type ShiftLog } from '@/lib/vet-hospitalization-hooks'
import { useVets } from '@/lib/vet-hooks'
import { HandoverDialog } from '@/components/vet/hospitalization/handover-dialog'
import { calculateAge } from '@/lib/vet-data'

interface HospitalizationDetailProps {
  id: string
  onBack: () => void
}

const TYPE_META: Record<ShiftLogType, { label: string; icon: any; color: string; bg: string }> = {
  medication: { label: 'Medicamento', icon: Pill, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  incident: { label: 'Incidencia', icon: AlertTriangle, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  behavior: { label: 'Comportamiento', icon: Activity, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  vital: { label: 'Constantes', icon: Heart, color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
  note: { label: 'Nota', icon: FileText, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
  handover: { label: 'Relevo', icon: ArrowLeftRight, color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
}

const SEVERITY_STYLES: Record<string, string> = {
  info: 'bg-sky-100 text-sky-700 border-sky-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  critical: 'bg-rose-100 text-rose-700 border-rose-200',
}

const ROUTES = ['Oral', 'IV', 'IM', 'SC', 'Tópica']

export function HospitalizationDetail({ id, onBack }: HospitalizationDetailProps) {
  const { data: h, isLoading, isFetching, dataUpdatedAt } = useHospitalization(id)
  const { data: vets = [] } = useVets()
  const addLog = useAddShiftLog()
  const discharge = useDischargeHospitalization()
  const { t } = useTranslation()
  const [showHandover, setShowHandover] = useState(false)

  // Default reporter = first active vet (mock current user)
  const currentVet = useMemo(() => vets.find(v => v.active && v.role === 'Veterinario') || vets[0], [vets])

  // Form state
  const [entryType, setEntryType] = useState<ShiftLogType>('behavior')
  const [content, setContent] = useState('')
  const [drugName, setDrugName] = useState('')
  const [doseMg, setDoseMg] = useState('')
  const [dosePerKg, setDosePerKg] = useState('')
  const [route, setRoute] = useState('Oral')
  const [temperatureC, setTemperatureC] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [respiratoryRate, setRespiratoryRate] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [appetite, setAppetite] = useState('')
  const [hydration, setHydration] = useState('')
  const [urination, setUrination] = useState('')
  const [feces, setFeces] = useState('')
  const [severity, setSeverity] = useState<'info' | 'warning' | 'critical'>('info')

  // Logs sorted: most recent first
  const logs = useMemo(() => {
    if (!h?.shiftLogs) return []
    return [...h.shiftLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [h])

  if (isLoading || !h) {
    return (
      <div>
        <Topbar title="Cargando..." />
        <div className="p-6 space-y-3">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  const pet = h.pet
  const lastVital = logs.find(l => l.type === 'vital')
  const lastLog = logs[0]

  async function handleSubmitEntry() {
    if (!content.trim()) {
      toast.error('Escribe el contenido de la entrada')
      return
    }
    try {
      await addLog.mutateAsync({
        hospitalizationId: id,
        reporterVetId: currentVet?.id || '',
        type: entryType,
        content,
        drugName: drugName || undefined,
        doseMg: doseMg ? Number(doseMg) : undefined,
        dosePerKg: dosePerKg ? Number(dosePerKg) : undefined,
        route: entryType === 'medication' ? route : undefined,
        temperatureC: temperatureC || undefined,
        heartRate: heartRate || undefined,
        respiratoryRate: respiratoryRate || undefined,
        weightKg: weightKg || undefined,
        appetite: appetite || undefined,
        hydration: hydration || undefined,
        urination: urination || undefined,
        feces: feces || undefined,
        severity: entryType === 'incident' ? severity : undefined,
      })
      toast.success('Entrada añadida · visible en tiempo real para todos')
      // Reset
      setContent('')
      setDrugName('')
      setDoseMg('')
      setDosePerKg('')
      setTemperatureC('')
      setHeartRate('')
      setRespiratoryRate('')
      setWeightKg('')
      setAppetite('')
      setHydration('')
      setUrination('')
      setFeces('')
      setSeverity('info')
    } catch (e: any) {
      toast.error('Error: ' + e.message)
    }
  }

  async function handleDischarge() {
    if (!confirm('¿Confirmas el alta? La bitácora quedará archivada y la mascota deja de estar internada.')) return
    try {
      await discharge.mutateAsync(id)
      toast.success('Paciente dado de alta')
      onBack()
    } catch (e: any) {
      toast.error('Error: ' + e.message)
    }
  }

  const isMedication = entryType === 'medication'
  const isVital = entryType === 'vital'
  const isIncident = entryType === 'incident'

  return (
    <div>
      <Topbar title={`Internación · ${pet?.name || ''}`} subtitle={`${h.cage} · ${pet?.breed}`} />

      <div className="p-6 space-y-4 max-w-7xl mx-auto">
        {/* Back + status */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <Radio className={cn('h-3 w-3 mr-1', isFetching && 'animate-pulse')} />
              {isFetching ? 'Sincronizando...' : 'En vivo'}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setShowHandover(true)}>
              <ArrowLeftRight className="h-4 w-4" /> Relevo de turno
            </Button>
            <Button variant="outline" size="sm" className="text-rose-600 hover:text-rose-700" onClick={handleDischarge} disabled={discharge.isPending}>
              Dar de alta
            </Button>
          </div>
        </div>

        {/* Pet header card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              {pet && (
                <img src={pet.photoUrl} alt={pet.name} className="h-20 w-20 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Paciente</p>
                  <p className="text-sm font-semibold text-foreground">{pet?.name}</p>
                  <p className="text-[11px] text-muted-foreground">{pet?.breed} · {pet ? calculateAge(pet.birthDate) : ''}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Box</p>
                  <p className="text-sm font-semibold text-foreground">{h.cage}</p>
                  <p className="text-[11px] text-muted-foreground">Desde {new Date(h.admissionDate).toLocaleDateString('es-ES')}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Vet responsable</p>
                  <p className="text-sm font-semibold text-foreground">{h.attendingVet?.name}</p>
                  <p className="text-[11px] text-muted-foreground">{h.attendingVet?.specialty}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Motivo</p>
                  <p className="text-[12px] text-foreground line-clamp-2">{h.reason}</p>
                </div>
              </div>
            </div>

            {/* Quick info: feeding, fluid therapy, notes */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 border-t border-border pt-3">
              {h.feedingPlan && (
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Alimentación</p>
                  <p className="text-[12px] text-foreground">{h.feedingPlan}</p>
                </div>
              )}
              {h.fluidTherapy && (
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Fluidoterapia</p>
                  <p className="text-[12px] text-foreground">{h.fluidTherapy}</p>
                </div>
              )}
              {h.notes && (
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Indicaciones</p>
                  <p className="text-[12px] text-foreground">{h.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Two columns: form + log */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* LEFT: Quick entry form */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-600" /> Nueva entrada de bitácora
              </CardTitle>
              <CardDescription className="text-[11px]">
                Registrando como <strong>{currentVet?.name}</strong> · visible al instante para todos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Type selector */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Tipo de entrada</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['medication', 'incident', 'behavior', 'vital', 'note', 'handover'] as ShiftLogType[]).map(t => {
                    const meta = TYPE_META[t]
                    const Icon = meta.icon
                    const isActive = entryType === t
                    return (
                      <button
                        key={t}
                        onClick={() => setEntryType(t)}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-md border p-2 text-[10px] font-medium transition-all',
                          isActive
                            ? `${meta.bg} ${meta.color} border-current`
                            : 'border-border text-muted-foreground hover:bg-muted'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {meta.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Common content */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  {entryType === 'medication' ? 'Detalle del medicamento administrado' :
                   entryType === 'incident' ? 'Descripción de la incidencia' :
                   entryType === 'behavior' ? 'Observación del comportamiento' :
                   entryType === 'vital' ? 'Notas de las constantes' :
                   entryType === 'handover' ? 'Notas de relevo (handover)' :
                   'Nota'}
                </label>
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="text-[12px] min-h-[80px]"
                  placeholder={entryType === 'medication' ? 'Ej: Dexametasona 0.1mg/kg IV por edema de vía aérea' :
                    entryType === 'incident' ? 'Ej: Cianosis leve a las 03:30. Se subió oxígeno a 50% 15 min y se recuperó.' :
                    entryType === 'behavior' ? 'Ej: Paciente tranquilo, decúbito esternal, reacciona al contacto' :
                    entryType === 'handover' ? 'Ej: Le entrego el turno a X. Resumen de evolución, próximos pasos, signos de alarma' :
                    'Ej: Visitó el dueño a las 18:00. Paciente se mostró más activo.'}
                />
              </div>

              {/* Medication-specific */}
              {isMedication && (
                <div className="space-y-2 rounded-md bg-amber-50/50 border border-amber-200 p-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Fármaco" value={drugName} onChange={e => setDrugName(e.target.value)} className="h-8 text-[12px]" />
                    <select value={route} onChange={e => setRoute(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-[12px]">
                      {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Dosis (mg)" type="number" step="0.1" value={doseMg} onChange={e => setDoseMg(e.target.value)} className="h-8 text-[12px]" />
                    <Input placeholder="mg/kg" type="number" step="0.1" value={dosePerKg} onChange={e => setDosePerKg(e.target.value)} className="h-8 text-[12px]" />
                  </div>
                </div>
              )}

              {/* Vital-specific */}
              {isVital && (
                <div className="space-y-2 rounded-md bg-sky-50/50 border border-sky-200 p-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground">Temp (°C)</label>
                      <Input type="number" step="0.1" value={temperatureC} onChange={e => setTemperatureC(e.target.value)} className="h-8 text-[12px]" placeholder="38.5" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">FC (lpm)</label>
                      <Input type="number" value={heartRate} onChange={e => setHeartRate(e.target.value)} className="h-8 text-[12px]" placeholder="120" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">FR (rpm)</label>
                      <Input type="number" value={respiratoryRate} onChange={e => setRespiratoryRate(e.target.value)} className="h-8 text-[12px]" placeholder="24" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">Peso (kg)</label>
                      <Input type="number" step="0.1" value={weightKg} onChange={e => setWeightKg(e.target.value)} className="h-8 text-[12px]" placeholder="11.0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                    <select value={appetite} onChange={e => setAppetite(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-[11px]">
                      <option value="">Apetito</option>
                      <option value="voluntario">Voluntario</option>
                      <option value="poco">Poco</option>
                      <option value="no come">No come</option>
                    </select>
                    <select value={hydration} onChange={e => setHydration(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-[11px]">
                      <option value="">Hidratación</option>
                      <option value="normohidratado">Normohidratado</option>
                      <option value="deshidratado">Deshidratado</option>
                      <option value="sobrehidratado">Sobrehidratado</option>
                    </select>
                    <select value={urination} onChange={e => setUrination(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-[11px]">
                      <option value="">Micción</option>
                      <option value="normal">Normal</option>
                      <option value="oliguria">Oliguria</option>
                      <option value="anuria">Anuria</option>
                      <option value="poliuria">Poliuria</option>
                    </select>
                    <select value={feces} onChange={e => setFeces(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-[11px]">
                      <option value="">Heces</option>
                      <option value="normal">Normal</option>
                      <option value="diarrea">Diarrea</option>
                      <option value="estreñimiento">Estreñimiento</option>
                      <option value="ausente">Ausente</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Incident severity */}
              {isIncident && (
                <div className="rounded-md bg-rose-50/50 border border-rose-200 p-2">
                  <label className="text-[10px] text-muted-foreground mb-1 block">Severidad</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['info', 'warning', 'critical'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setSeverity(s)}
                        className={cn(
                          'rounded-md border px-2 py-1 text-[10px] font-medium capitalize transition-colors',
                          severity === s
                            ? SEVERITY_STYLES[s]
                            : 'border-border text-muted-foreground hover:bg-muted'
                        )}
                      >
                        {s === 'info' ? 'Info' : s === 'warning' ? 'Advertencia' : 'Crítica'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSubmitEntry}
                disabled={addLog.isPending || !content.trim()}
              >
                {addLog.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                ) : (
                  <><Send className="h-4 w-4" /> Registrar entrada</>
                )}
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">
                Visible en tiempo real para todos los vets conectados
              </p>
            </CardContent>
          </Card>

          {/* RIGHT: Activity log */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" /> Bitácora en tiempo real
                </CardTitle>
                <CardDescription className="text-[11px]">
                  {logs.length} entradas registradas · {logs.filter(l => l.type === 'incident').length} incidencias
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                EN VIVO
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto pr-1 space-y-2">
                {logs.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    No hay entradas registradas todavía
                  </div>
                )}
                {logs.map(log => (
                  <LogEntry key={log.id} log={log} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Handover dialog */}
      {showHandover && (
        <HandoverDialog
          hospitalizationId={id}
          reporterVet={currentVet}
          vets={vets.filter(v => v.active)}
          lastLogContent={lastLog?.content}
          onClose={() => setShowHandover(false)}
        />
      )}
    </div>
  )
}

function LogEntry({ log }: { log: ShiftLog }) {
  const meta = TYPE_META[log.type]
  const Icon = meta.icon

  return (
    <div className={cn('rounded-lg border p-3 flex items-start gap-3', meta.bg)}>
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white', meta.color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Badge variant="outline" className={cn('text-[10px]', meta.bg, meta.color, 'border-current')}>
            {meta.label}
          </Badge>
          {log.severity && (
            <Badge variant="outline" className={cn('text-[10px] capitalize', SEVERITY_STYLES[log.severity])}>
              {log.severity === 'info' ? 'Info' : log.severity === 'warning' ? 'Advertencia' : 'Crítica'}
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground">
            {new Date(log.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <p className="text-[12px] text-foreground leading-relaxed">{log.content}</p>

        {/* Medication extras */}
        {log.type === 'medication' && log.drugName && (
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-[11px] text-amber-800">
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
              <Pill className="h-2.5 w-2.5 mr-1" /> {log.drugName}
            </Badge>
            <span>{log.doseMg}mg{log.dosePerKg ? ` (${log.dosePerKg}mg/kg)` : ''}</span>
            {log.route && <span>· vía {log.route}</span>}
          </div>
        )}

        {/* Vital extras */}
        {log.type === 'vital' && (
          <div className="mt-1.5 grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[10px]">
            {log.temperatureC !== null && <VitalPill label="Temp" value={`${log.temperatureC}°C`} />}
            {log.heartRate !== null && <VitalPill label="FC" value={`${log.heartRate} lpm`} />}
            {log.respiratoryRate !== null && <VitalPill label="FR" value={`${log.respiratoryRate} rpm`} />}
            {log.weightKg !== null && <VitalPill label="Peso" value={`${log.weightKg} kg`} />}
            {log.appetite && <VitalPill label="Apetito" value={log.appetite} />}
            {log.hydration && <VitalPill label="Hidrat." value={log.hydration} />}
            {log.urination && <VitalPill label="Micción" value={log.urination} />}
            {log.feces && <VitalPill label="Heces" value={log.feces} />}
          </div>
        )}

        {/* Reporter */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold', log.reporterVet?.avatarColor)}>
            {log.reporterVet?.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <span className="text-[11px] font-medium text-foreground">{log.reporterVet?.name}</span>
          <span className="text-[10px] text-muted-foreground">· {log.reporterVet?.role}</span>

          {/* Handover incoming */}
          {log.type === 'handover' && log.incomingVet && (
            <div className="flex items-center gap-1.5 ml-2">
              <ArrowLeftRight className="h-3 w-3 text-violet-600" />
              <span className="text-[10px] text-muted-foreground">recibido por</span>
              <div className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold', log.incomingVet?.avatarColor)}>
                {log.incomingVet?.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <span className="text-[11px] font-medium text-foreground">{log.incomingVet?.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function VitalPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-sky-100 px-1.5 py-0.5 text-sky-800">
      <span className="opacity-70">{label}:</span> <strong>{value}</strong>
    </div>
  )
}
