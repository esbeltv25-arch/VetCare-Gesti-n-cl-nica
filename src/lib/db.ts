import { PrismaClient } from '@prisma/client'

// Cache global del cliente Prisma.
// Cuando cambie el schema, incrementamos el sufijo numérico para forzar
// la creación de un cliente nuevo con los modelos actualizados.
const CACHE_KEY = 'prismaVet5'

const globalForPrisma = globalThis as unknown as {
  [key: string]: PrismaClient | undefined
}

// Limpiar cachés antiguas si existen
if (globalForPrisma.prisma) delete globalForPrisma.prisma
if (globalForPrisma.prismaVet2) delete globalForPrisma.prismaVet2
if (globalForPrisma.prismaVet3) delete globalForPrisma.prismaVet3
if (globalForPrisma.prismaVet4) delete globalForPrisma.prismaVet4

export const db =
  globalForPrisma[CACHE_KEY] ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma[CACHE_KEY] = db