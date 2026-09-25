import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai/diagnosis
// Body: { pet: {...}, subjective, objective, assessment }
// Devuelve: { differentials: [{ name, confidence, rationale, recommended_tests? }] }

export async function POST(req: NextRequest) {
  try {
    const { pet, subjective, objective, assessment } = await req.json()
    if (!pet) return NextResponse.json({ error: 'pet requerido' }, { status: 400 })

    const zai = await ZAI.create()

    const systemPrompt = `Eres un médico veterinario experto en diagnóstico diferencial. Recibes datos clínicos y sugieres los 3 diagnósticos diferenciales más probables.

Reglas estrictas:
1. Devuelve SOLO JSON válido: { "differentials": [{ "name": string, "confidence": number, "rationale": string, "recommended_tests": string }] }
2. confidence debe ser un número entre 0 y 1 (probabilidad estimada).
3. Máximo 3 diagnósticos, ordenados de mayor a menor confianza.
4. rationale: 1-2 frases explicando el razonamiento (predisposición racial, síntomas coincidentes, hallazgos de exploración).
5. recommended_tests: pruebas diagnósticas sugeridas (ej. "hemograma + bioquímica", "radiografía torácica").
6. Sé conservador: si los datos son ambiguos, baja la confianza. NO inventes hallazgos no reportados.
7. Considera especies y razas con predisposiciones documentadas.
8. Aclara que son sugerencias y que el juicio clínico final es del veterinario.`

    const userPrompt = `Paciente:
- ${pet.name} (${pet.species}, ${pet.breed}, ${pet.age || 'n/d'}, ${pet.weight || 'n/d'} kg, ${pet.sex === 'M' ? 'macho' : 'hembra'})
- Alergias: ${pet.allergies?.join(', ') || 'ninguna'}
- Condiciones crónicas: ${pet.chronicConditions?.join(', ') || 'ninguna'}

Notas clínicas:

Subjetivo (lo que relata el dueño):
${subjective || '(vacío)'}

Objetivo (hallazgos clínicos):
${objective || '(vacío)'}

Assessment inicial del veterinario:
${assessment || '(vacío)'}

Sugiere los 3 diagnósticos diferenciales más probables con confianza y pruebas recomendadas.`

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
      : { differentials: [] }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[/api/ai/diagnosis] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
