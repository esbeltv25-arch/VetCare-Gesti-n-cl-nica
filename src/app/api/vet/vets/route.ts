import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/vet/vets - listar personal
export async function GET() {
  const vets = await db.vet.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(vets)
}

// POST /api/vet/vets - crear nuevo empleado
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, role, specialty, phone, email, shift, avatarColor } = body

  if (!name || !role) {
    return NextResponse.json(
      { error: 'name y role son requeridos' },
      { status: 400 }
    )
  }

  const created = await db.vet.create({
    data: {
      id: `v${Date.now()}`,
      name,
      role,
      specialty: specialty || '',
      phone: phone || '',
      email: email || '',
      shift: shift || 'Completo',
      active: true,
      appointmentsToday: 0,
      rating: 5.0,
      avatarColor: avatarColor || 'bg-emerald-100 text-emerald-700',
    },
  })

  return NextResponse.json(created, { status: 201 })
}
