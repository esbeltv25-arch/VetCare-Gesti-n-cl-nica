import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai/telemedicine-summary
// Body: { pet, vet, chatMessages, durationSec }
// Devuelve: { summary, recommendations, prescriptions?: [{ drugName, dose, duration }] }

export async function POST(req: NextRequest) {
  try {
    const { pet, vet, chatMessages, durationSec } = await req.json()
    if (!pet || !chatMessages) {
      return NextResponse.json({ error: 'pet y chatMessages requeridos' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const systemPrompt = `Eres un asistente clínico que redacta resúmenes de teleconsultas veterinarias a partir del chat de la videollamada.

Reglas:
1. Devuelve SOLO JSON: { "summary": string, "recommendations": string[], "followUp": string, "prescriptions": [{ "drugName": string, "dose": string, "duration": string }] }
2. summary: 2-3 frases en español describiendo el motivo, los hallazgos y la decisión tomada.
3. recommendations: 3-5 bullets accionables para el dueño (cuidados en casa, signos de alarma, cuándo volver).
4. followUp: cuándo programar control (ej: "Control en 7 días" o "Sin seguimiento necesario").
5. prescriptions: SOLO si el veterinario mencionó explícitamente un fármaco. Si no mencionó ninguno, devuelve array vacío. NO inventes fármacos.
6. Sé conservador: si faltan datos, sé explícito en el summary.`

    const chatText = chatMessages
      .map((m: any) => `[${m.from.toUpperCase()}] ${m.text}`)
      .join('\n')

    const userPrompt = `Paciente: ${pet.name} (${pet.species}, ${pet.breed}, ${pet.age || 'n/d'}, ${pet.weight || 'n/d'} kg)
Veterinario: ${vet?.name || 'n/d'} (${vet?.specialty || 'n/d'})
Duración de la videollamada: ${Math.round(durationSec / 60)} min ${durationSec % 60} s

Transcripción del chat de la videollamada:
"""
${chatText}
"""

Redacta el resumen estructurado de la teleconsulta.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      thinking: { type: 'disabled' },
    })

    const raw = completion.choices[0]?.message?.content || ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: '', recommendations: [], followUp: '', prescriptions: [] }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[/api/ai/telemedicine-summary] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
