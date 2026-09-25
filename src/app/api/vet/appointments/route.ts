import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/vet/appointments?date=YYYY-MM-DD
// GET /api/vet/appointments?from=YYYY-MM-DD&to=YYYY-MM-DD
// POST /api/vet/appointments  - crear nueva cita
// PATCH /api/vet/appointments - actualizar (drag-and-drop)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let where: any = {}
  if (date) where.date = date
  else if (from && to) where.date = { gte: from, lte: to }

  const appts = await db.appointment.findMany({
    where,
    include: { pet: true, client: true, vet: true },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  })
  const result = appts.map(a => ({
    id: a.id,
    petId: a.petId,
    clientId: a.clientId,
    vetId: a.vetId,
    date: a.date,
    time: a.time,
    duration: a.duration,
    reason: a.reason,
    type: a.type,
    status: a.status,
  }))
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const appt = await db.appointment.create({
    data: {
      date: body.date,
      time: body.time,
      duration: body.duration || 30,
      reason: body.reason,
      type: body.type || 'Consulta',
      status: body.status || 'Pendiente',
      petId: body.petId,
      clientId: body.clientId,
      vetId: body.vetId,
    },
  })
  return NextResponse.json(appt, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const appt = await db.appointment.update({
    where: { id },
    data: {
      ...(updates.date !== undefined && { date: updates.date }),
      ...(updates.time !== undefined && { time: updates.time }),
      ...(updates.duration !== undefined && { duration: updates.duration }),
      ...(updates.reason !== undefined && { reason: updates.reason }),
      ...(updates.type !== undefined && { type: updates.type }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.vetId !== undefined && { vetId: updates.vetId }),
    },
  })
  return NextResponse.json(appt)
}
