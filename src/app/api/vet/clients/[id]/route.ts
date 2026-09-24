import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const client = await db.client.findUnique({
    where: { id },
    include: {
      pets: { include: { vaccines: true, appointments: true } },
      invoices: { include: { items: true, pet: true } },
    },
  })
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(client)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.client.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
