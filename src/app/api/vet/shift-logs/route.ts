import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/vet/shift-logs?hospitalizationId=xxx    (lista, ordenados por timestamp desc)
// POST /api/vet/shift-logs                          (añadir nueva entrada a la bitácora)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const hospitalizationId = searchParams.get('hospitalizationId')
  if (!hospitalizationId) {
    return NextResponse.json({ error: 'hospitalizationId requerido' }, { status: 400 })
  }

  const logs = await db.shiftLog.findMany({
    where: { hospitalizationId },
    include: {
      reporterVet: true,
      incomingVet: true,
    },
    orderBy: { timestamp: 'desc' },
  })

  return NextResponse.json(logs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    hospitalizationId,
    reporterVetId,
    incomingVetId,
    type,
    content,
    // Medication
    drugName,
    doseMg,
    dosePerKg,
    route,
    // Vitals
    temperatureC,
    heartRate,
    respiratoryRate,
    weightKg,
    appetite,
    hydration,
    urination,
    feces,
    // Incident
    severity,
  } = body

  if (!hospitalizationId || !reporterVetId || !type || !content) {
    return NextResponse.json(
      { error: 'hospitalizationId, reporterVetId, type y content son requeridos' },
      { status: 400 }
    )
  }

  const created = await db.shiftLog.create({
    data: {
      hospitalizationId,
      reporterVetId,
      incomingVetId: incomingVetId || null,
      type,
      content,
      drugName: drugName || null,
      doseMg: doseMg !== undefined ? Number(doseMg) : null,
      dosePerKg: dosePerKg !== undefined ? Number(dosePerKg) : null,
      route: route || null,
      temperatureC: temperatureC !== undefined && temperatureC !== '' ? Number(temperatureC) : null,
      heartRate: heartRate !== undefined && heartRate !== '' ? Number(heartRate) : null,
      respiratoryRate: respiratoryRate !== undefined && respiratoryRate !== '' ? Number(respiratoryRate) : null,
      weightKg: weightKg !== undefined && weightKg !== '' ? Number(weightKg) : null,
      appetite: appetite || null,
      hydration: hydration || null,
      urination: urination || null,
      feces: feces || null,
      severity: severity || null,
    },
    include: {
      reporterVet: true,
      incomingVet: true,
    },
  })

  return NextResponse.json(created, { status: 201 })
}
