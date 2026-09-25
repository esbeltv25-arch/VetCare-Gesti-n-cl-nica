import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/vet/pets - listar mascotas con sus vacunas
export async function GET() {
  const pets = await db.pet.findMany({
    include: { vaccines: true, client: true },
    orderBy: { name: 'asc' },
  })
  const result = pets.map(p => ({
    id: p.id,
    name: p.name,
    species: p.species,
    breed: p.breed,
    birthDate: p.birthDate.toISOString(),
    weight: p.weight,
    sex: p.sex,
    microchip: p.microchip,
    sterilized: p.sterilized,
    photoUrl: p.photoUrl,
    allergies: JSON.parse(p.allergies || '[]'),
    chronicConditions: JSON.parse(p.chronicConditions || '[]'),
    status: p.status,
    lastVisit: p.lastVisit?.toISOString(),
    clientId: p.clientId,
    vaccines: p.vaccines.map(v => ({
      id: v.id,
      name: v.name,
      date: v.date.toISOString(),
      nextDue: v.nextDue?.toISOString(),
    })),
  }))
  return NextResponse.json(result)
}
