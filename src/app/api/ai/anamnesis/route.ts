import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai/anamnesis
// Body: { pet: {...}, reason: string }
// Devuelve: { questions: string[] } - 5-7 preguntas adaptadas a especie/raza/motivo

export async function POST(req: NextRequest) {
  try {
    const { pet, reason } = await req.json()
    if (!pet) {
      return NextResponse.json({ error: 'pet requerido' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const systemPrompt = `Eres un veterinario experto en anamnesis. Generas preguntas de anamnesis adaptadas al paciente y al motivo de consulta.
Reglas:
1. Devuelve SOLO un JSON válido con formato { "questions": ["...", "...", ... }
2. Genera entre 5 y 7 preguntas concretas y relevantes.
3. Adapta las preguntas a la especie, raza, edad y motivo declarado.
4. Considera predisposiciones raciales conocidas (ej. bulldog francés -> problemas respiratorios; pastor alemán -> displasia).
5. Evita preguntas genéricas; sé específico y accionable.
6. Las preguntas deben estar en español y ser máx 15 palabras cada una.`

    const userPrompt = `Paciente:
- Nombre: ${pet.name}
- Especie: ${pet.species}
- Raza: ${pet.breed}
- Edad: ${pet.age || 'n/d'}
- Peso: ${pet.weight || 'n/d'} kg
- Sexo: ${pet.sex === 'M' ? 'macho' : 'hembra'}
- Esterilizado: ${pet.sterilized ? 'sí' : 'no'}
- Alergias conocidas: ${pet.allergies?.join(', ') || 'ninguna'}
- Condiciones crónicas: ${pet.chronicConditions?.join(', ') || 'ninguna'}

Motivo de consulta: ${reason || 'No especificado (consulta general)'}

Genera 5-7 preguntas de anamnesis específicas para este paciente y motivo.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      thinking: { type: 'disabled' },
    })

    const raw = completion.choices[0]?.message?.content || ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const result = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { questions: [] }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[/api/ai/anamnesis] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
