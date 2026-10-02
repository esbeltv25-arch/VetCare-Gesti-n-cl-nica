import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/vet/invoices - listar facturas
export async function GET() {
  const invoices = await db.invoice.findMany({
    include: { items: true, client: true, pet: true },
    orderBy: { date: 'desc' },
  })
  const result = invoices.map(inv => ({
    id: inv.id,
    number: inv.number,
    clientId: inv.clientId,
    petId: inv.petId,
    date: inv.date,
    status: inv.status,
    paymentMethod: inv.paymentMethod,
    items: inv.items.map(it => ({
      description: it.description,
      qty: it.qty,
      unitPrice: it.unitPrice,
    })),
    total: inv.items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0),
  }))
  return NextResponse.json(result)
}

// POST /api/vet/invoices - crear nueva factura
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { number, clientId, petId, date, status, paymentMethod, items } = body

  if (!number || !clientId || !petId || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: 'number, clientId, petId y items[] son requeridos' },
      { status: 400 }
    )
  }

  const created = await db.invoice.create({
    data: {
      number,
      date: date || new Date().toISOString().split('T')[0],
      status: status || 'Pendiente',
      paymentMethod: paymentMethod || null,
      clientId,
      petId,
      items: {
        create: items.map((it: any) => ({
          description: it.description,
          qty: Number(it.qty),
          unitPrice: Number(it.unitPrice),
        })),
      },
    },
    include: { items: true },
  })

  return NextResponse.json({
    id: created.id,
    number: created.number,
    clientId: created.clientId,
    petId: created.petId,
    date: created.date,
    status: created.status,
    paymentMethod: created.paymentMethod,
    items: created.items.map(it => ({
      description: it.description,
      qty: it.qty,
      unitPrice: it.unitPrice,
    })),
    total: created.items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0),
  }, { status: 201 })
}

// PATCH /api/vet/invoices - actualizar factura (marcar como pagada, etc.)
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, status, paymentMethod } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const data: any = {}
  if (status !== undefined) data.status = status
  if (paymentMethod !== undefined) data.paymentMethod = paymentMethod

  const updated = await db.invoice.update({
    where: { id },
    data,
    include: { items: true },
  })

  return NextResponse.json({
    id: updated.id,
    number: updated.number,
    clientId: updated.clientId,
    petId: updated.petId,
    date: updated.date,
    status: updated.status,
    paymentMethod: updated.paymentMethod,
    items: updated.items.map(it => ({
      description: it.description,
      qty: it.qty,
      unitPrice: it.unitPrice,
    })),
    total: updated.items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0),
  })
}
