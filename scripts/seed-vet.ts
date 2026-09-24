// Script para sembrar la base de datos con datos mock de VetCare
// Uso: bun run /home/z/my-project/scripts/seed-vet.ts
import { db } from '../src/lib/db'

// Importar datos mock existentes
import {
  clients,
  pets,
  vets,
  appointments,
  inventory,
  invoices,
} from '../src/lib/vet-data'

async function main() {
  console.log('Limpiando tablas...')
  await db.invoiceItem.deleteMany()
  await db.invoice.deleteMany()
  await db.appointment.deleteMany()
  await db.vaccine.deleteMany()
  await db.inventoryItem.deleteMany()
  await db.pet.deleteMany()
  await db.vet.deleteMany()
  await db.client.deleteMany()

  console.log('Insertando clientes...')
  for (const c of clients) {
    await db.client.create({
      data: {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        address: c.address,
        since: new Date(c.since),
        loyaltyPoints: c.loyaltyPoints,
        avatarColor: c.avatarColor,
      },
    })
  }

  console.log('Insertando mascotas y vacunas...')
  for (const p of pets) {
    await db.pet.create({
      data: {
        id: p.id,
        name: p.name,
        species: p.species,
        breed: p.breed,
        birthDate: new Date(p.birthDate),
        weight: p.weight,
        sex: p.sex,
        microchip: p.microchip,
        sterilized: p.sterilized,
        photoUrl: p.photoUrl,
        allergies: JSON.stringify(p.allergies),
        chronicConditions: JSON.stringify(p.chronicConditions),
        status: p.status,
        lastVisit: p.lastVisit ? new Date(p.lastVisit) : null,
        clientId: p.clientId,
      },
    })

    for (const v of p.vaccines) {
      await db.vaccine.create({
        data: {
          name: v.name,
          date: new Date(v.date),
          nextDue: v.nextDue ? new Date(v.nextDue) : null,
          petId: p.id,
        },
      })
    }
  }

  console.log('Insertando personal...')
  for (const v of vets) {
    await db.vet.create({
      data: {
        id: v.id,
        name: v.name,
        role: v.role,
        specialty: v.specialty,
        phone: v.phone,
        email: v.email,
        shift: v.shift,
        active: v.active,
        appointmentsToday: v.appointmentsToday,
        rating: v.rating,
        avatarColor: v.avatarColor,
      },
    })
  }

  console.log('Insertando citas...')
  for (const a of appointments) {
    await db.appointment.create({
      data: {
        id: a.id,
        date: a.date,
        time: a.time,
        duration: a.duration,
        reason: a.reason,
        type: a.type,
        status: a.status,
        petId: a.petId,
        clientId: a.clientId,
        vetId: a.vetId,
      },
    })
  }

  console.log('Insertando inventario...')
  for (const i of inventory) {
    await db.inventoryItem.create({
      data: {
        id: i.id,
        name: i.name,
        category: i.category,
        stock: i.stock,
        minStock: i.minStock,
        unit: i.unit,
        expiryDate: i.expiryDate || null,
        supplier: i.supplier,
        price: i.price,
        lot: i.lot,
      },
    })
  }

  console.log('Insertando facturas y items...')
  for (const inv of invoices) {
    await db.invoice.create({
      data: {
        id: inv.id,
        number: inv.number,
        date: inv.date,
        status: inv.status,
        paymentMethod: inv.paymentMethod || null,
        clientId: inv.clientId,
        petId: inv.petId,
        items: {
          create: inv.items.map(item => ({
            description: item.description,
            qty: item.qty,
            unitPrice: item.unitPrice,
          })),
        },
      },
    })
  }

  const counts = {
    clients: await db.client.count(),
    pets: await db.pet.count(),
    vaccines: await db.vaccine.count(),
    vets: await db.vet.count(),
    appointments: await db.appointment.count(),
    inventory: await db.inventoryItem.count(),
    invoices: await db.invoice.count(),
    invoiceItems: await db.invoiceItem.count(),
  }
  console.log('Sembrado completo:', counts)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
