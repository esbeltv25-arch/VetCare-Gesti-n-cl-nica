'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useCreateHospitalization } from '@/lib/vet-hospitalization-hooks'
import type { Pet, Vet } from '@/lib/vet-data'

interface AdmissionDialogProps {
  pets: Pet[]
  vets: Vet[]
  onClose: () => void
}

const CAGES = ['Box 1', 'Box 2', 'Box 3', 'Box Grande 1', 'Box Grande 2', 'Jaula A-1', 'Jaula A-2', 'Jaula A-3', 'Oxígeno-Box 1', 'Oxígeno-Box 2']

export function AdmissionDialog({ pets, vets, onClose }: AdmissionDialogProps) {
  const create = useCreateHospitalization()
  const [petId, setPetId] = useState('')
  const [attendingVetId, setAttendingVetId] = useState('')
  const [cage, setCage] = useState('')
  const [reason, setReason] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [feedingPlan, setFeedingPlan] = useState('')
  const [fluidTherapy, setFluidTherapy] = useState('')
  const [notes, setNotes] = useState('')

  const selectedPet = pets.find(p => p.id === petId)
  const activeVets = vets.filter(v => v.active)

  async function handleSubmit() {
    if (!petId || !attendingVetId || !cage || !reason) {
      toast.error('Completa todos los campos obligatorios')
      return
    }
    try {
      await create.mutateAsync({
        petId,
        attendingVetId,
        cage,
        reason,
        weightKg: weightKg ? Number(weightKg) : undefined,
        feedingPlan: feedingPlan || undefined,
        fluidTherapy: fluidTherapy || undefined,
        notes: notes || undefined,
      })
      toast.success('Paciente admitido · bitácora de guardia activada')
      onClose()
    } catch (e: any) {
      toast.error('Error: ' + e.message)
    }
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Admitir paciente para internación</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selección de mascota */}
          <div>
            <Label className="text-[12px] font-medium">Mascota *</Label>
            <select
              value={petId}
              onChange={e => {
                setPetId(e.target.value)
                const p = pets.find(pp => pp.id === e.target.value)
                if (p) setWeightKg(String(p.weight))
              }}
              className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
            >
              <option value="">Selecciona una mascota...</option>
              {pets.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species}, {p.breed})
                </option>
              ))}
            </select>
          </div>

          {/* Vet responsable */}
          <div>
            <Label className="text-[12px] font-medium">Veterinario responsable *</Label>
            <select
              value={attendingVetId}
              onChange={e => setAttendingVetId(e.target.value)}
              className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
            >
              <option value="">Selecciona un veterinario...</option>
              {activeVets.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} — {v.specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Cage + peso */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[12px] font-medium">Box / Jaula *</Label>
              <select
                value={cage}
                onChange={e => setCage(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-[13px]"
              >
                <option value="">Selecciona...</option>
                {CAGES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-[12px] font-medium">Peso al ingreso (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={e => setWeightKg(e.target.value)}
                className="mt-1"
                placeholder={selectedPet ? String(selectedPet.weight) : '0.0'}
              />
            </div>
          </div>

          {/* Motivo */}
          <div>
            <Label className="text-[12px] font-medium">Motivo de internación *</Label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="mt-1"
              placeholder="Ej: postoperatorio de ovariohisterectomía, observación por vómitos persistentes, etc."
            />
          </div>

          {/* Plan alimentación + Fluidoterapia */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[12px] font-medium">Plan de alimentación</Label>
              <Input
                value={feedingPlan}
                onChange={e => setFeedingPlan(e.target.value)}
                className="mt-1"
                placeholder="Ej: 4 tomas/día voluntaria"
              />
            </div>
            <div>
              <Label className="text-[12px] font-medium">Fluidoterapia</Label>
              <Input
                value={fluidTherapy}
                onChange={e => setFluidTherapy(e.target.value)}
                className="mt-1"
                placeholder="Ej: SS 500ml/día a 20ml/h"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <Label className="text-[12px] font-medium">Notas / indicaciones especiales</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="mt-1"
              placeholder="Ej: vigilar FR cada 2h, manejar con ferret first, avisar al dueño de evolución diaria..."
            />
          </div>

          {/* Acciones */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={create.isPending}>
              Cancelar
            </Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit} disabled={create.isPending}>
              {create.isPending ? 'Admitiendo...' : 'Admitir y crear bitácora'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
