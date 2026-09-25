import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai/pattern-detection
// Body: { pet: {...}, consultations: [...] }
// Devuelve: { patterns: [{ type, severity, description, recommendation }] }

export async function POST(req: NextRequest) {
  try {
    const { pet, consultations } = await req.json()
    if (!consultations || consultations.length < 2) {
      return NextResponse.json({ patterns: [] })
    }

    const zai = await ZAI.create()

    const systemPrompt = `Eres un epidemiólogo veterinario experto. Analizas el historial clínico de un paciente y detectas patrones de recurrencia, progresión o señales de alerta.

Reglas:
1. Devuelve SOLO JSON: { "patterns": [{ "type": string, "severity": "info"|"warning"|"critical", "description": string, "recommendation": string }] }
2. Busca: episodios recurrentes (misma afección 3+ veces en 6 meses), progresión de peso, vacunas atrasadas, consultas urgentes frecuentes, interacciones medicamentosas potencialmente problemáticas.
3. Si no hay patrones relevantes, devuelve un array vacío.
4. Sé conciso: descripción máx 2 frases, recomendación 1 frase.
5. Considera especie, raza y edad al evaluar severidad.`

    const consultationsText = consultations.map((c: any, i: number) => {
      const dx = c.diagnoses?.map((d: any) => d.name).join(', ') || '—'
      const tx = c.treatments?.map((t: any) => `${t.drugName} ${t.doseMg}mg`).join(', ') || '—'
      return `Consulta ${i + 1} (${new Date(c.date).toLocaleDateString('es-ES')}):
  Motivo: ${c.reason || '—'}
  Subjetivo: ${c.subjective || '—'}
  Objetivo: ${c.objective || '—'}
  Assessment: ${c.assessment || '—'}
  Diagnósticos: ${dx}
  Tratamientos: ${tx}
  Peso: ${c.weightKg ?? '—'} kg
  Temperatura: ${c.temperatureC ?? '—'} °C`
    }).join('\n\n')

    const userPrompt = `Paciente: ${pet.name} (${pet.species}, ${pet.breed}, ${pet.age || 'n/d'}, ${pet.weight || 'n/d'} kg)
Condiciones crónicas: ${pet.chronicConditions?.join(', ') || 'ninguna'}
Alergias: ${pet.allergies?.join(', ') || 'ninguna'}

Historial de ${consultations.length} consultas:

${consultationsText}

Detecta patrones clínicos relevantes en este historial.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      thinking: { type: 'disabled' },
    })

    const raw = completion.choices[0]?.message?.content || ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { patterns: [] }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[/api/ai/pattern-detection] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
