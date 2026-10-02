import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/vet/clinic-settings — siempre devuelve un objeto (crea singleton si no existe)
export async function GET() {
  let settings = await db.clinicSettings.findUnique({
    where: { id: 'singleton' },
  })
  if (!settings) {
    settings = await db.clinicSettings.create({
      data: { id: 'singleton' },
    })
  }
  return NextResponse.json({
    id: settings.id,
    brandName: settings.brandName,
    brandSubtitle: settings.brandSubtitle,
    primaryColor: settings.primaryColor,
    accentColor: settings.accentColor,
    darkMode: settings.darkMode,
    moduleLabels: JSON.parse(settings.moduleLabels || '{}'),
    moduleLayout: JSON.parse(settings.moduleLayout || '{}'),
    language: settings.language || 'es',
  })
}

// PUT /api/vet/clinic-settings — actualiza uno o más campos
export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { brandName, brandSubtitle, primaryColor, accentColor, darkMode, moduleLabels, moduleLayout, language } = body

  // Asegurar que existe el singleton
  let settings = await db.clinicSettings.findUnique({ where: { id: 'singleton' } })
  if (!settings) {
    settings = await db.clinicSettings.create({ data: { id: 'singleton' } })
  }

  const updated = await db.clinicSettings.update({
    where: { id: 'singleton' },
    data: {
      ...(brandName !== undefined && { brandName }),
      ...(brandSubtitle !== undefined && { brandSubtitle }),
      ...(primaryColor !== undefined && { primaryColor }),
      ...(accentColor !== undefined && { accentColor }),
      ...(darkMode !== undefined && { darkMode }),
      ...(moduleLabels !== undefined && {
        moduleLabels: typeof moduleLabels === 'string' ? moduleLabels : JSON.stringify(moduleLabels),
      }),
      ...(moduleLayout !== undefined && {
        moduleLayout: typeof moduleLayout === 'string' ? moduleLayout : JSON.stringify(moduleLayout),
      }),
      ...(language !== undefined && { language }),
    },
  })

  return NextResponse.json({
    id: updated.id,
    brandName: updated.brandName,
    brandSubtitle: updated.brandSubtitle,
    primaryColor: updated.primaryColor,
    accentColor: updated.accentColor,
    darkMode: updated.darkMode,
    moduleLabels: JSON.parse(updated.moduleLabels || '{}'),
    moduleLayout: JSON.parse(updated.moduleLayout || '{}'),
    language: updated.language || 'es',
  })
}
