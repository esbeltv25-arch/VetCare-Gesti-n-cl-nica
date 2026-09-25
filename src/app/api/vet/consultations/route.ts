import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/vet/consultations?petId=p1
// POST /api/vet/consultations  - crear o guardar
// PATCH /api/vet/consultations  - actualizar (autosave)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const petId = searchParams.get('petId')
  const where: any = {}
  if (petId) where.petId = petId

  const consultations = await db.consultation.findMany({
    where,
    include: { diagnoses: true, treatments: true, pet: true, vet: true },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(consultations)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { id, petId, vetId, appointmentId, ...rest } = body

  // Si tiene id, actualizar; si no, crear
  if (id) {
    const updated = await db.consultation.update({
      where: { id },
      data: {
        ...rest,
        // Sincronizar diagnósticos y tratamientos en cascada simple
        ...(rest.diagnoses ? {
          diagnoses: {
            deleteMany: {},
            create: rest.diagnoses,
          },
        } : {}),
        ...(rest.treatments ? {
          treatments: {
            deleteMany: {},
            create: rest.treatments,
          },
        } : {}),
      },
      include: { diagnoses: true, treatments: true },
    })
    return NextResponse.json(updated)
  }

  const created = await db.consultation.create({
    data: {
      petId,
      vetId,
      appointmentId: appointmentId || null,
      ...rest,
      ...(rest.diagnoses ? { diagnoses: { create: rest.diagnoses } } : {}),
      ...(rest.treatments ? { treatments: { create: rest.treatments } } : {}),
    },
    include: { diagnoses: true, treatments: true },
  })
  return NextResponse.json(created, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  // Autoupdate para autosave: solo campos escalares
  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Quitamos los arrays (los manejamos por POST)
  const { diagnoses, treatments, ...scalarUpdates } = updates
  const updated = await db.consultation.update({
    where: { id },
    data: scalarUpdates,
  })
  return NextResponse.json(updated)
}
