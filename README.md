# 🏥 VetCare — Sistema de gestión veterinaria con copiloto IA

Plataforma integral para clínicas veterinarias que combina gestión operativa, historia clínica electrónica con copiloto IA, portal de autoservicio para dueños y telemedicina.

[![Deploy to Render](https://render.com/images/deploy-to-render-btn.svg)](https://render.com/deploy?repo=https://github.com/esbeltv25-arch/VetCare-Gesti-n-cl-nica)

> ⚠️ **Antes de hacer deploy** necesitas una base de datos PostgreSQL gratuita en [Neon.tech](https://neon.tech) (0.5GB, no expira). Render te pedirá la `DATABASE_URL` durante el deploy.

## ✨ Features

### Módulos del panel staff (sidebar)
- **Dashboard** — KPIs clicables, alertas contextuales, gráficos Recharts (área, pie, barras)
- **Pacientes** — Fichas con fotos, vacunas, alergias, galería fotográfica y campos personalizados
- **Clientes** — Dueños con mascotas asociadas, facturación, programa de fidelización
- **Agenda** — Calendario arrastrable (drag-and-drop) con vista día/semana, reprogramación con optimistic update
- **Historia Clínica (EMR)** — Editor SOAP con copiloto IA: dictado → SOAP, anamnesis adaptativa, diagnósticos diferenciales, dosis por peso, detección de patrones
- **Internación / Guardia** — Bitácora en tiempo real (polling 5s) para auxiliares nocturnos: medicamentos, incidencias, comportamientos, constantes vitales, handover protocol
- **Inventario** — Stock, lotes, vencimientos con alertas automáticas
- **Facturación** — Facturas con estados, métodos de pago, resumen financiero
- **Personal** — Equipo con roles, turnos, rating

### Portal del cliente (vista dueño)
- Login con email (mock, listo para NextAuth)
- Dashboard personalizado con sus mascotas y citas
- Cartilla digital de vacunas con alertas de vencimiento
- **Telemedicina** — Videollamada simulada con chat + **resumen IA automático** al colgar

### Personalización completa
- **Marca** — nombre y subtítulo customizables
- **Colores** — primario y de acento con color picker (8 presets cada uno)
- **Modo claro/oscuro** — toggle con persistencia
- **Renombrar módulos** — todas las etiquetas del sidebar + títulos de páginas son editables
- **Reordenar/ocultar módulos** — drag-and-drop con @dnd-kit
- **Campos personalizados** por paciente — añade campos como "Número de seguro", "Pedigree", etc.

### Guía integrada
- Botón "?" en el sidebar abre modal fullscreen con 15 secciones organizadas por audiencia
- Buscador en tiempo real, navegación por teclado (← → Esc)
- PDF descargable de 16 páginas generado con ReportLab

## 🛠️ Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (Turbopack) + React 19 + App Router |
| Tipado | TypeScript 5 estricto |
| UI | Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons |
| Base de datos | Prisma ORM + PostgreSQL (Neon.tech recomendado) |
| Server state | TanStack Query v5 con optimistic updates y polling |
| Gráficos | Recharts 3 |
| Drag-and-drop | @dnd-kit/core + @dnd-kit/sortable |
| IA | z-ai-web-dev-sdk (LLM + ASR) — backend only |
| Toasts | sonner |

## 🚀 Instalación local

### Prerrequisitos
- Node.js 18+ o Bun
- Python 3.10+ (solo para regenerar el PDF de la guía)
- PostgreSQL local o cuenta en Neon.tech

### Pasos

```bash
# 1. Clonar el repo
git clone https://github.com/esbeltv25-arch/VetCare-Gesti-n-cl-nica.git
cd VetCare-Gesti-n-cl-nica

# 2. Instalar dependencias
bun install   # o: npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL (local SQLite o Neon.tech PostgreSQL)

# 4. Aplicar schema Prisma + sembrar datos demo
bun run db:push
bun run scripts/seed-vet.ts        # 10 mascotas, 7 clientes, 12 citas, etc.
bun run scripts/seed-hospitalizations.ts   # 3 internados + 28 entradas de bitácora

# 5. (Opcional) Regenerar PDF de la guía
python3 scripts/build-guide-pdf.py  # genera /public/guia-vetcare.pdf

# 6. Arrancar dev server
bun run dev
# Abrir http://localhost:3000
```

## 📚 Datos demo

Al sembrar la BD tendrás:

| Entidad | Cantidad | Ejemplos |
|---|---|---|
| Clientes | 7 | María González, Carlos Ruiz, Laura Pérez... |
| Mascotas | 10 | Luna (Labrador), Max (Pastor Alemán), Rocky (Bulldog)... |
| Vacunas | 13 | Rabia, Moquillo, Parvovirus, Leucemia felina... |
| Personal | 7 | Dra. Elena Torres (Cirugía), Dr. Miguel Fernández (Medicina interna)... |
| Citas | 12 | Vacunación, urgencia respiratoria, peluquería... |
| Productos inventario | 14 | Vacunas, Amoxicilina, pienso Royal Canin... |
| Facturas | 8 | Pagadas, pendientes, vencidas |
| Hospitalizaciones | 3 | Rocky (disnea), Max (postop), Nube (rinitis) |
| Entradas bitácora | 28 | Medicamentos, incidencias, handover completo |

## 🤖 Copiloto IA — Endpoints disponibles

Todas las funciones IA usan `z-ai-web-dev-sdk` en backend (LLM + ASR):

| Endpoint | Función |
|---|---|
| `POST /api/ai/transcribe` | Audio base64 → transcripción + SOAP estructurado |
| `POST /api/ai/soap-draft` | Texto libre → JSON SOAP |
| `POST /api/ai/anamnesis` | Pet + motivo → 5-7 preguntas adaptativas por especie/raza |
| `POST /api/ai/diagnosis` | Pet + SOAP → top-3 diagnósticos diferenciales con score de confianza |
| `POST /api/ai/pattern-detection` | Historial → alertas de recurrencia y patrones |
| `POST /api/ai/telemedicine-summary` | Chat videollamada → resumen + recetas + plan seguimiento |

> ⚠️ **Importante**: Las sugerencias IA son siempre eso, sugerencias. El veterinario mantiene la responsabilidad clínica. La IA nunca prescribe fármacos por su cuenta.

## 📂 Estructura del proyecto

```
.
├── prisma/
│   └── schema.prisma              # 12 modelos: Client, Pet, Vet, Appointment, Consultation, Diagnosis, Treatment, Hospitalization, ShiftLog, Invoice, InventoryItem, ClinicSettings
├── src/
│   ├── app/
│   │   ├── page.tsx               # App shell con Sidebar + main + modales
│   │   ├── layout.tsx             # QueryProvider + Toaster + SonnerToaster
│   │   ├── globals.css            # Tailwind 4 + CSS vars dinámicas (--clinic-primary/accent)
│   │   └── api/
│   │       ├── vet/               # CRUD: clients, pets, vets, appointments, consultations, hospitalizations, shift-logs, invoices, inventory, dashboard, clinic-settings
│   │       └── ai/                # 6 endpoints IA con z-ai-web-dev-sdk
│   ├── components/
│   │   ├── ui/                    # shadcn/ui (button, card, dialog, table, etc.)
│   │   └── vet/                   # Componentes de la app
│   │       ├── sidebar.tsx       # Sidebar con moduleLayout + moduleLabels dinámicos
│   │       ├── topbar.tsx         # Topbar con título dinámico desde settings
│   │       ├── dashboard.tsx     # KPIs + 3 gráficos Recharts
│   │       ├── patients.tsx      # Grid de mascotas + dialog detalle
│   │       ├── pet-gallery.tsx   # Galería fotográfica con compresión automática
│   │       ├── custom-fields-editor.tsx  # Campos personalizados editables
│   │       ├── clients.tsx
│   │       ├── appointments.tsx   # Drag-and-drop calendario
│   │       ├── inventory.tsx
│   │       ├── billing.tsx
│   │       ├── staff.tsx
│   │       ├── emr/               # EMR con copiloto IA
│   │       │   ├── emr-view.tsx
│   │       │   └── consultation-editor.tsx  # Editor SOAP + 5 acciones IA
│   │       ├── hospitalization/  # Bitácora en tiempo real
│   │       │   ├── hospitalization-view.tsx
│   │       │   ├── hospitalization-detail.tsx
│   │       │   ├── admission-dialog.tsx
│   │       │   └── handover-dialog.tsx     # Relevo de turno
│   │       ├── client-portal.tsx # Vista dueño
│   │       ├── telemedicine-call.tsx  # Videollamada + resumen IA al cerrar
│   │       ├── view-switcher.tsx
│   │       ├── guide-modal.tsx   # Guía in-app fullscreen
│   │       └── settings-dialog.tsx  # Personalización completa
│   └── lib/
│       ├── db.ts                  # PrismaClient singleton con cache versionada
│       ├── vet-data.ts           # Tipos + datos demo originales
│       ├── vet-hooks.ts          # TanStack Query hooks (CRUD)
│       ├── vet-emr-hooks.ts     # Hooks EMR + mutaciones IA
│       ├── vet-hospitalization-hooks.ts  # Hooks internación con polling 5s
│       ├── vet-clinic-hooks.ts  # Hooks settings + applySettings runtime
│       └── guide-content.ts     # Contenido de la guía (single source of truth)
├── scripts/
│   ├── seed-vet.ts               # Sembrado inicial
│   ├── seed-hospitalizations.ts  # Sembrado internaciones
│   └── build-guide-pdf.py       # Genera PDF con ReportLab
├── public/
│   └── guia-vetcare.pdf          # Guía PDF descargable (16 páginas)
├── prisma/schema.prisma
├── render.yaml                   # Configuración para deploy en Render.com
├── .github/workflows/ci.yml     # CI: lint automático en push/PR
├── package.json
└── .env.example
```

## 🔧 Comandos útiles

```bash
bun run dev              # Arrancar dev server (puerto 3000)
bun run lint             # Verificar código con ESLint
bun run db:push          # Aplicar cambios de schema Prisma a la BD

# Reinicializar BD con datos demo (¡borra todo!)
bun run scripts/seed-vet.ts
bun run scripts/seed-hospitalizations.ts

# Regenerar PDF de la guía
python3 scripts/build-guide-pdf.py
```

## 🐛 Troubleshooting

**Error: "Module not found" tras modificar Prisma schema**
El cliente Prisma puede quedar stale en memoria. Solución: en `src/lib/db.ts`, bump el `CACHE_KEY` (de `prismaVet6` a `prismaVet7`, etc.) y reinicia el dev server.

**Error: "Cannot read properties of undefined (reading 'findMany')"**
Mismo problema que arriba. Bump cache key + restart.

**El sidebar no muestra un módulo**
Abre el SettingsDialog (botón Palette en el sidebar) → sección "Módulos visibles y orden" → pulsa el Eye para mostrarlo de nuevo.

**Las fotos subidas pesan mucho**
Ya hay compresión automática (máx 800px, JPEG calidad 0.7). Para producción con muchas fotos, migrar a almacenamiento S3/OSS cambiando el endpoint `PATCH /api/vet/pets`.

## 🚀 Deploy en Render.com (gratis)

El repo incluye `render.yaml` (Blueprint) que permite deploy con 1 click desde el botón del README:

1. Crea cuenta en [Neon.tech](https://neon.tech) → New Project → copia la `DATABASE_URL`
2. Pulsa el botón "Deploy to Render" del README (o ve a https://render.com/deploy?repo=https://github.com/esbeltv25-arch/VetCare-Gesti-n-cl-nica)
3. Render te pedirá la `DATABASE_URL` → pégala
4. Espera 3-5 min al build (instala deps + Prisma generate + build Next.js)
5. Tu URL pública será: `https://vetcare-xxxx.onrender.com`

## 📄 Licencia

Proyecto de demostración. Libre uso para fines educativos y de evaluación.

---

**VetCare** — Hecho con Next.js, Prisma, TanStack Query, Recharts, @dnd-kit y z-ai-web-dev-sdk.

Despliegue exitoso
