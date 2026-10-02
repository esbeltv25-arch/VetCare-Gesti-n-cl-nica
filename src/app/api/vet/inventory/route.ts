import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/vet/inventory - listar inventario
export async function GET() {
  const items = await db.inventoryItem.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(items)
}

// POST /api/vet/inventory - crear producto
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, category, stock, minStock, unit, expiryDate, supplier, price, lot } = body

  if (!name || !category || stock === undefined || minStock === undefined) {
    return NextResponse.json(
      { error: 'name, category, stock y minStock son requeridos' },
      { status: 400 }
    )
  }

  const created = await db.inventoryItem.create({
    data: {
      id: `i${Date.now()}`,
      name,
      category,
      stock: Number(stock),
      minStock: Number(minStock),
      unit: unit || 'unidades',
      expiryDate: expiryDate || null,
      supplier: supplier || '',
      price: price ? Number(price) : 0,
      lot: lot || '',
    },
  })

  return NextResponse.json(created, { status: 201 })
}

// PATCH /api/vet/inventory - actualizar stock
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const data: any = {}
  for (const key of ['name', 'category', 'unit', 'expiryDate', 'supplier', 'lot']) {
    if (updates[key] !== undefined) data[key] = updates[key]
  }
  for (const key of ['stock', 'minStock', 'price']) {
    if (updates[key] !== undefined) data[key] = Number(updates[key])
  }

  const updated = await db.inventoryItem.update({ where: { id }, data })
  return NextResponse.json(updated)
}
