import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai/soap-draft
// Body: { text: string, pet: {...} }
// Devuelve: { soap: { subjective, objective, assessment, plan } }
// Útil cuando el vet escribe texto en lugar de dictar.

export async function POST(req: NextRequest) {
  try {
    const { text, pet } = await req.json()
    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'text requerido' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const petContext = pet
      ? `Paciente: ${pet.name} (${pet.species}, ${pet.breed}, ${pet.age || 'n/d'}, ${pet.weight || 'n/d'} kg, ${pet.sex === 'M' ? 'macho' : 'hembra'}).
Alergias: ${pet.allergies?.join(', ') || 'ninguna'}.
Condiciones crónicas: ${pet.chronicConditions?.join(', ') || 'ninguna'}.
Motivo: ${pet.reason || 'n/d'}.`
      : 'Sin contexto.'

    const systemPrompt = `Eres un asistente clínico veterinario. Estructuras notas del veterinario en formato SOAP.
Devuelve SOLO JSON válido con campos: "subjective", "objective", "assessment", "plan".
Cada campo: texto plano en español, máx 3 frases.
No inventes; si falta información deja el campo vacío.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        {
          role: 'user',
          content: `Contexto:
${petContext}

Notas del veterinario:
"""
${text}
"""

Devuelve el JSON SOAP.`,
        },
      ],
      thinking: { type: 'disabled' },
    })

    const raw = completion.choices[0]?.message?.content || ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const soap = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { subjective: text, objective: '', assessment: '', plan: '' }

    return NextResponse.json({ soap })
  } catch (err: any) {
    console.error('[/api/ai/soap-draft] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
