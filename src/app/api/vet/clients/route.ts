// GET  /api/vet/clients        - listar clientes
// POST /api/vet/clients        - crear cliente
// GET  /api/vet/clients/[id]   - detalle cliente
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const clients = await db.client.findMany({
    include: { pets: true, invoices: { include: { items: true } } },
    orderBy: { name: 'asc' },
  })
  const result = clients.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    address: c.address,
    since: c.since.toISOString(),
    loyaltyPoints: c.loyaltyPoints,
    avatarColor: c.avatarColor,
    petIds: c.pets.map(p => p.id),
  }))
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const client = await db.client.create({
    data: {
      id: body.id || `c${Date.now()}`,
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address || '',
      since: body.since ? new Date(body.since) : new Date(),
      loyaltyPoints: body.loyaltyPoints || 0,
      avatarColor: body.avatarColor || 'bg-emerald-100 text-emerald-700',
    },
  })
  return NextResponse.json(client, { status: 201 })
}
