'use client'

import { useTranslation } from '@/lib/vet-clinic-hooks'
import { useState } from 'react'
import {
  Stethoscope,
  Dog,
  Cat,
  Rabbit,
  Bird,
  Search,
  Plus,
  FileText,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Topbar } from '@/components/vet/topbar'
import { cn } from '@/lib/utils'
import { usePets, useVets, useConsultations } from '@/lib/vet-hooks'
import { useAIPatternDetection } from '@/lib/vet-emr-hooks'
import { calculateAge, formatDate, formatCurrency } from '@/lib/vet-data'
import { ConsultationEditor } from '@/components/vet/emr/consultation-editor'

const SPECIES_ICON: Record<string, any> = {
  'Perro': Dog,
  'Gato': Cat,
  'Conejo': Rabbit,
  'Ave': Bird,
}

export function EmrView() {
  const { data: pets = [] } = usePets()
  const { t } = useTranslation()
  const { data: vets = [] } = useVets()
  const [search, setSearch] = useState('')
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)

  const filtered = pets.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.breed.toLowerCase().includes(search.toLowerCase())
  )

  if (selectedPetId) {
    const pet = pets.find(p => p.id === selectedPetId)
    const vet = vets.find(v => v.role === 'Veterinario' && v.active) || vets[0]
    if (pet && vet) {
      return (
        <ConsultationEditor
          pet={pet}
          vet={vet}
          onBack={() => setSelectedPetId(null)}
        />
      )
    }
  }

  return (
    <div>
      <Topbar title="Historia Clínica (EMR)" subtitle="Editor de consultas con copiloto IA" actionLabel="Nueva consulta" />

      <div className="p-6 space-y-4">
        <Card className="bg-gradient-to-br from-violet-50 via-white to-emerald-50 border-violet-200">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-emerald-500 text-white">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Copiloto IA para consultas</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Dicta la consulta en voz y la IA la transcribe y estructura en SOAP. Genera anamnesis adaptada al paciente, sugiere diagnósticos diferenciales con score de confianza, calcula dosis por peso y detecta patrones en el historial.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white text-violet-700 border-violet-200">🎙️ Dictado → SOAP</Badge>
                <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-200">🔍 Diagnóstico diferencial</Badge>
                <Badge variant="outline" className="bg-white text-sky-700 border-sky-200">📋 Anamnesis adaptativa</Badge>
                <Badge variant="outline" className="bg-white text-amber-700 border-amber-200">⚖️ Dosis por peso</Badge>
                <Badge variant="outline" className="bg-white text-rose-700 border-rose-200">⚡ Detección de patrones</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente para iniciar consulta..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(pet => {
            const Icon = SPECIES_ICON[pet.species] || Dog
            const isCritical = pet.status === 'Crítico' || pet.status === 'En tratamiento'
            return (
              <Card
                key={pet.id}
                className="cursor-pointer overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
                onClick={() => setSelectedPetId(pet.id)}
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img src={pet.photoUrl} alt={pet.name} className="h-full w-full object-cover" />
                  {isCritical && (
                    <div className="absolute left-2 top-2">
                      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] capitalize">
                        {pet.status}
                      </Badge>
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                      <Icon className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground truncate">{pet.name}</h3>
                    <span className="text-[11px] text-muted-foreground">{calculateAge(pet.birthDate)}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground truncate">{pet.breed}</p>
                  <Button size="sm" className="w-full mt-3 bg-violet-600 hover:bg-violet-700" variant="default">
                    <Plus className="h-3.5 w-3.5" /> Abrir consulta
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
