'use client'

import { useRef, useState } from 'react'
import {
  Plus,
  X,
  Upload,
  Loader2,
  Camera,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useUpdatePet } from '@/lib/vet-clinic-hooks'
import type { Pet } from '@/lib/vet-data'

interface PetGalleryProps {
  pet: Pet
}

export function PetGallery({ pet }: PetGalleryProps) {
  const updatePet = useUpdatePet()
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // galleryPhotos siempre es un array (default [])
  const photos: string[] = (pet.galleryPhotos || []) as string[]

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    try {
      const newPhotos: string[] = []
      for (const file of files) {
        // Redimensionar/comprimir antes de guardar
        const compressed = await compressImage(file, 800)
        newPhotos.push(compressed)
      }
      const updated = [...photos, ...newPhotos]
      await updatePet.mutateAsync({
        id: pet.id,
        galleryPhotos: updated,
      })
      toast.success(`${newPhotos.length} foto(s) añadida(s) a ${pet.name}`)
    } catch (err: any) {
      toast.error('Error al subir: ' + err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDelete(idx: number) {
    if (!confirm('¿Eliminar esta foto de la galería?')) return
    try {
      const updated = photos.filter((_, i) => i !== idx)
      await updatePet.mutateAsync({
        id: pet.id,
        galleryPhotos: updated,
      })
      toast.success('Foto eliminada')
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    }
  }

  async function handleSetAsMain(idx: number) {
    try {
      const photo = photos[idx]
      await updatePet.mutateAsync({
        id: pet.id,
        photoUrl: photo,
      })
      toast.success('Foto principal actualizada')
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-foreground">
            Galería fotográfica
          </h3>
          <span className="text-[11px] text-muted-foreground">
            ({photos.length} foto{photos.length !== 1 ? 's' : ''})
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo...</>
          ) : (
            <><Plus className="h-4 w-4" /> Añadir foto</>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {photos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
          <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground mb-1">
            Sin fotos adicionales
          </p>
          <p className="text-[11px] text-muted-foreground/70">
            Añade fotos para mejor reconocimiento del paciente: rasgos distintivos, marcas, estado clínico, etc.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {photos.map((photo, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded-md overflow-hidden border border-border"
            >
              <img
                src={photo.startsWith('data:') ? photo : `data:image/jpeg;base64,${photo}`}
                alt={`${pet.name} foto ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-1">
                <button
                  className="h-7 w-7 rounded-full bg-white/90 text-emerald-700 hover:bg-white text-[10px] font-medium flex items-center justify-center"
                  onClick={() => handleSetAsMain(idx)}
                  title="Hacer foto principal"
                >
                  ★
                </button>
                <button
                  className="h-7 w-7 rounded-full bg-white/90 text-rose-700 hover:bg-white flex items-center justify-center"
                  onClick={() => handleDelete(idx)}
                  title="Eliminar foto"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {idx === 0 && photos.length > 0 && pet.photoUrl === photo && (
                <span className="absolute bottom-1 right-1 text-[9px] bg-emerald-600 text-white px-1 py-0.5 rounded">
                  PRINCIPAL
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Comprimir imagen antes de guardar como base64
async function compressImage(file: File, maxDimension: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height
          height = maxDimension
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('No se pudo obtener contexto del canvas'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        // JPEG con calidad 0.7 para reducir tamaño
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        // Devolver solo el base64 sin el prefijo data:image/jpeg;base64,
        resolve(dataUrl.split(',')[1])
      }
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsDataURL(file)
  })
}
