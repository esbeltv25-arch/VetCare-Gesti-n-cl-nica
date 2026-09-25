import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/vet/hospitalizations?status=active   (default: active only)
// POST /api/vet/hospitalizations                  (admitir nueva internación)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'active'

  const where: any = {}
  if (status !== 'all') where.status = status

  const hospitalizations = await db.hospitalization.findMany({
    where,
    include: {
      pet: { include: { client: true } },
      attendingVet: true,
      shiftLogs: {
        include: {
          reporterVet: true,
          incomingVet: true,
        },
        orderBy: { timestamp: 'desc' },
      },
    },
    orderBy: { admissionDate: 'desc' },
  })

  return NextResponse.json(hospitalizations)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { petId, attendingVetId, cage, reason, weightKg, feedingPlan, fluidTherapy, notes } = body

  if (!petId || !attendingVetId || !cage || !reason) {
    return NextResponse.json(
      { error: 'petId, attendingVetId, cage y reason son requeridos' },
      { status: 400 }
    )
  }

  const created = await db.hospitalization.create({
    data: {
      petId,
      attendingVetId,
      cage,
      reason,
      weightKg: weightKg || null,
      feedingPlan: feedingPlan || null,
      fluidTherapy: fluidTherapy || null,
      notes: notes || null,
    },
    include: {
      pet: { include: { client: true } },
      attendingVet: true,
    },
  })

  return NextResponse.json(created, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const updated = await db.hospitalization.update({
    where: { id },
    data: updates,
  })
  return NextResponse.json(updated)
}
