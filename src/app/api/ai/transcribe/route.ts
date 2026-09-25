import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai/transcribe
// Body: { audio_base64: string, pet: { name, species, breed, age, weight, sex, allergies, chronicConditions, reason } }
// Devuelve: { transcript, soap: { subjective, objective, assessment, plan } }

interface SoapResult {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { audio_base64, pet } = body

    if (!audio_base64) {
      return NextResponse.json({ error: 'audio_base64 requerido' }, { status: 400 })
    }

    const zai = await ZAI.create()

    // 1. Transcribir audio
    const asrRes = await zai.audio.asr.create({ file_base64: audio_base64 })
    const transcript = (asrRes as any).text || ''

    if (!transcript.trim()) {
      return NextResponse.json({ error: 'No se pudo transcribir el audio' }, { status: 422 })
    }

    // 2. Estructurar en SOAP con LLM
    const soap = await structureSoap(zai, transcript, pet)

    return NextResponse.json({ transcript, soap })
  } catch (err: any) {
    console.error('[/api/ai/transcribe] error:', err)
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}

async function structureSoap(zai: any, transcript: string, pet: any): Promise<SoapResult> {
  const petContext = pet
    ? `Paciente: ${pet.name} (${pet.species}, ${pet.breed}, ${pet.age || 'edad n/d'}, ${pet.weight || 'n/d'} kg, ${pet.sex === 'M' ? 'macho' : 'hembra'}).
Alergias conocidas: ${pet.allergies?.join(', ') || 'ninguna'}.
Condiciones crónicas: ${pet.chronicConditions?.join(', ') || 'ninguna'}.
Motivo de consulta declarado: ${pet.reason || 'no especificado'}.`
    : 'Sin contexto del paciente.'

  const systemPrompt = `Eres un asistente clínico veterinario experto. Tu tarea es estructurar el dictado del veterinario en formato SOAP (Subjetivo, Objetivo, Análisis, Plan).

Reglas estrictas:
1. Devuelve SOLO JSON válido. Cero texto adicional, cero markdown.
2. Campos: "subjective", "objective", "assessment", "plan".
3. Cada campo debe ser texto plano en español, máx 3-4 frases.
4. subjective: lo que el dueño/vet relata (síntomas, duración, contexto).
5. objective: hallazgos clínicos objetivos (constantes, exploración física, peso, temp).
6. assessment: diagnóstico presuntivo o confirmado + razonamiento breve.
7. plan: tratamiento, pruebas complementarias, recomendaciones, seguimiento.
8. Si el dictado no contiene información para un campo, déjalo como string vacío.
9. NO inventes diagnósticos: si el vet no lo mencionó, deja assessment con la inferencia más probable marcándola como "presuntivo".`

  const userPrompt = `Contexto del paciente:
${petContext}

Dictado transcrito del veterinario:
"""
${transcript}
"""

Devuelve el JSON SOAP estructurado.`

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    thinking: { type: 'disabled' },
  })

  const raw = completion.choices[0]?.message?.content || ''
  // Extraer JSON aunque venga con code fences
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return {
      subjective: transcript,
      objective: '',
      assessment: '',
      plan: '',
    }
  }
  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return { subjective: transcript, objective: '', assessment: '', plan: '' }
  }
}
