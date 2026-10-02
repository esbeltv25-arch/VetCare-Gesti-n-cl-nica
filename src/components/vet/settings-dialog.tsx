'use client'

import { useState, useEffect } from 'react'
import {
  Palette,
  Type,
  Moon,
  Sun,
  RefreshCw,
  Loader2,
  Check,
  Sparkles,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useClinicSettings, useUpdateClinicSettings, DEFAULT_SETTINGS, type ClinicSettings } from '@/lib/vet-clinic-hooks'
import { LANGUAGES, type Language } from '@/lib/i18n'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Paleta predefinida de colores para elegir rápido
const PRIMARY_PRESETS = [
  { name: 'Esmeralda', hex: '#10b981' },
  { name: 'Azul océano', hex: '#0ea5e9' },
  { name: 'Violeta', hex: '#7c3aed' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Ámbar', hex: '#f59e0b' },
  { name: 'Rojo', hex: '#dc2626' },
  { name: 'Cian', hex: '#06b6d4' },
  { name: 'Lima', hex: '#65a30d' },
]

const ACCENT_PRESETS = [
  { name: 'Violeta', hex: '#7c3aed' },
  { name: 'Esmeralda', hex: '#10b981' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Naranja', hex: '#f97316' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Magenta', hex: '#be185d' },
]

const DEFAULT_MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  patients: 'Pacientes',
  clients: 'Clientes',
  appointments: 'Agenda',
  emr: 'Historia Clínica',
  hospitalization: 'Internación',
  inventory: 'Inventario',
  billing: 'Facturación',
  staff: 'Personal',
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { data: settings } = useClinicSettings()
  const update = useUpdateClinicSettings()

  // Estado local solo para overrides; si no hay override, usar settings del server
  const [overrides, setOverrides] = useState<Partial<ClinicSettings>>({})

  // Limpiar overrides al cerrar (cuando open pasa a false)
  useEffect(() => {
    if (!open) {
      // Timeout para no interferir con la animación de cierre del Dialog
      const t = setTimeout(() => setOverrides({}), 100)
      return () => clearTimeout(t)
    }
  }, [open])

  // Combinar settings del server + overrides locales
  const draft: ClinicSettings = {
    ...DEFAULT_SETTINGS,
    ...(settings || {}),
    ...overrides,
    moduleLabels: {
      ...(settings?.moduleLabels || {}),
      ...(overrides.moduleLabels || {}),
    },
    moduleLayout: {
      ...(settings?.moduleLayout || {}),
      ...(overrides.moduleLayout || {}),
    },
  }

  function applySetting<K extends keyof ClinicSettings>(key: K, value: ClinicSettings[K]) {
    setOverrides(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    try {
      await update.mutateAsync(draft)
      toast.success('Personalización guardada · aplicada a toda la app')
      onOpenChange(false)
    } catch (e: any) {
      toast.error('Error: ' + e.message)
    }
  }

  const hasChanges = Object.keys(overrides).length > 0

  async function handleReset() {
    if (!confirm('¿Restablecer a valores por defecto? Se perderán los cambios de personalización.')) return
    const reset: ClinicSettings = {
      ...DEFAULT_SETTINGS,
      moduleLabels: {},
    }
    setDraft(reset)
    try {
      await update.mutateAsync(reset)
      toast.success('Personalización restablecida')
    } catch (e: any) {
      toast.error('Error: ' + e.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-emerald-600" />
            Personalización de la clínica
          </DialogTitle>
          <p className="text-[12px] text-muted-foreground">
            Ajusta colores, nombre de marca, etiquetas de módulos y tema. Los cambios se aplican a toda la app en tiempo real.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Marca */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Type className="h-4 w-4" /> Marca
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[12px]">Nombre de la marca</Label>
                <Input
                  value={draft.brandName}
                  onChange={e => applySetting('brandName', e.target.value)}
                  className="mt-1"
                  placeholder="VetCare"
                />
              </div>
              <div>
                <Label className="text-[12px]">Subtítulo</Label>
                <Input
                  value={draft.brandSubtitle}
                  onChange={e => applySetting('brandSubtitle', e.target.value)}
                  className="mt-1"
                  placeholder="Gestión clínica"
                />
              </div>
            </div>
          </section>

          {/* Color primario */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="h-4 w-4 rounded" style={{ background: draft.primaryColor }} />
              Color primario
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-3">
              {PRIMARY_PRESETS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => applySetting('primaryColor', c.hex)}
                  className={cn(
                    'aspect-square rounded-lg border-2 transition-all',
                    draft.primaryColor === c.hex ? 'border-foreground scale-105' : 'border-transparent hover:scale-105'
                  )}
                  style={{ background: c.hex }}
                  title={c.name}
                >
                  {draft.primaryColor === c.hex && (
                    <Check className="h-4 w-4 text-white mx-auto drop-shadow" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={draft.primaryColor}
                onChange={e => applySetting('primaryColor', e.target.value)}
                className="h-9 w-12 rounded-md border border-border cursor-pointer"
              />
              <Input
                value={draft.primaryColor}
                onChange={e => applySetting('primaryColor', e.target.value)}
                className="max-w-[140px] font-mono"
              />
              <span className="text-[11px] text-muted-foreground">
                Aparece en botones principales, KPIs, badges activos y el logo del sidebar.
              </span>
            </div>
          </section>

          {/* Color de acento */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="h-4 w-4 rounded" style={{ background: draft.accentColor }} />
              Color de acento
            </h3>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {ACCENT_PRESETS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => applySetting('accentColor', c.hex)}
                  className={cn(
                    'aspect-square rounded-lg border-2 transition-all',
                    draft.accentColor === c.hex ? 'border-foreground scale-105' : 'border-transparent hover:scale-105'
                  )}
                  style={{ background: c.hex }}
                  title={c.name}
                >
                  {draft.accentColor === c.hex && (
                    <Check className="h-4 w-4 text-white mx-auto drop-shadow" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={draft.accentColor}
                onChange={e => applySetting('accentColor', e.target.value)}
                className="h-9 w-12 rounded-md border border-border cursor-pointer"
              />
              <Input
                value={draft.accentColor}
                onChange={e => applySetting('accentColor', e.target.value)}
                className="max-w-[140px] font-mono"
              />
              <span className="text-[11px] text-muted-foreground">
                Aparece en el portal del cliente, telemedicina y badges IA.
              </span>
            </div>
          </section>

          {/* Modo oscuro */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              {draft.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              Tema
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => applySetting('darkMode', false)}
                className={cn(
                  'rounded-lg border-2 p-3 text-left transition-all',
                  !draft.darkMode ? 'border-emerald-500 bg-emerald-50' : 'border-border hover:bg-muted'
                )}
              >
                <Sun className="h-5 w-5 mb-1 text-amber-500" />
                <p className="text-sm font-medium">Modo claro</p>
                <p className="text-[11px] text-muted-foreground">Fondo blanco, ideal para consultas diurnas</p>
              </button>
              <button
                onClick={() => applySetting('darkMode', true)}
                className={cn(
                  'rounded-lg border-2 p-3 text-left transition-all',
                  draft.darkMode ? 'border-emerald-500 bg-emerald-50' : 'border-border hover:bg-muted'
                )}
              >
                <Moon className="h-5 w-5 mb-1 text-violet-600" />
                <p className="text-sm font-medium">Modo oscuro</p>
                <p className="text-[11px] text-muted-foreground">Fondo oscuro, cómodo para guardias nocturnas</p>
              </button>
            </div>
          </section>

          {/* Idioma */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              🌍 Idioma de la aplicación
            </h3>
            <p className="text-[12px] text-muted-foreground mb-3">
              Selecciona el idioma de toda la aplicación. Se aplica al instante.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => applySetting('language', l.code)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-left transition-all',
                    draft.language === l.code
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <span className="text-xl">{l.flag}</span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-foreground truncate">{l.label}</p>
                    <p className="text-[10px] text-muted-foreground">{l.code}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Etiquetas de módulos */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Etiquetas de módulos
            </h3>
            <p className="text-[12px] text-muted-foreground mb-3">
              Personaliza cómo se llaman los módulos en el sidebar. Vacío = usar nombre por defecto.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(DEFAULT_MODULE_LABELS).map(([key, defaultLabel]) => (
                <div key={key}>
                  <Label className="text-[11px] text-muted-foreground">
                    {defaultLabel} <span className="opacity-50">→</span>
                  </Label>
                  <Input
                    value={draft.moduleLabels[key] || ''}
                    onChange={e => {
                      const newLabels = { ...draft.moduleLabels }
                      if (e.target.value) {
                        newLabels[key] = e.target.value
                      } else {
                        delete newLabels[key]
                      }
                      applySetting('moduleLabels', newLabels)
                    }}
                    placeholder={defaultLabel}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Preview */}
          <section className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-[11px] font-medium uppercase text-muted-foreground mb-2">Vista previa</p>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
                style={{ background: draft.primaryColor }}
              >
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">{draft.brandName}</p>
                <p className="text-[11px] text-muted-foreground">{draft.brandSubtitle}</p>
              </div>
              <Badge
                className="ml-auto"
                style={{
                  background: draft.accentColor,
                  color: 'white',
                }}
              >
                {draft.moduleLabels.patients || 'Pacientes'}
              </Badge>
            </div>
          </section>

          {/* Acciones */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={update.isPending}>
              <RefreshCw className="h-4 w-4" /> Restablecer
            </Button>
            <div className="ml-auto flex items-center gap-2">
              {hasChanges && (
                <span className="text-[11px] text-amber-600">Tienes cambios sin guardar</span>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={update.isPending}>
                Cancelar
              </Button>
              <Button
                className={cn('text-white')}
                style={{ background: draft.primaryColor }}
                onClick={handleSave}
                disabled={update.isPending || !hasChanges}
              >
                {update.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
                ) : (
                  <><Check className="h-4 w-4" /> Aplicar cambios</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
