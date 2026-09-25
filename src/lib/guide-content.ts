// Contenido estructurado de la guía VetCare
// Usado por: el modal in-app (guide-modal.tsx) y el script PDF (build-guide-pdf.py)

export interface GuideBlock {
  type: 'paragraph' | 'list' | 'callout' | 'steps' | 'code' | 'kbd'
  text?: string
  items?: string[]
  steps?: { title: string; description: string }[]
  variant?: 'info' | 'warning' | 'tip' | 'ai'
  language?: string
}

export interface GuideSection {
  id: string
  title: string
  subtitle?: string
  audience: 'staff' | 'owner' | 'admin' | 'all'
  icon: string // emoji o nombre de icono
  blocks: GuideBlock[]
}

export interface GuideChapter {
  id: string
  title: string
  description: string
  audience: 'staff' | 'owner' | 'admin'
  sections: GuideSection[]
}

export const GUIDE_INTRO = {
  title: 'VetCare',
  subtitle: 'Guía completa del sistema de gestión veterinaria',
  description:
    'VetCare es una plataforma integral para clínicas veterinarias que combina gestión operativa, historia clínica electrónica con copiloto IA, portal de autoservicio para dueños y telemedicina. Esta guía está organizada por audiencia: primero el personal clínico, luego los dueños de mascotas, y finalmente los administradores/IT.',
  stats: [
    { label: 'Módulos', value: '8' },
    { label: 'Copiloto IA', value: '6 funciones' },
    { label: 'Vistas', value: 'Staff + Cliente' },
    { label: 'Datos demo', value: '10 mascotas' },
  ],
}

export const GUIDE_CHAPTERS: GuideChapter[] = [
  // =========================================================================
  // CAPÍTULO 1 — PERSONAL CLÍNICO
  // =========================================================================
  {
    id: 'staff',
    title: 'Para personal clínico',
    description:
      'Módulos que veterinarios, recepcionistas y peluqueros usan a diario. Accesible desde el sidebar de la vista "Personal clínica".',
    audience: 'staff',
    sections: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        subtitle: 'Pantalla de inicio con KPIs, alertas y gráficos',
        audience: 'staff',
        icon: '📊',
        blocks: [
          {
            type: 'paragraph',
            text: 'El Dashboard es la pantalla de aterrizaje del panel staff. Ofrece en un solo vistazo el estado operativo de la clínica: cuántas citas hay hoy, ingresos del mes, alertas críticas (stock bajo, medicamentos por vencer, facturas vencidas, pacientes a seguimiento) y la actividad del equipo. Las cuatro tarjetas superiores (Pacientes, Citas hoy, Ingresos, Clientes) son clicables y llevan al módulo correspondiente.',
          },
          {
            type: 'list',
            items: [
              'KPIs clicables que navegan al módulo correspondiente',
              'Lista de la agenda de hoy con hora, mascota, dueño y veterinario',
              'Panel de alertas: stock bajo, vencimientos, facturas pendientes/vencidas, pacientes críticos',
              'Gráfico de evolución de ingresos (últimos 6 meses, AreaChart con Recharts)',
              'Gráfico de distribución de pacientes por especie (PieChart)',
              'Gráfico de citas por día de la semana (BarChart)',
              'Barras de actividad por veterinario (citas confirmadas hoy)',
            ],
          },
          {
            type: 'callout',
            variant: 'tip',
            text: 'Las alertas son contextuales: solo aparecen si hay algo que requiera atención. Si un día no hay stock bajo ni facturas vencidas, el panel de alertas está vacío.',
          },
          {
            type: 'paragraph',
            text: 'Los datos del Dashboard se sirven desde el endpoint GET /api/vet/dashboard, que agrega en una sola llamada todos los KPIs, alertas y series para los gráficos. La cache de React Query refresca cada 30 segundos por defecto.',
          },
        ],
      },
      {
        id: 'patients',
        title: 'Pacientes (mascotas)',
        subtitle: 'Fichas con foto, vacunas, alergias e historial',
        audience: 'staff',
        icon: '🐶',
        blocks: [
          {
            type: 'paragraph',
            text: 'El módulo Pacientes muestra todas las mascotas registradas en la clínica. Cada tarjeta muestra foto, nombre, raza, edad calculada, dueño y peso. Arriba hay buscador por nombre/raza y filtros por especie (Perro, Gato, Conejo, Ave) y por estado (Sano, En tratamiento, Crítico, En observación). Al pulsar una tarjeta se abre la ficha completa en un modal.',
          },
          {
            type: 'steps',
            steps: [
              { title: 'Buscar', description: 'Escribe en el buscador para filtrar por nombre o raza.' },
              { title: 'Filtrar', description: 'Usa los botones superiores para acotar por especie o estado clínico.' },
              { title: 'Abrir ficha', description: 'Pulsa cualquier tarjeta para ver detalle completo: stats rápidas, dueño, alergias, condiciones crónicas, cartilla de vacunación con días para vencimiento, e historial clínico reciente.' },
              { title: 'Iniciar consulta', description: 'Desde la ficha del paciente no se inicia consulta directamente — para ello ve al módulo "Historia Clínica" en el sidebar.' },
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            text: 'El campo "Microchip" es opcional pero muy recomendable para cumplimiento legal. Si la mascota no tiene chip, se muestra "Sin chip" en la ficha.',
          },
          {
            type: 'callout',
            variant: 'tip',
            text: 'Las vacunas próximas a vencer (≤30 días) se resaltan en ámbar; las vencidas, en rojo. Esto permite al recepcionista ofrecer refuerzos en la misma llamada.',
          },
        ],
      },
      {
        id: 'clients',
        title: 'Clientes (dueños)',
        subtitle: 'Base de datos de dueños con mascotas y facturación',
        audience: 'staff',
        icon: '👥',
        blocks: [
          {
            type: 'paragraph',
            text: 'El módulo Clientes lista los dueños de mascotas. Cada tarjeta muestra avatar con iniciales, teléfono, email, fecha de alta, número de mascotas asociadas, puntos de fidelización y total gastado en facturas pagadas. Al pulsar una tarjeta se abre el detalle con contacto completo, mascotas asociadas, historial de facturas y nivel de fidelización.',
          },
          {
            type: 'list',
            items: [
              'Buscador por nombre, email o teléfono',
              'Tarjetas compactas con KPIs rápidos por cliente',
              'Detalle con todas las mascotas del dueño (foto + raza + especie)',
              'Tabla de facturas del cliente con estado (Pagada / Pendiente / Vencida)',
              'Programa de fidelización: a partir de 200 puntos = nivel Plata (10% dto), 500 puntos = Premium (15% dto)',
            ],
          },
          {
            type: 'callout',
            variant: 'tip',
            text: 'Los puntos de fidelización se acumulan automáticamente con cada factura pagada. Los clientes con más de 300 puntos tienen un icono de estrella en su tarjeta.',
          },
        ],
      },
      {
        id: 'appointments',
        title: 'Agenda',
        subtitle: 'Calendario arrastrable con vista día y semana',
        audience: 'staff',
        icon: '📅',
        blocks: [
          {
            type: 'paragraph',
            text: 'La Agenda ofrece vista diaria o semanal con grid de horas (8:00 a 20:00) y columnas por día. Las citas se muestran como tarjetas coloreadas según el tipo (Consulta, Vacunación, Cirugía, Control, Urgencia, Peluquería). El feature clave es el drag-and-drop: arrastra cualquier cita a otra hora o día para reprogramarla, con actualización optimista en la BD.',
          },
          {
            type: 'steps',
            steps: [
              { title: 'Cambiar vista', description: 'Botones "Día" / "Semana" arriba a la izquierda.' },
              { title: 'Navegar', description: 'Flechas izquierda/derecha para moverte entre días o semanas. Botón "Hoy" para volver al presente.' },
              { title: 'Reprogramar', description: 'Arrastra una cita a otro slot. La UI se actualiza inmediatamente (optimistic update) y se hace PATCH /api/vet/appointments en segundo plano.' },
              { title: 'Confirmar', description: 'Si el cambio falla, la cita vuelve a su posición original y se muestra error.' },
            ],
          },
          {
            type: 'callout',
            variant: 'tip',
            text: 'El día actual se resalta con un fondo verde claro. Al arrastrar sobre un slot, este se ilumina con un anillo verde para indicar dónde caerá la cita.',
          },
          {
            type: 'paragraph',
            text: 'Tecnológicamente, el drag-and-drop usa @dnd-kit/core con PointerSensor (activationConstraint distance: 8px para no interferir con clicks). El estado óptimista se gestiona vía TanStack Query: onCancel invalidate, onError rollback al snapshot previo.',
          },
        ],
      },
      {
        id: 'emr',
        title: 'Historia Clínica (EMR) con copiloto IA',
        subtitle: 'Editor de consultas con dictado, diagnósticos y dosis IA',
        audience: 'staff',
        icon: '🩺',
        blocks: [
          {
            type: 'paragraph',
            text: 'El módulo EMR es el corazón del producto. Al abrir una mascota se crea un borrador de consulta (status "borrador") y se activa el autosave cada 1.5 segundos. La pantalla tiene: banner siempre visible con alergias y condiciones crónicas del paciente, captura rápida de constantes (peso, temperatura, FC, FR, BCS), 5 botones de acciones IA, grid SOAP con 4 cards editables (S/O/A/P), sección de diagnósticos diferenciales con accept/reject, y sección de tratamientos prescritos.',
          },
          {
            type: 'paragraph',
            text: 'El copiloto IA está integrado en el flujo de consulta, no es una sección aparte. Cada acción IA tiene su endpoint dedicado que llama al z-ai-web-dev-sdk (LLM + ASR) con prompts veterinarios especializados.',
          },
          {
            type: 'steps',
            steps: [
              {
                title: 'Dictar consulta',
                description: 'Pulsa "Iniciar dictado" → el navegador graba tu voz → al detener, se transcribe con ASR y la IA estructura automáticamente en las 4 secciones SOAP considerando especie, raza, alergias y motivo declarado.',
              },
              {
                title: 'Generar anamnesis',
                description: 'Pulsa "Anamnesis IA" → la IA genera 5-7 preguntas específicas para el paciente (considera predisposiciones raciales: ej. bulldog francés → preguntas respiratorias).',
              },
              {
                title: 'Sugerir diagnósticos',
                description: 'Tras completar al menos el Subjetivo, pulsa "Sugerir diagnósticos" → la IA devuelve top-3 diferenciales con score de confianza (0-100%), razonamiento clínico y pruebas recomendadas. Acepta/rechaza cada uno y marca el principal.',
              },
              {
                title: 'Calcular dosis',
                description: 'Ingresa fármaco + mg/kg → el sistema calcula automáticamente los mg totales (peso del paciente × dosis por kg). Añade vía, frecuencia y duración.',
              },
              {
                title: 'Estructurar SOAP',
                description: 'Si escribiste texto libre, pulsa "Estructurar SOAP" → la IA lo reparte en las 4 secciones correctas.',
              },
              {
                title: 'Finalizar',
                description: 'Pulsa "Finalizar consulta" → se guardan SOAP + diagnósticos aceptados + tratamientos en la BD. El registro queda permanente en el historial del paciente.',
              },
            ],
          },
          {
            type: 'callout',
            variant: 'ai',
            text: 'Detección de patrones: si el paciente tiene 2+ consultas previas, al abrir una nueva consulta la IA analiza el historial automáticamente y muestra alertas (ej: "Rocky ha visitado 4 veces en 6 meses por problemas respiratorios → posible síndrome braquicefálico").',
          },
          {
            type: 'callout',
            variant: 'warning',
            text: 'Las sugerencias de la IA son siempre eso: sugerencias. El veterinario es el responsable clínico. Los diagnósticos IA aparecen con borde discontinuo hasta que se aceptan explícitamente. La IA nunca prescribe fármacos por su cuenta — solo estructuración y sugerencias.',
          },
          {
            type: 'paragraph',
            text: 'Cada consulta queda persistida en SQLite con sus metadatos: ¿fue generada por dictado IA? (aiGenerated), transcripción original del audio (audioTranscript, para auditoría), y todos los signos vitales capturados. El historial completo del paciente es consultable.',
          },
        ],
      },
      {
        id: 'inventory',
        title: 'Inventario',
        subtitle: 'Control de stock, lotes y vencimientos',
        audience: 'staff',
        icon: '📦',
        blocks: [
          {
            type: 'paragraph',
            text: 'El inventario gestiona medicamentos, alimentos, insumos médicos, accesorios y productos de higiene. Cada ítem tiene: stock actual, stock mínimo, lote, fecha de vencimiento, proveedor, precio unitario y valor total en stock. La tabla muestra barras de progreso visuales del nivel de stock y badges de estado automático.',
          },
          {
            type: 'list',
            items: [
              '4 KPIs: productos totales, valor del stock, stock bajo, por vencer (90 días)',
              'Alerta destacada si hay productos vencidos (acción inmediata)',
              'Buscador por nombre o proveedor',
              'Filtros por categoría + botón "Solo stock bajo" para ver solo lo crítico',
              'Tabla con barras de progreso por producto y badge de estado (OK / Próximo / Reponer / Vencido)',
              'Días para vencer calculados automáticamente (mostrados como "30d" o "Vencido")',
            ],
          },
          {
            type: 'callout',
            variant: 'tip',
            text: 'Pulsa la tarjeta "Stock bajo" en los KPIs para filtrar instantáneamente solo los productos que requieren reposición.',
          },
        ],
      },
      {
        id: 'billing',
        title: 'Facturación',
        subtitle: 'Facturas, estados y resumen financiero',
        audience: 'staff',
        icon: '🧾',
        blocks: [
          {
            type: 'paragraph',
            text: 'El módulo de Facturación muestra 4 KPIs financieros (ingresos totales, cobrado, pendiente, vencido), buscador por número/cliente/mascota, filtros por estado, y tabla con todas las facturas. Al pulsar una factura se abre el detalle con items desglosados, total destacado, método de pago y acciones.',
          },
          {
            type: 'list',
            items: [
              'Estados: Pagada (verde), Pendiente (ámbar), Vencida (rojo)',
              'Métodos de pago: Tarjeta, Efectivo, Bizum (con iconos)',
              'Detalle con items desglosados (descripción + cantidad + precio unitario + subtotal)',
              'Acción "Marcar como pagada" para facturas pendientes/vencidas',
              'Botón "Descargar PDF" (en roadmap: generación real pendiente)',
            ],
          },
        ],
      },
      {
        id: 'staff-team',
        title: 'Personal',
        subtitle: 'Equipo de la clínica con roles y turnos',
        audience: 'staff',
        icon: '👤',
        blocks: [
          {
            type: 'paragraph',
            text: 'El módulo Personal lista los empleados con tarjetas que incluyen: avatar, rol, especialidad, contacto, turno, citas atendidas hoy y rating de valoración. Los filtros permiten ver solo un rol específico (Veterinario, Recepción, Peluquería, Administrador, Auxiliar).',
          },
          {
            type: 'list',
            items: [
              '4 KPIs: equipo activo, citas hoy, rating medio, número de especialidades cubiertas',
              'Tarjetas con badges de rol (color-coded) y turno (Mañana/Tarde/Completo)',
              'Indicador de inactivo para empleados de baja',
              'Rating medio calculado automáticamente',
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // CAPÍTULO 2 — DUEÑOS DE MASCOTAS
  // =========================================================================
  {
    id: 'owner',
    title: 'Para dueños de mascotas',
    description:
      'Portal del cliente: acceso dedicado para que los dueños vean cartillas, pidan turnos y hagan videollamadas sin llamar a la clínica.',
    audience: 'owner',
    sections: [
      {
        id: 'portal-login',
        title: 'Acceso al portal del cliente',
        subtitle: 'Login con email + vista personalizada',
        audience: 'owner',
        icon: '🔐',
        blocks: [
          {
            type: 'paragraph',
            text: 'Desde el sidebar de la vista staff, en la parte inferior, hay un toggle "Personal clínica / Portal cliente". Al pulsar "Portal cliente" se accede a la pantalla de login. En la demo, cualquier email válido inicia sesión (en producción: auth real con NextAuth). Ejemplo: maria.gonzalez@email.com',
          },
          {
            type: 'callout',
            variant: 'tip',
            text: 'El switcher entre vistas está integrado en el sidebar (modo staff) y en la cabecera (modo cliente). Nunca flota sobre el contenido, así que no estorba al hacer scroll.',
          },
        ],
      },
      {
        id: 'portal-dashboard',
        title: 'Dashboard del dueño',
        subtitle: 'Resumen personalizado con tus mascotas y citas',
        audience: 'owner',
        icon: '🏠',
        blocks: [
          {
            type: 'paragraph',
            text: 'Tras iniciar sesión, el dueño ve un banner de bienvenida personalizado con el número de mascotas y citas próximas. Debajo hay 4 KPIs: mascotas, próximas citas, vacunas totales, y estado de telemedicina. Luego las tarjetas de cada mascota con foto, stats rápidas, vacunas próximas a vencer (si las hay), y botones para videollamada y pedir turno. Al final, la lista de próximas citas con fecha, mascota, veterinario y estado.',
          },
          {
            type: 'callout',
            variant: 'tip',
            text: 'Si una vacuna está próxima a vencer (60 días), se resalta en ámbar con los días exactos. Si está vencida, en rojo. Esto permite al dueño pedir turno de refuerzo a tiempo.',
          },
        ],
      },
      {
        id: 'telemedicine',
        title: 'Telemedicina con videollamada',
        subtitle: 'Consulta virtual + resumen IA automático',
        audience: 'owner',
        icon: '📹',
        blocks: [
          {
            type: 'paragraph',
            text: 'Al pulsar "Videollamada" en la tarjeta de cualquier mascota, se abre el modal de telemedicina. La UI simula una videollamada real: video principal con avatar del veterinario, picture-in-picture con la foto de la mascota, timer de duración, controles de mic/cámara/chat/colgar, y un chat lateral donde el veterinario responde automáticamente.',
          },
          {
            type: 'steps',
            steps: [
              { title: 'Conectar', description: 'Se muestra "Conectando con el veterinario..." durante ~1 segundo.' },
              { title: 'Hablar', description: 'El veterinario se une al chat, te saluda por nombre de la mascota y te hace preguntas iniciales.' },
              { title: 'Chatear', description: 'Puedes escribir en el chat lateral. El veterinario responde automáticamente a los 2.5 segundos.' },
              { title: 'Controles', description: 'Silencia/enciende mic, apaga/enciende cámara, abre/cierra chat, o cuelga.' },
              { title: 'Colgar', description: 'Al pulsar colgar, se llama a la IA que genera automáticamente un resumen estructurado de la teleconsulta.' },
              { title: 'Resumen IA', description: 'Aparece un modal con: resumen de la consulta, recomendaciones accionables para el dueño, recetas digitales (solo si el vet las mencionó), y plan de seguimiento.' },
            ],
          },
          {
            type: 'callout',
            variant: 'ai',
            text: 'El resumen IA de la telemedicina NO inventa fármacos: solo incluye recetas si el veterinario las mencionó explícitamente en el chat. Siempre lleva el badge "Generado por IA · revisar antes de enviar" para mantener human-in-the-loop.',
          },
        ],
      },
    ],
  },

  // =========================================================================
  // CAPÍTULO 3 — ADMINISTRADORES / IT
  // =========================================================================
  {
    id: 'admin',
    title: 'Para administradores / IT',
    description:
      'Información técnica para quienes gestionan la infraestructura, la base de datos y los endpoints disponibles.',
    audience: 'admin',
    sections: [
      {
        id: 'architecture',
        title: 'Arquitectura técnica',
        subtitle: 'Stack y decisiones de diseño',
        audience: 'admin',
        icon: '⚙️',
        blocks: [
          {
            type: 'paragraph',
            text: 'VetCare es una aplicación Next.js 16 con App Router, TypeScript estricto, Tailwind CSS 4 y shadcn/ui. La persistencia usa Prisma ORM sobre SQLite (file-based). El estado servidor se gestiona con TanStack Query (staleTime 30s, refetchOnWindowFocus desactivado). Los gráficos usan Recharts. El drag-and-drop de la agenda usa @dnd-kit/core. El copiloto IA consume z-ai-web-dev-sdk (LLM + ASR) exclusivamente en backend.',
          },
          {
            type: 'list',
            items: [
              'Framework: Next.js 16 (Turbopack) + React 19 + App Router',
              'Tipado: TypeScript 5 estricto, ES modules',
              'UI: Tailwind CSS 4 + shadcn/ui (estilo New York) + Lucide icons',
              'BD: Prisma + SQLite (file:file:/home/z/my-project/db/custom.db)',
              'Server state: @tanstack/react-query con optimistic updates',
              'Gráficos: recharts 3 (AreaChart, BarChart, PieChart)',
              'Drag-and-drop: @dnd-kit/core + @dnd-kit/sortable',
              'IA: z-ai-web-dev-sdk (LLM + ASR), backend-only',
              'Toasts: sonner',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            text: 'z-ai-web-dev-sdk es estrictamente backend-only. Nunca expongas la API key en código cliente. Todas las llamadas IA van vía API routes de Next.js.',
          },
        ],
      },
      {
        id: 'schema',
        title: 'Esquema de base de datos',
        subtitle: 'Modelos Prisma y relaciones',
        audience: 'admin',
        icon: '🗄️',
        blocks: [
          {
            type: 'paragraph',
            text: 'El schema Prisma tiene 11 modelos: User (sistema), Client, Pet, Vaccine, Vet, Appointment, InventoryItem, Invoice, InvoiceItem, Consultation, Diagnosis, Treatment. Las relaciones están normalizadas: un Cliente tiene muchas Mascotas; una Mascota tiene muchas Vacunas, Citas, Facturas y Consultas; una Consulta tiene muchos Diagnósticos y Tratamientos.',
          },
          {
            type: 'list',
            items: [
              'Client → Pet (1:N) → Vaccine (1:N)',
              'Client → Appointment (1:N), Invoice (1:N)',
              'Pet → Consultation (1:N) → Diagnosis (1:N), Treatment (1:N)',
              'Vet → Appointment (1:N), Consultation (1:N)',
              'Invoice → InvoiceItem (1:N)',
              'InventoryItem (sin relaciones, standalone)',
            ],
          },
          {
            type: 'callout',
            variant: 'tip',
            text: 'Los campos allergies y chronicConditions del Pet se guardan como JSON string (SQLite no soporta arrays nativos). El endpoint API los parsea a array antes de devolverlos al frontend.',
          },
        ],
      },
      {
        id: 'endpoints',
        title: 'API endpoints disponibles',
        subtitle: 'REST routes bajo /api/vet/* y /api/ai/*',
        audience: 'admin',
        icon: '🔌',
        blocks: [
          {
            type: 'paragraph',
            text: 'La API está dividida en dos familias: rutas CRUD para datos de la clínica (/api/vet/*) y rutas de inferencia IA (/api/ai/*). Todas devuelven JSON.',
          },
          {
            type: 'code',
            language: 'http',
            text: `# CRUD veterinaria
GET    /api/vet/clients                # Listar clientes (con pets e invoices)
POST   /api/vet/clients                # Crear cliente
GET    /api/vet/clients/[id]           # Detalle cliente
DELETE /api/vet/clients/[id]          # Borrar cliente

GET    /api/vet/pets                   # Listar mascotas (con vacunas y dueño)
GET    /api/vet/vets                   # Listar personal
GET    /api/vet/inventory              # Listar inventario

GET    /api/vet/appointments?date=YYYY-MM-DD
GET    /api/vet/appointments?from=...&to=...
POST   /api/vet/appointments           # Crear cita
PATCH  /api/vet/appointments           # Actualizar (drag-and-drop)

GET    /api/vet/consultations?petId=p1
POST   /api/vet/consultations          # Crear/actualizar con diagnoses+treatments
PATCH  /api/vet/consultations          # Autosave
GET    /api/vet/consultations/[id]
DELETE /api/vet/consultations/[id]

GET    /api/vet/invoices               # Listar facturas (con items, cliente, mascota)
GET    /api/vet/dashboard               # KPIs + alertas + series para gráficos

# IA (z-ai-web-dev-sdk backend)
POST   /api/ai/transcribe               # audio_base64 → transcript + SOAP estructurado
POST   /api/ai/soap-draft               # texto libre → JSON SOAP
POST   /api/ai/anamnesis                # pet + reason → 5-7 preguntas adaptativas
POST   /api/ai/diagnosis                # pet + SOAP → top-3 diferenciales con confidence
POST   /api/ai/pattern-detection        # pet + historial → alertas de recurrencia
POST   /api/ai/telemedicine-summary     # chat + duration → resumen + recetas + seguimiento`,
          },
        ],
      },
      {
        id: 'maintenance',
        title: 'Mantenimiento y troubleshooting',
        subtitle: 'Comandos útiles para mantener la app',
        audience: 'admin',
        icon: '🛠️',
        blocks: [
          {
            type: 'paragraph',
            text: 'Las tareas más comunes son: reinicializar la BD con datos demo, regenerar el cliente Prisma tras cambios de schema, y limpiar la caché de Turbopack si algo no se ve correctamente.',
          },
          {
            type: 'code',
            language: 'bash',
            text: `# Reinicializar BD con datos demo
bun run scripts/seed-vet.ts

# Tras modificar prisma/schema.prisma
bunx prisma generate
bun run db:push

# Limpiar caché de Turbopack (si hay errores de "Module not found")
rm -rf .next/cache

# Reiniciar dev server (si no responde)
ps aux | grep next-server
kill <PID>
cd /home/z/my-project && nohup bun run dev > dev.log 2>&1 & disown

# Verificar lint
bun run lint`,
          },
          {
            type: 'callout',
            variant: 'warning',
            text: 'Tras modificar el schema Prisma, el cliente en memoria puede quedar stale. El archivo db.ts usa una clave de caché versionada (prismaVet3 actualmente). Si añades modelos nuevos, incrementa el sufijo para forzar la creación de un cliente nuevo.',
          },
          {
            type: 'callout',
            variant: 'info',
            text: 'El dev server se arranca automáticamente al iniciar el proyecto. Si necesitas reiniciarlo manualmente (ej. tras matar procesos), usa: `nohup bun run dev > dev.log 2>&1 & disown`.',
          },
        ],
      },
    ],
  },
]

// Helper para contar totales
export function getGuideStats() {
  const totalSections = GUIDE_CHAPTERS.reduce((sum, c) => sum + c.sections.length, 0)
  const totalBlocks = GUIDE_CHAPTERS.reduce(
    (sum, c) => sum + c.sections.reduce((s, sec) => s + sec.blocks.length, 0),
    0
  )
  return {
    chapters: GUIDE_CHAPTERS.length,
    sections: totalSections,
    blocks: totalBlocks,
  }
}
