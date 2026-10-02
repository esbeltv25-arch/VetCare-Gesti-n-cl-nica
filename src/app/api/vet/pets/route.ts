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

// POST /api/vet/pets — crear nueva mascota
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, species, breed, birthDate, weight, sex, microchip, sterilized, photoUrl, allergies, chronicConditions, status, clientId } = body

  if (!name || !species || !breed || !birthDate || !clientId) {
    return NextResponse.json(
      { error: 'name, species, breed, birthDate y clientId son requeridos' },
      { status: 400 }
    )
  }

  const created = await db.pet.create({
    data: {
      id: `p${Date.now()}`,
      name,
      species,
      breed,
      birthDate: new Date(birthDate),
      weight: Number(weight) || 0,
      sex: sex || 'M',
      microchip: microchip || '',
      sterilized: sterilized || false,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1518717758536-3a9c8f3a4d3b?w=400&h=400&fit=crop',
      allergies: JSON.stringify(allergies || []),
      chronicConditions: JSON.stringify(chronicConditions || []),
      customFields: '[]',
      galleryPhotos: '[]',
      status: status || 'Sano',
      clientId,
    },
    include: { client: true },
  })

  return NextResponse.json({
    id: created.id,
    name: created.name,
    species: created.species,
    breed: created.breed,
    birthDate: created.birthDate.toISOString(),
    weight: created.weight,
    sex: created.sex,
    microchip: created.microchip,
    sterilized: created.sterilized,
    photoUrl: created.photoUrl,
    galleryPhotos: JSON.parse(created.galleryPhotos || '[]'),
    allergies: JSON.parse(created.allergies || '[]'),
    chronicConditions: JSON.parse(created.chronicConditions || '[]'),
    customFields: JSON.parse(created.customFields || '[]'),
    status: created.status,
    lastVisit: created.lastVisit?.toISOString(),
    clientId: created.clientId,
    vaccines: [],
  }, { status: 201 })
}
