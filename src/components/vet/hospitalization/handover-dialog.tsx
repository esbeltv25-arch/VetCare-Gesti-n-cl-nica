'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAddShiftLog } from '@/lib/vet-hospitalization-hooks'
import type { Vet } from '@/lib/vet-data'

interface HandoverDialogProps {
  hospitalizationId: string
  reporterVet?: Vet
  vets: Vet[]
  lastLogContent?: string
  onClose: () => void
}

export function HandoverDialog({
  hospitalizationId,
  reporterVet,
  vets,
  lastLogContent,
  onClose,
}: HandoverDialogProps) {
  const add = useAddShiftLog()
  const [incomingVetId, setIncomingVetId] = useState('')
  const [content, setContent] = useState(
    lastLogContent
      ? `Resumen de evolución y relevo: ${lastLogContent.slice(0, 80)}...`
      : 'Le entrego el turno. Resumen de evolución, próximos pasos, signos de alarma a vigilar y medicamentos pendientes:'
  )

  async function handleSubmit() {
    if (!incomingVetId) {
      toast.error('Selecciona quién recibe el turno')
      return
    }
    if (!content.trim()) {
      toast.error('Escribe las notas de relevo')
      return
    }
    try {
      await add.mutateAsync({
        hospitalizationId,
        reporterVetId: reporterVet?.id || '',
        incomingVetId,
        type: 'handover',
        content,
      })
      toast.success('Relevo registrado · visible en tiempo real')
      onClose()
    } catch (e: any) {
      toast.error('Error: ' + e.message)
    }
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-violet-600" />
            Relevo de turno
          </DialogTitle>
        </DialogHeader>

        {/* Saliente → Entrante */}
        <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
          <p className="text-[11px] uppercase font-medium text-violet-700 mb-3">Protocolo de handover</p>
          <div className="flex items-center gap-3">
            {/* Saliente */}
            <div className="flex-1 text-center">
              <div className={cn('mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold', reporterVet?.avatarColor)}>
                {reporterVet?.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase">Saliente</p>
              <p className="text-sm font-semibold text-foreground">{reporterVet?.name}</p>
              <p className="text-[11px] text-muted-foreground">{reporterVet?.role}</p>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <ArrowRight className="h-6 w-6 text-violet-600" />
              <span className="text-[10px] text-violet-700 mt-1">entrega a</span>
            </div>

            {/* Entrante */}
            <div className="flex-1">
              <select
                value={incomingVetId}
                onChange={e => setIncomingVetId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-[13px]"
              >
                <option value="">Selecciona quien recibe...</option>
                {vets.filter(v => v.id !== reporterVet?.id).map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.role}
                  </option>
                ))}
              </select>
              {incomingVetId && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold', vets.find(v => v.id === incomingVetId)?.avatarColor)}>
                    {vets.find(v => v.id === incomingVetId)?.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{vets.find(v => v.id === incomingVetId)?.name}</p>
                    <p className="text-[11px] text-muted-foreground">{vets.find(v => v.id === incomingVetId)?.role}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notas de relevo */}
        <div>
          <Label className="text-[12px] font-medium">Notas de relevo</Label>
          <p className="text-[11px] text-muted-foreground mt-1 mb-2">
            Resume: evolución del paciente, próximas dosis/horas, signos de alarma a vigilar, indicaciones especiales.
          </p>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="min-h-[120px] text-[12px]"
          />
        </div>

        {/* Recordatorio */}
        <div className="rounded-md bg-muted/50 border border-border p-2 flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
            Tiempo real
          </Badge>
          <p className="text-[11px] text-muted-foreground">
            Esta entrada será visible al instante para todos los veterinarios conectados.
          </p>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={add.isPending}>
            Cancelar
          </Button>
          <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={handleSubmit} disabled={add.isPending}>
            {add.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Registrando...</>
            ) : (
              <><ArrowRight className="h-4 w-4" /> Registrar relevo</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
