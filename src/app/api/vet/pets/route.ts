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
    galleryPhotos: JSON.parse(p.galleryPhotos || '[]'),
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

// PATCH /api/vet/pets — actualizar mascota (galería de fotos, etc.)
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Convertir arrays a JSON strings antes de guardar
  const data: any = {}
  if (updates.galleryPhotos !== undefined) {
    data.galleryPhotos = JSON.stringify(updates.galleryPhotos || [])
  }
  if (updates.allergies !== undefined) {
    data.allergies = JSON.stringify(updates.allergies || [])
  }
  if (updates.chronicConditions !== undefined) {
    data.chronicConditions = JSON.stringify(updates.chronicConditions || [])
  }
  if (updates.photoUrl !== undefined) data.photoUrl = updates.photoUrl
  if (updates.status !== undefined) data.status = updates.status
  if (updates.weight !== undefined) data.weight = updates.weight

  const updated = await db.pet.update({
    where: { id },
    data,
  })

  return NextResponse.json({ ok: true, id: updated.id })
}
