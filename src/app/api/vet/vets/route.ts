import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const vets = await db.vet.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(vets)
}
