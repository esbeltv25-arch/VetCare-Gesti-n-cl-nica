import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const c = await db.consultation.findUnique({
    where: { id },
    include: { diagnoses: true, treatments: true, pet: { include: { client: true } }, vet: true },
  })
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(c)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.consultation.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
