import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
