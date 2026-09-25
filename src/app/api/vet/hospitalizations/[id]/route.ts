import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/vet/hospitalizations/[id]   (detalle completo)
// DELETE /api/vet/hospitalizations/[id] (alta: marca discharged con dischargeDate)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const h = await db.hospitalization.findUnique({
    where: { id },
    include: {
      pet: { include: { client: true } },
      attendingVet: true,
      shiftLogs: {
        include: {
          reporterVet: true,
          incomingVet: true,
        },
        orderBy: { timestamp: 'asc' },
      },
    },
  })
  if (!h) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(h)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const discharged = await db.hospitalization.update({
    where: { id },
    data: {
      status: 'discharged',
      dischargeDate: new Date(),
    },
  })
  return NextResponse.json(discharged)
}
