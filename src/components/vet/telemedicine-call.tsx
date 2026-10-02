'use client'

// Modal de videollamada de telemedicina: video grid + controles + chat en tiempo real
// Al finalizar, genera resumen automático con IA para el cliente y el veterinario
import { useState, useEffect, useRef } from 'react'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageCircle,
  Send,
  Stethoscope,
  X,
  Settings,
  Pill,
  Loader2,
  Sparkles,
  FileText,
  Calendar,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { usePets, useVets, useAppointments } from '@/lib/vet-hooks'
import { useAITelemedicineSummary, type TelemedicineSummary } from '@/lib/vet-emr-hooks'

interface TelemedicineCallProps {
  petId: string
  clientId: string
  onClose: () => void
}

interface ChatMessage {
  id: string
  from: 'vet' | 'client' | 'system'
  text: string
  time: string
}

export function TelemedicineCall({ petId, clientId, onClose }: TelemedicineCallProps) {
  const { data: pets = [] } = usePets()
  const { data: vets = [] } = useVets()
  const { data: appointments = [] } = useAppointments()

  const pet = pets.find(p => p.id === petId)
  const vet = vets.find(v => v.role === t('role.veterinario') && v.active) || vets[0]

  const [seconds, setSeconds] = useState(0)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [showChat, setShowChat] = useState(true)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'm1',
      from: 'system',
      text: 'Conectando con el veterinario...',
      time: '',
    },
  ])
  // Estado del resumen IA al finalizar la llamada
  const [summary, setSummary] = useState<TelemedicineSummary | null>(null)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const summaryMutation = useAITelemedicineSummary()

  const chatEndRef = useRef<HTMLDivElement>(null)
  const callStartedAt = useRef<Date | null>(null)

  // Timer
  useEffect(() => {
    callStartedAt.current = new Date()

    const timers: ReturnType<typeof setTimeout>[] = []

    // "Connected" message after 800ms (so user sees "connecting..." first)
    timers.push(
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: 'm2',
            from: 'system',
            text: `Conectado con ${vet?.name || 'veterinario'}`,
            time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      }, 800)
    )

    // Tick the call timer every second
    timers.push(
      setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000) as unknown as ReturnType<typeof setTimeout>
    )

    // Simulated vet joins after 3s
    timers.push(
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: 'm3',
            from: 'vet',
            text: `¡Hola! Veo a ${pet?.name}. Cuéntame qué le sucede hoy.`,
            time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      }, 3000)
    )

    // Simulated vet follow-up after 18s
    timers.push(
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: 'm4',
            from: 'vet',
            text: 'Le voy a pedir que mueva la cámara para ver mejor el área afectada. Si necesita recetas, se las envío al final de la consulta.',
            time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      }, 18000)
    )

    return () => {
      timers.forEach(t => clearTimeout(t))
    }
  }, [vet, pet])

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const sendMessage = () => {
    if (!chatInput.trim()) return
    const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [
      ...prev,
      { id: `m${Date.now()}`, from: 'client', text: chatInput, time },
    ])
    setChatInput('')

    // Vet auto-reply after 2s
    setTimeout(() => {
      const replies = [
        'Entendido. ¿Podría enviarme una foto del área?',
        'Voy a revisarlo. ¿Desde cuándo está así?',
        'Por lo que veo, no parece grave, pero conviene revisarlo en clínica.',
        'Le receto un antiinflamatorio. Se lo envío por email.',
      ]
      const reply = replies[Math.floor(Math.random() * replies.length)]
      setMessages(prev => [
        ...prev,
        { id: `m${Date.now()}-r`, from: 'vet', text: reply, time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) },
      ])
    }, 2500)
  }

  const endCall = async () => {
    setMessages(prev => [
      ...prev,
      { id: `end-${Date.now()}`, from: 'system', text: 'Llamada finalizada', time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) },
    ])
    // Generar resumen IA con los mensajes del chat
    setGeneratingSummary(true)
    try {
      const petContext = {
        name: pet?.name,
        species: pet?.species,
        breed: pet?.breed,
        age: pet?.birthDate,
        weight: pet?.weight,
      }
      const vetContext = vet ? { name: vet.name, specialty: vet.specialty } : null
      const result = await summaryMutation.mutateAsync({
        pet: petContext,
        vet: vetContext,
        chatMessages: messages,
        durationSec: seconds,
      })
      setSummary(result)
      toast.success('Resumen IA generado')
    } catch (e: any) {
      toast.error('No se pudo generar el resumen IA: ' + e.message)
      setTimeout(onClose, 800)
    } finally {
      setGeneratingSummary(false)
    }
  }

  const closeSummary = () => {
    setSummary(null)
    onClose()
  }

  if (!pet) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-6xl h-[90vh] bg-background rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border bg-card">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              Telemedicina · {pet.name}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Con {vet?.name} · {vet?.specialty}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
              EN VIVO
            </Badge>
            <Badge variant="secondary" className="font-mono">
              {formatDuration(seconds)}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body: video grid + chat */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video area */}
          <div className="flex-1 relative bg-gradient-to-br from-slate-900 to-slate-800">
            {/* Main vet video (simulated) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-3xl font-bold shadow-xl">
                  {vet?.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <p className="text-lg font-semibold">{vet?.name}</p>
                <p className="text-sm text-white/70">{vet?.specialty}</p>
                <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Cámara activa · Audio HD
                </div>
              </div>
            </div>

            {/* Pet picture-in-picture */}
            <div className="absolute bottom-4 right-4 w-48 aspect-[4/3] rounded-lg overflow-hidden border-2 border-white/30 bg-slate-950 shadow-xl">
              {camOn ? (
                <img src={pet.photoUrl} alt={pet.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800 text-white/50">
                  <VideoOff className="h-8 w-8" />
                </div>
              )}
              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white font-medium">
                {pet.name} (Tú)
              </div>
            </div>

            {/* Call info top-left */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm">
              <p className="text-[11px] text-white/80">Consulta virtual</p>
              <p className="text-sm font-medium text-white">{pet.name} · {pet.breed}</p>
            </div>

            {/* Call controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-sm px-3 py-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-10 w-10 rounded-full',
                  micOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-rose-600 text-white hover:bg-rose-700'
                )}
                onClick={() => setMicOn(m => !m)}
              >
                {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-10 w-10 rounded-full',
                  camOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-rose-600 text-white hover:bg-rose-700'
                )}
                onClick={() => setCamOn(c => !c)}
              >
                {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-10 w-10 rounded-full',
                  showChat ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white/10 text-white hover:bg-white/20'
                )}
                onClick={() => setShowChat(s => !s)}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <div className="w-px h-6 bg-white/20 mx-1" />
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-rose-600 text-white hover:bg-rose-700"
                onClick={endCall}
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Chat panel */}
          {showChat && (
            <div className="w-80 border-l border-border bg-card flex flex-col">
              <div className="px-3 h-12 flex items-center gap-2 border-b border-border">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-foreground">Chat de la consulta</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-7 w-7 lg:hidden"
                  onClick={() => setShowChat(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map(m => {
                  if (m.from === 'system') {
                    return (
                      <div key={m.id} className="flex justify-center">
                        <span className="px-2 py-1 rounded-full bg-muted text-[10px] text-muted-foreground">
                          {m.text} {m.time && `· ${m.time}`}
                        </span>
                      </div>
                    )
                  }
                  const isVet = m.from === 'vet'
                  return (
                    <div key={m.id} className={cn('flex gap-2', !isVet && 'flex-row-reverse')}>
                      <div className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
                        isVet ? 'bg-emerald-600 text-white' : vet?.avatarColor || 'bg-violet-100 text-violet-700'
                      )}>
                        {isVet ? vet?.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'TÚ'}
                      </div>
                      <div className={cn('max-w-[75%]', !isVet && 'text-right')}>
                        <div className={cn(
                          'inline-block rounded-2xl px-3 py-1.5 text-[12px]',
                          isVet ? 'bg-muted text-foreground rounded-tl-sm' : 'bg-emerald-600 text-white rounded-tr-sm'
                        )}>
                          {m.text}
                        </div>
                        {m.time && <p className="text-[10px] text-muted-foreground mt-0.5 px-1">{m.time}</p>}
                      </div>
                    </div>
                  )
                })}
                <div ref={chatEndRef} />
              </div>

              <div className="border-t border-border p-2 flex gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  className="h-9 text-[12px]"
                />
                <Button size="icon" className="h-9 w-9 bg-emerald-600 hover:bg-emerald-700 shrink-0" onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer: e-prescription shortcut */}
        <div className="border-t border-border bg-card px-4 py-2 flex items-center gap-3">
          <Pill className="h-4 w-4 text-violet-600" />
          <p className="text-[12px] text-muted-foreground flex-1">
            Al finalizar, el veterinario puede enviarte una receta digital y un resumen de la consulta.
          </p>
          <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
            Receta digital disponible
          </Badge>
        </div>
      </div>

      {/* AI Summary overlay (after endCall) */}
      {(generatingSummary || summary) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-emerald-500 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Resumen IA de la teleconsulta</CardTitle>
                  <p className="text-[12px] text-muted-foreground">
                    {pet?.name} · {vet?.name} · {formatDuration(seconds)} de duración
                  </p>
                </div>
                {summary && (
                  <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={closeSummary}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {generatingSummary && (
                <div className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Analizando el chat y generando el resumen estructurado...</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">Esto puede tardar 5-10 segundos</p>
                </div>
              )}
              {summary && (
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-medium uppercase text-muted-foreground mb-1.5">Resumen de la consulta</p>
                    <p className="text-sm text-foreground leading-relaxed">{summary.summary}</p>
                  </div>

                  {summary.recommendations && summary.recommendations.length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium uppercase text-muted-foreground mb-1.5">Recomendaciones para el dueño</p>
                      <ul className="space-y-1.5">
                        {summary.recommendations.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-[13px] text-foreground">
                            <Check className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summary.prescriptions && summary.prescriptions.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <p className="text-[11px] font-medium uppercase text-amber-700 mb-1.5 flex items-center gap-1.5">
                        <Pill className="h-3.5 w-3.5" /> Recetas digitales generadas
                      </p>
                      <ul className="space-y-1">
                        {summary.prescriptions.map((p, i) => (
                          <li key={i} className="text-[12px] text-amber-800">
                            <strong>{p.drugName}</strong> · {p.dose} · {p.duration}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summary.followUp && (
                    <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3">
                      <Calendar className="h-4 w-4 text-sky-600 shrink-0" />
                      <p className="text-[12px] text-sky-700">
                        <strong>Seguimiento:</strong> {summary.followUp}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 border-t border-border pt-3">
                    <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                      <Sparkles className="h-2.5 w-2.5 mr-1" /> Generado por IA · revisar antes de enviar
                    </Badge>
                    <Button size="sm" className="ml-auto bg-emerald-600 hover:bg-emerald-700" onClick={closeSummary}>
                      <FileText className="h-4 w-4" /> Entendido, cerrar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
