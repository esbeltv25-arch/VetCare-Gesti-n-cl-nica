#!/usr/bin/env python3
"""
Generador del PDF "Guía completa VetCare"
Uso: python3 /home/z/my-project/scripts/build-guide-pdf.py
Salida: /home/z/my-project/public/guia-vetcare.pdf
"""
import sys
import os
from pathlib import Path

# Asegurar reportlab disponible
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import mm, cm
    from reportlab.lib.colors import HexColor, white, black
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, PageBreak,
        Table, TableStyle, KeepTogether, Image, Flowable, ListFlowable, ListItem
    )
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.pdfgen import canvas
except ImportError:
    print("ERROR: reportlab no instalado. Ejecuta: pip install reportlab", file=sys.stderr)
    sys.exit(1)

# ============================================================================
# FUENTES (Noto Sans/Serif SC para soporte universal)
# ============================================================================

FONT_REGULAR = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
FONT_ITALIC = "Helvetica-Oblique"
FONT_MONO = "Courier"

def register_fonts():
    global FONT_REGULAR, FONT_BOLD, FONT_ITALIC
    candidates_regular = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    candidates_bold = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    candidates_italic = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf",
    ]
    for path in candidates_regular:
        if Path(path).exists():
            pdfmetrics.registerFont(TTFont("BodyFont", path))
            FONT_REGULAR = "BodyFont"
            break
    for path in candidates_bold:
        if Path(path).exists():
            pdfmetrics.registerFont(TTFont("BodyBold", path))
            FONT_BOLD = "BodyBold"
            break
    for path in candidates_italic:
        if Path(path).exists():
            pdfmetrics.registerFont(TTFont("BodyItalic", path))
            FONT_ITALIC = "BodyItalic"
            break

register_fonts()

# ============================================================================
# PALETA DE COLORES
# ============================================================================
EMERALD = HexColor("#10b981")
EMERALD_DARK = HexColor("#047857")
VIOLET = HexColor("#7c3aed")
VIOLET_LIGHT = HexColor("#f3e8ff")
AMBER = HexColor("#f59e0b")
AMBER_LIGHT = HexColor("#fef3c7")
SKY = HexColor("#0ea5e9")
SKY_LIGHT = HexColor("#e0f2fe")
ROSE = HexColor("#e11d48")
ROSE_LIGHT = HexColor("#ffe4e6")
SLATE_900 = HexColor("#0f172a")
SLATE_700 = HexColor("#334155")
SLATE_500 = HexColor("#64748b")
SLATE_200 = HexColor("#e2e8f0")
SLATE_100 = HexColor("#f1f5f9")
SLATE_50 = HexColor("#f8fafc")

# ============================================================================
# CONTENIDO DE LA GUÍA (espejo de src/lib/guide-content.ts)
# ============================================================================

GUIDE_INTRO = {
    "title": "VetCare",
    "subtitle": "Guía completa del sistema de gestión veterinaria",
    "description": (
        "VetCare es una plataforma integral para clínicas veterinarias que combina "
        "gestión operativa, historia clínica electrónica con copiloto IA, portal "
        "de autoservicio para dueños y telemedicina. Esta guía está organizada por "
        "audiencia: primero el personal clínico, luego los dueños de mascotas, y "
        "finalmente los administradores/IT."
    ),
    "stats": [
        ("Módulos", "8"),
        ("Copiloto IA", "6 funciones"),
        ("Vistas", "Staff + Cliente"),
        ("Datos demo", "10 mascotas"),
    ],
}

GUIDE_CHAPTERS = [
    # ========================================================================
    # CAPÍTULO 1 - PERSONAL CLÍNICO
    # ========================================================================
    {
        "id": "staff",
        "title": "Para personal clínico",
        "description": (
            "Módulos que veterinarios, recepcionistas y peluqueros usan a diario. "
            "Accesible desde el sidebar de la vista \"Personal clínica\"."
        ),
        "audience": "staff",
        "sections": [
            {
                "id": "dashboard",
                "title": "Dashboard",
                "subtitle": "Pantalla de inicio con KPIs, alertas y gráficos",
                "blocks": [
                    {"type": "paragraph", "text": (
                        "El Dashboard es la pantalla de aterrizaje del panel staff. Ofrece "
                        "en un solo vistazo el estado operativo de la clínica: cuántas citas "
                        "hay hoy, ingresos del mes, alertas críticas (stock bajo, medicamentos "
                        "por vencer, facturas vencidas, pacientes a seguimiento) y la actividad "
                        "del equipo. Las cuatro tarjetas superiores (Pacientes, Citas hoy, "
                        "Ingresos, Clientes) son clicables y llevan al módulo correspondiente."
                    )},
                    {"type": "list", "items": [
                        "KPIs clicables que navegan al módulo correspondiente",
                        "Lista de la agenda de hoy con hora, mascota, dueño y veterinario",
                        "Panel de alertas: stock bajo, vencimientos, facturas pendientes/vencidas, pacientes críticos",
                        "Gráfico de evolución de ingresos (últimos 6 meses, AreaChart con Recharts)",
                        "Gráfico de distribución de pacientes por especie (PieChart)",
                        "Gráfico de citas por día de la semana (BarChart)",
                        "Barras de actividad por veterinario (citas confirmadas hoy)",
                    ]},
                    {"type": "callout", "variant": "tip", "text": (
                        "Las alertas son contextuales: solo aparecen si hay algo que requiera "
                        "atención. Si un día no hay stock bajo ni facturas vencidas, el panel "
                        "de alertas está vacío."
                    )},
                    {"type": "paragraph", "text": (
                        "Los datos del Dashboard se sirven desde el endpoint GET /api/vet/dashboard, "
                        "que agrega en una sola llamada todos los KPIs, alertas y series para los "
                        "gráficos. La cache de React Query refresca cada 30 segundos por defecto."
                    )},
                ],
            },
            {
                "id": "patients",
                "title": "Pacientes (mascotas)",
                "subtitle": "Fichas con foto, vacunas, alergias e historial",
                "blocks": [
                    {"type": "paragraph", "text": (
                        "El módulo Pacientes muestra todas las mascotas registradas en la clínica. "
                        "Cada tarjeta muestra foto, nombre, raza, edad calculada, dueño y peso. "
                        "Arriba hay buscador por nombre/raza y filtros por especie (Perro, Gato, "
                        "Conejo, Ave) y por estado (Sano, En tratamiento, Crítico, En observación). "
                        "Al pulsar una tarjeta se abre la ficha completa en un modal."
                    )},
                    {"type": "steps", "steps": [
                        {"title": "Buscar", "description": "Escribe en el buscador para filtrar por nombre o raza."},
                        {"title": "Filtrar", "description": "Usa los botones superiores para acotar por especie o estado clínico."},
                        {"title": "Abrir ficha", "description": "Pulsa cualquier tarjeta para ver detalle completo: stats rápidas, dueño, alergias, condiciones crónicas, cartilla de vacunación con días para vencimiento, e historial clínico reciente."},
                        {"title": "Iniciar consulta", "description": "Desde la ficha del paciente no se inicia consulta directamente — para ello ve al módulo \"Historia Clínica\" en el sidebar."},
                    ]},
                    {"type": "callout", "variant": "warning", "text": (
                        "El campo \"Microchip\" es opcional pero muy recomendable para cumplimiento legal. "
                        "Si la mascota no tiene chip, se muestra \"Sin chip\" en la ficha."
                    )},
                    {"type": "callout", "variant": "tip", "text": (
                        "Las vacunas próximas a vencer (30 días o menos) se resaltan en ámbar; las "
                        "vencidas, en rojo. Esto permite al recepcionista ofrecer refuerzos en la misma llamada."
                    )},
                ],
            },
            {
                "id": "clients",
                "title": "Clientes (dueños)",
                "subtitle": "Base de datos de dueños con mascotas y facturación",
                "blocks": [
                    {"type": "paragraph", "text": (
                        "El módulo Clientes lista los dueños de mascotas. Cada tarjeta muestra "
                        "avatar con iniciales, teléfono, email, fecha de alta, número de mascotas "
                        "asociadas, puntos de fidelización y total gastado en facturas pagadas. Al "
                        "pulsar una tarjeta se abre el detalle con contacto completo, mascotas "
                        "asociadas, historial de facturas y nivel de fidelización."
                    )},
                    {"type": "list", "items": [
                        "Buscador por nombre, email o teléfono",
                        "Tarjetas compactas con KPIs rápidos por cliente",
                        "Detalle con todas las mascotas del dueño (foto + raza + especie)",
                        "Tabla de facturas del cliente con estado (Pagada / Pendiente / Vencida)",
                        "Programa de fidelización: a partir de 200 puntos = nivel Plata (10% dto), 500 puntos = Premium (15% dto)",
                    ]},
                    {"type": "callout", "variant": "tip", "text": (
                        "Los puntos de fidelización se acumulan automáticamente con cada factura "
                        "pagada. Los clientes con más de 300 puntos tienen un icono de estrella "
                        "en su tarjeta."
                    )},
                ],
            },
            {
                "id": "appointments",
                "title": "Agenda",
                "subtitle": "Calendario arrastrable con vista día y semana",
                "blocks": [
                    {"type": "paragraph", "text": (
                        "La Agenda ofrece vista diaria o semanal con grid de horas (8:00 a 20:00) "
                        "y columnas por día. Las citas se muestran como tarjetas coloreadas según "
                        "el tipo (Consulta, Vacunación, Cirugía, Control, Urgencia, Peluquería). "
                        "El feature clave es el drag-and-drop: arrastra cualquier cita a otra hora "
                        "o día para reprogramarla, con actualización optimista en la BD."
                    )},
                    {"type": "steps", "steps": [
                        {"title": "Cambiar vista", "description": "Botones \"Día\" / \"Semana\" arriba a la izquierda."},
                        {"title": "Navegar", "description": "Flechas izquierda/derecha para moverte entre días o semanas. Botón \"Hoy\" para volver al presente."},
                        {"title": "Reprogramar", "description": "Arrastra una cita a otro slot. La UI se actualiza inmediatamente (optimistic update) y se hace PATCH /api/vet/appointments en segundo plano."},
                        {"title": "Confirmar", "description": "Si el cambio falla, la cita vuelve a su posición original y se muestra error."},
                    ]},
                    {"type": "callout", "variant": "tip", "text": (
                        "El día actual se resalta con un fondo verde claro. Al arrastrar sobre un "
                        "slot, este se ilumina con un anillo verde para indicar dónde caerá la cita."
                    )},
                    {"type": "paragraph", "text": (
                        "Tecnológicamente, el drag-and-drop usa @dnd-kit/core con PointerSensor "
                        "(activationConstraint distance: 8px para no interferir con clicks). El "
                        "estado optimista se gestiona vía TanStack Query: onCancel invalidate, "
                        "onError rollback al snapshot previo."
                    )},
                ],
            },
            {
                "id": "emr",
                "title": "Historia Clínica (EMR) con copiloto IA",
                "subtitle": "Editor de consultas con dictado, diagnósticos y dosis IA",
                "blocks": [
                    {"type": "paragraph", "text": (
                        "El módulo EMR es el corazón del producto. Al abrir una mascota se crea "
                        "un borrador de consulta (status \"borrador\") y se activa el autosave "
                        "cada 1.5 segundos. La pantalla tiene: banner siempre visible con alergias "
                        "y condiciones crónicas del paciente, captura rápida de constantes (peso, "
                        "temperatura, FC, FR, BCS), 5 botones de acciones IA, grid SOAP con 4 cards "
                        "editables (S/O/A/P), sección de diagnósticos diferenciales con accept/reject, "
                        "y sección de tratamientos prescritos."
                    )},
                    {"type": "paragraph", "text": (
                        "El copiloto IA está integrado en el flujo de consulta, no es una sección "
                        "aparte. Cada acción IA tiene su endpoint dedicado que llama al "
                        "z-ai-web-dev-sdk (LLM + ASR) con prompts veterinarios especializados."
                    )},
                    {"type": "steps", "steps": [
                        {"title": "Dictar consulta", "description": "Pulsa \"Iniciar dictado\". El navegador graba tu voz. Al detener, se transcribe con ASR y la IA estructura automáticamente en las 4 secciones SOAP considerando especie, raza, alergias y motivo declarado."},
                        {"title": "Generar anamnesis", "description": "Pulsa \"Anamnesis IA\". La IA genera 5-7 preguntas específicas para el paciente (considera predisposiciones raciales: ej. bulldog francés lleva preguntas respiratorias)."},
                        {"title": "Sugerir diagnósticos", "description": "Tras completar al menos el Subjetivo, pulsa \"Sugerir diagnósticos\". La IA devuelve top-3 diferenciales con score de confianza (0-100%), razonamiento clínico y pruebas recomendadas. Acepta o rechaza cada uno y marca el principal."},
                        {"title": "Calcular dosis", "description": "Ingresa fármaco y mg/kg. El sistema calcula automáticamente los mg totales (peso del paciente multiplicado por dosis por kg). Añade vía, frecuencia y duración."},
                        {"title": "Estructurar SOAP", "description": "Si escribiste texto libre, pulsa \"Estructurar SOAP\". La IA lo reparte en las 4 secciones correctas."},
                        {"title": "Finalizar", "description": "Pulsa \"Finalizar consulta\". Se guardan SOAP, diagnósticos aceptados y tratamientos en la BD. El registro queda permanente en el historial del paciente."},
                    ]},
                    {"type": "callout", "variant": "ai", "text": (
                        "Detección de patrones: si el paciente tiene 2 o más consultas previas, "
                        "al abrir una nueva consulta la IA analiza el historial automáticamente y "
                        "muestra alertas. Ejemplo: \"Rocky ha visitado 4 veces en 6 meses por "
                        "problemas respiratorios, posible síndrome braquicefálico\"."
                    )},
                    {"type": "callout", "variant": "warning", "text": (
                        "Las sugerencias de la IA son siempre eso: sugerencias. El veterinario es "
                        "el responsable clínico. Los diagnósticos IA aparecen con borde discontinuo "
                        "hasta que se aceptan explícitamente. La IA nunca prescribe fármacos por "
                        "su cuenta, solo estructuración y sugerencias."
                    )},
                    {"type": "paragraph", "text": (
                        "Cada consulta queda persistida en SQLite con sus metadatos: si fue generada "
                        "por dictado IA (aiGenerated), transcripción original del audio "
                        "(audioTranscript, para auditoría), y todos los signos vitales capturados. "
                        "El historial completo del paciente es consultable."
                    )},
                ],
            },
            {
                "id": "inventory",
                "title": "Inventario",
                "subtitle": "Control de stock, lotes y vencimientos",
                "blocks": [
                    {"type": "paragraph", "text": (
                        "El inventario gestiona medicamentos, alimentos, insumos médicos, "
                        "accesorios y productos de higiene. Cada ítem tiene: stock actual, stock "
                        "mínimo, lote, fecha de vencimiento, proveedor, precio unitario y valor "
                        "total en stock. La tabla muestra barras de progreso visuales del nivel "
                        "de stock y badges de estado automático."
                    )},
                    {"type": "list", "items": [
                        "4 KPIs: productos totales, valor del stock, stock bajo, por vencer (90 días)",
                        "Alerta destacada si hay productos vencidos (acción inmediata)",
                        "Buscador por nombre o proveedor",
                        "Filtros por categoría y botón \"Solo stock bajo\" para ver solo lo crítico",
                        "Tabla con barras de progreso por producto y badge de estado (OK / Próximo / Reponer / Vencido)",
                        "Días para vencer calculados automáticamente (mostrados como \"30d\" o \"Vencido\")",
                    ]},
                    {"type": "callout", "variant": "tip", "text": (
                        "Pulsa la tarjeta \"Stock bajo\" en los KPIs para filtrar instantáneamente "
                        "solo los productos que requieren reposición."
                    )},
                ],
            },
            {
                "id": "billing",
                "title": "Facturación",
                "subtitle": "Facturas, estados y resumen financiero",
                "blocks": [
                    {"type": "paragraph", "text": (
                        "El módulo de Facturación muestra 4 KPIs financieros (ingresos totales, "
                        "cobrado, pendiente, vencido), buscador por número/cliente/mascota, filtros "
                        "por estado, y tabla con todas las facturas. Al pulsar una factura se abre "
                        "el detalle con items desglosados, total destacado, método de pago y acciones."
                    )},
                    {"type": "list", "items": [
                        "Estados: Pagada (verde), Pendiente (ámbar), Vencida (rojo)",
                        "Métodos de pago: Tarjeta, Efectivo, Bizum (con iconos)",
                        "Detalle con items desglosados (descripción + cantidad + precio unitario + subtotal)",
                        "Acción \"Marcar como pagada\" para facturas pendientes/vencidas",
                        "Botón \"Descargar PDF\" (en roadmap: generación real pendiente)",
                    ]},
                ],
            },
            {
                "id": "staff-team",
                "title": "Personal",
                "subtitle": "Equipo de la clínica con roles y turnos",
                "blocks": [
                    {"type": "paragraph", "text": (
                        "El módulo Personal lista los empleados con tarjetas que incluyen: avatar, "
                        "rol, especialidad, contacto, turno, citas atendidas hoy y rating de "
                        "valoración. Los filtros permiten ver solo un rol específico (Veterinario, "
                        "Recepción, Peluquería, Administrador, Auxiliar)."
                    )},
                    {"type": "list", "items": [
                        "4 KPIs: equipo activo, citas hoy, rating medio, número de especialidades cubiertas",
                        "Tarjetas con badges de rol (color-coded) y turno (Mañana/Tarde/Completo)",
                        "Indicador de inactivo para empleados de baja",
                        "Rating medio calculado automáticamente",
                    ]},
                ],
            },
        ],
    },
    # ========================================================================
    # CAPÍTULO 2 - DUEÑOS DE MASCOTAS
    # ========================================================================
    {
        "id": "owner",
        "title": "Para dueños de mascotas",
        "description": (
            "Portal del cliente: acceso dedicado para que los dueños vean cartillas, "
            "pidan turnos y hagan videollamadas sin llamar a la clínica."
        ),
        "audience": "owner",
        "sections": [
            {
                "id": "portal-login",
                "title": "Acceso al portal del cliente",
                "subtitle": "Login con email y vista personalizada",
                "blocks": [
                    {"type": "paragraph", "text": (
                        "Desde el sidebar de la vista staff, en la parte inferior, hay un toggle "
                        "\"Personal clínica / Portal cliente\". Al pulsar \"Portal cliente\" se "
                        "accede a la pantalla de login. En la demo, cualquier email válido inicia "
                        "sesión (en producción: auth real con NextAuth). Ejemplo: "
                        "maria.gonzalez@email.com"
                    )},
                    {"type": "callout", "variant": "tip", "text": (
                        "El switcher entre vistas está integrado en el sidebar (modo staff) y en "
                        "la cabecera (modo cliente). Nunca flota sobre el contenido, así que no "
                        "estorba al hacer scroll."
                    )},
                ],
            },
            {
                "id": "portal-dashboard",
                "title": "Dashboard del dueño",
                "subtitle": "Resumen personalizado con tus mascotas y citas",
                "blocks": [
                    {"type": "paragraph", "text": (
                        "Tras iniciar sesión, el dueño ve un banner de bienvenida personalizado "
                        "con el número de mascotas y citas próximas. Debajo hay 4 KPIs: mascotas, "
                        "próximas citas, vacunas totales, y estado de telemedicina. Luego las "
                        "tarjetas de cada mascota con foto, stats rápidas, vacunas próximas a "
                        "vencer (si las hay), y botones para videollamada y pedir turno. Al final, "
                        "la lista de próximas citas con fecha, mascota, veterinario y estado."
                    )},
                    {"type": "callout", "variant": "tip", "text": (
                        "Si una vacuna está próxima a vencer (60 días), se resalta en ámbar con "
                        "los días exactos. Si está vencida, en rojo. Esto permite al dueño pedir "
                        "turno de refuerzo a tiempo."
                    )},
                ],
            },
            {
                "id": "telemedicine",
                "title": "Telemedicina con videollamada",
                "subtitle": "Consulta virtual y resumen IA automático",
                "blocks": [
                    {"type": "paragraph", "text": (
                        "Al pulsar \"Videollamada\" en la tarjeta de cualquier mascota, se abre "
                        "el modal de telemedicina. La UI simula una videollamada real: video "
                        "principal con avatar del veterinario, picture-in-picture con la foto de "
                        "la mascota, timer de duración, controles de mic/cámara/chat/colgar, y un "
                        "chat lateral donde el veterinario responde automáticamente."
                    )},
                    {"type": "steps", "steps": [
                        {"title": "Conectar", "description": "Se muestra \"Conectando con el veterinario...\" durante aproximadamente 1 segundo."},
                        {"title": "Hablar", "description": "El veterinario se une al chat, te saluda por nombre de la mascota y te hace preguntas iniciales."},
                        {"title": "Chatear", "description": "Puedes escribir en el chat lateral. El veterinario responde automáticamente a los 2.5 segundos."},
                        {"title": "Controles", "description": "Silencia/enciende micrófono, apaga/enciende cámara, abre/cierra chat, o cuelga."},
                        {"title": "Colgar", "description": "Al pulsar colgar, se llama a la IA que genera automáticamente un resumen estructurado de la teleconsulta."},
                        {"title": "Resumen IA", "description": "Aparece un modal con: resumen de la consulta, recomendaciones accionables para el dueño, recetas digitales (solo si el vet las mencionó), y plan de seguimiento."},
                    ]},
                    {"type": "callout", "variant": "ai", "text": (
                        "El resumen IA de la telemedicina NO inventa fármacos: solo incluye recetas "
                        "si el veterinario las mencionó explícitamente en el chat. Siempre lleva "
                        "el badge \"Generado por IA, revisar antes de enviar\" para mantener "
                        "human-in-the-loop."
                    )},
                ],
            },
        ],
    },
    # ========================================================================
    # CAPÍTULO 3 - ADMINISTRADORES / IT
    # ========================================================================
    {
        "id": "admin",
        "title": "Para administradores / IT",
        "description": (
            "Información técnica para quienes gestionan la infraestructura, "
            "la base de datos y los endpoints disponibles."
        ),
        "audience": "admin",
        "sections": [
            {
                "id": "architecture",
                "title": "Arquitectura técnica",
                "subtitle": "Stack y decisiones de diseño",
                "blocks": [
                    {"type": "paragraph", "text": (
                        "VetCare es una aplicación Next.js 16 con App Router, TypeScript estricto, "
                        "Tailwind CSS 4 y shadcn/ui. La persistencia usa Prisma ORM sobre SQLite "
                        "(file-based). El estado servidor se gestiona con TanStack Query (staleTime "
                        "30s, refetchOnWindowFocus desactivado). Los gráficos usan Recharts. El "
                        "drag-and-drop de la agenda usa @dnd-kit/core. El copiloto IA consume "
                        "z-ai-web-dev-sdk (LLM + ASR) exclusivamente en backend."
                    )},
                    {"type": "list", "items": [
                        "Framework: Next.js 16 (Turbopack) + React 19 + App Router",
                        "Tipado: TypeScript 5 estricto, ES modules",
                        "UI: Tailwind CSS 4 + shadcn/ui (estilo New York) + Lucide icons",
                        "BD: Prisma + SQLite (file:file:/home/z/my-project/db/custom.db)",
                        "Server state: @tanstack/react-query con optimistic updates",
                        "Gráficos: recharts 3 (AreaChart, BarChart, PieChart)",
                        "Drag-and-drop: @dnd-kit/core + @dnd-kit/sortable",
                        "IA: z-ai-web-dev-sdk (LLM + ASR), backend-only",
                        "Toasts: sonner",
                    ]},
                    {"type": "callout", "variant": "warning", "text": (
                        "z-ai-web-dev-sdk es estrictamente backend-only. Nunca expongas la API "
                        "key en código cliente. Todas las llamadas IA van vía API routes de Next.js."
                    )},
                ],
            },
            {
                "id": "schema",
                "title": "Esquema de base de datos",
                "subtitle": "Modelos Prisma y relaciones",
                "blocks": [
                    {"type": "paragraph", "text": (
                        "El schema Prisma tiene 11 modelos: User (sistema), Client, Pet, Vaccine, "
                        "Vet, Appointment, InventoryItem, Invoice, InvoiceItem, Consultation, "
                        "Diagnosis, Treatment. Las relaciones están normalizadas: un Cliente tiene "
                        "muchas Mascotas; una Mascota tiene muchas Vacunas, Citas, Facturas y "
                        "Consultas; una Consulta tiene muchos Diagnósticos y Tratamientos."
                    )},
                    {"type": "list", "items": [
                        "Client → Pet (1:N) → Vaccine (1:N)",
                        "Client → Appointment (1:N), Invoice (1:N)",
                        "Pet → Consultation (1:N) → Diagnosis (1:N), Treatment (1:N)",
                        "Vet → Appointment (1:N), Consultation (1:N)",
                        "Invoice → InvoiceItem (1:N)",
                        "InventoryItem (sin relaciones, standalone)",
                    ]},
                    {"type": "callout", "variant": "tip", "text": (
                        "Los campos allergies y chronicConditions del Pet se guardan como JSON "
                        "string (SQLite no soporta arrays nativos). El endpoint API los parsea a "
                        "array antes de devolverlos al frontend."
                    )},
                ],
            },
            {
                "id": "endpoints",
                "title": "API endpoints disponibles",
                "subtitle": "REST routes bajo /api/vet/* y /api/ai/*",
                "blocks": [
                    {"type": "paragraph", "text": (
                        "La API está dividida en dos familias: rutas CRUD para datos de la clínica "
                        "(/api/vet/*) y rutas de inferencia IA (/api/ai/*). Todas devuelven JSON."
                    )},
                    {"type": "code", "language": "http", "text": """# CRUD veterinaria
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
GET    /api/vet/dashboard              # KPIs + alertas + series para gráficos

# IA (z-ai-web-dev-sdk backend)
POST   /api/ai/transcribe              # audio_base64 → transcript + SOAP estructurado
POST   /api/ai/soap-draft              # texto libre → JSON SOAP
POST   /api/ai/anamnesis               # pet + reason → 5-7 preguntas adaptativas
POST   /api/ai/diagnosis               # pet + SOAP → top-3 diferenciales con confidence
POST   /api/ai/pattern-detection       # pet + historial → alertas de recurrencia
POST   /api/ai/telemedicine-summary    # chat + duration → resumen + recetas + seguimiento"""},
                ],
            },
            {
                "id": "maintenance",
                "title": "Mantenimiento y troubleshooting",
                "subtitle": "Comandos útiles para mantener la app",
                "blocks": [
                    {"type": "paragraph", "text": (
                        "Las tareas más comunes son: reinicializar la BD con datos demo, regenerar "
                        "el cliente Prisma tras cambios de schema, y limpiar la caché de Turbopack "
                        "si algo no se ve correctamente."
                    )},
                    {"type": "code", "language": "bash", "text": """# Reinicializar BD con datos demo
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
bun run lint"""},
                    {"type": "callout", "variant": "warning", "text": (
                        "Tras modificar el schema Prisma, el cliente en memoria puede quedar stale. "
                        "El archivo db.ts usa una clave de caché versionada (prismaVet3 actualmente). "
                        "Si añades modelos nuevos, incrementa el sufijo para forzar la creación de "
                        "un cliente nuevo."
                    )},
                    {"type": "callout", "variant": "info", "text": (
                        "El dev server se arranca automáticamente al iniciar el proyecto. Si "
                        "necesitas reiniciarlo manualmente (ej. tras matar procesos), usa: "
                        "nohup bun run dev > dev.log 2>&1 & disown."
                    )},
                ],
            },
        ],
    },
]

# ============================================================================
# ESTILOS DE PÁRRAFO
# ============================================================================

def make_styles():
    base = getSampleStyleSheet()
    styles = {}

    styles["CoverTitle"] = ParagraphStyle(
        "CoverTitle", parent=base["Normal"],
        fontName=FONT_BOLD, fontSize=42, textColor=white,
        alignment=TA_CENTER, leading=48, spaceAfter=8,
    )
    styles["CoverSubtitle"] = ParagraphStyle(
        "CoverSubtitle", parent=base["Normal"],
        fontName=FONT_REGULAR, fontSize=14, textColor=HexColor("#c4b5fd"),
        alignment=TA_CENTER, leading=20, spaceAfter=24,
    )
    styles["CoverMeta"] = ParagraphStyle(
        "CoverMeta", parent=base["Normal"],
        fontName=FONT_REGULAR, fontSize=10, textColor=HexColor("#94a3b8"),
        alignment=TA_CENTER, leading=14,
    )
    styles["ChapterTitle"] = ParagraphStyle(
        "ChapterTitle", parent=base["Heading1"],
        fontName=FONT_BOLD, fontSize=22, textColor=SLATE_900,
        leading=28, spaceBefore=4, spaceAfter=6,
    )
    styles["ChapterDesc"] = ParagraphStyle(
        "ChapterDesc", parent=base["Normal"],
        fontName=FONT_ITALIC, fontSize=11, textColor=SLATE_500,
        leading=16, spaceAfter=16,
    )
    styles["SectionTitle"] = ParagraphStyle(
        "SectionTitle", parent=base["Heading2"],
        fontName=FONT_BOLD, fontSize=17, textColor=EMERALD_DARK,
        leading=22, spaceBefore=12, spaceAfter=4, keepWithNext=True,
    )
    styles["SectionSubtitle"] = ParagraphStyle(
        "SectionSubtitle", parent=base["Normal"],
        fontName=FONT_ITALIC, fontSize=10, textColor=SLATE_500,
        leading=14, spaceAfter=12,
    )
    styles["Body"] = ParagraphStyle(
        "Body", parent=base["Normal"],
        fontName=FONT_REGULAR, fontSize=10, textColor=SLATE_900,
        leading=15, spaceAfter=8, alignment=TA_JUSTIFY,
    )
    styles["Bullet"] = ParagraphStyle(
        "Bullet", parent=base["Normal"],
        fontName=FONT_REGULAR, fontSize=10, textColor=SLATE_900,
        leading=14, leftIndent=14, bulletIndent=2, spaceAfter=3,
    )
    styles["StepTitle"] = ParagraphStyle(
        "StepTitle", parent=base["Normal"],
        fontName=FONT_BOLD, fontSize=10.5, textColor=SLATE_900,
        leading=14, spaceAfter=1,
    )
    styles["StepDesc"] = ParagraphStyle(
        "StepDesc", parent=base["Normal"],
        fontName=FONT_REGULAR, fontSize=9.5, textColor=SLATE_700,
        leading=13, spaceAfter=6, leftIndent=0,
    )
    styles["CalloutTitle"] = ParagraphStyle(
        "CalloutTitle", parent=base["Normal"],
        fontName=FONT_BOLD, fontSize=9, textColor=SLATE_900,
        leading=12, spaceAfter=2,
    )
    styles["CalloutText"] = ParagraphStyle(
        "CalloutText", parent=base["Normal"],
        fontName=FONT_REGULAR, fontSize=9.5, textColor=SLATE_900,
        leading=14,
    )
    styles["Code"] = ParagraphStyle(
        "Code", parent=base["Code"],
        fontName=FONT_MONO, fontSize=8, textColor=HexColor("#e2e8f0"),
        leading=11, leftIndent=8, rightIndent=8, spaceBefore=4, spaceAfter=4,
        backColor=SLATE_900,
    )
    styles["TOCEntry"] = ParagraphStyle(
        "TOCEntry", parent=base["Normal"],
        fontName=FONT_REGULAR, fontSize=10, textColor=SLATE_700,
        leading=16, leftIndent=12,
    )
    styles["TOCChapter"] = ParagraphStyle(
        "TOCChapter", parent=base["Normal"],
        fontName=FONT_BOLD, fontSize=11, textColor=SLATE_900,
        leading=18, spaceBefore=8, spaceAfter=2,
    )
    styles["Footer"] = ParagraphStyle(
        "Footer", parent=base["Normal"],
        fontName=FONT_REGULAR, fontSize=8, textColor=SLATE_500,
        alignment=TA_CENTER,
    )
    return styles

STYLES = make_styles()

# ============================================================================
# CALLOUT COLORS
# ============================================================================

CALLOUT_VARIANTS = {
    "info": (SKY_LIGHT, SKY, "INFORMACIÓN"),
    "warning": (ROSE_LIGHT, ROSE, "ATENCIÓN"),
    "tip": (AMBER_LIGHT, AMBER, "CONSEJO"),
    "ai": (VIOLET_LIGHT, VIOLET, "COPILOTO IA"),
}

# ============================================================================
# FLOWABLES
# ============================================================================

class HRule(Flowable):
    def __init__(self, width, thickness=0.5, color=SLATE_200, spaceBefore=4, spaceAfter=4):
        Flowable.__init__(self)
        self.width = width
        self.thickness = thickness
        self.color = color
        self.spaceBefore = spaceBefore
        self.spaceAfter = spaceAfter

    def wrap(self, *args):
        return self.width, self.thickness + self.spaceBefore + self.spaceAfter

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        y = self.spaceAfter
        self.canv.line(0, y, self.width, y)


def render_block(block, available_width):
    """Convierte un bloque del contenido en una lista de Flowables."""
    btype = block["type"]
    flowables = []

    if btype == "paragraph":
        flowables.append(Paragraph(block["text"], STYLES["Body"]))

    elif btype == "list":
        items = [Paragraph(item, STYLES["Bullet"]) for item in block["items"]]
        flowables.append(ListFlowable(
            items,
            bulletType="bullet",
            bulletColor=EMERALD,
            bulletFontSize=8,
            leftIndent=14,
            spaceBefore=2,
            spaceAfter=8,
        ))

    elif btype == "steps":
        steps = block["steps"]
        for i, step in enumerate(steps, 1):
            # Number circle + title + description
            circle_table = Table(
                [[str(i), Paragraph(step["title"], STYLES["StepTitle"])]],
                colWidths=[20, available_width - 20],
            )
            circle_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (0, 0), EMERALD),
                ("TEXTCOLOR", (0, 0), (0, 0), white),
                ("FONT", (0, 0), (0, 0), FONT_BOLD, 10),
                ("ALIGN", (0, 0), (0, 0), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (1, 0), (1, 0), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ]))
            flowables.append(KeepTogether([
                circle_table,
                Paragraph(step["description"], STYLES["StepDesc"]),
            ]))

    elif btype == "callout":
        variant = block.get("variant", "info")
        bg, border, label = CALLOUT_VARIANTS.get(variant, CALLOUT_VARIANTS["info"])
        title_p = Paragraph(label, STYLES["CalloutTitle"])
        text_p = Paragraph(block["text"], STYLES["CalloutText"])
        callout_table = Table(
            [[title_p], [text_p]],
            colWidths=[available_width - 8],
        )
        callout_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), bg),
            ("BOX", (0, 0), (-1, -1), 1, border),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        flowables.append(KeepTogether(callout_table))
        flowables.append(Spacer(1, 6))

    elif btype == "code":
        # Render as preformatted text in a dark background
        lines = block["text"].split("\n")
        # Wrap in paragraphs with line breaks
        code_html = "<br/>".join(line.replace(" ", "&nbsp;") for line in lines)
        code_p = Paragraph(code_html, STYLES["Code"])
        code_table = Table([[code_p]], colWidths=[available_width])
        code_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), SLATE_900),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        flowables.append(code_table)
        flowables.append(Spacer(1, 8))

    return flowables


# ============================================================================
# PORTADA
# ============================================================================

def draw_cover(canv, doc):
    """Dibuja la portada del PDF."""
    w, h = A4
    # Fondo gradiente simulado (capas)
    canv.setFillColor(SLATE_900)
    canv.rect(0, 0, w, h, fill=1, stroke=0)
    # Banda diagonal violeta
    canv.setFillColor(VIOLET)
    canv.setFillAlpha(0.15)
    p = canv.beginPath()
    p.moveTo(0, h * 0.6)
    p.lineTo(w, h * 0.85)
    p.lineTo(w, h * 0.55)
    p.lineTo(0, h * 0.3)
    p.close()
    canv.drawPath(p, fill=1, stroke=0)
    canv.setFillAlpha(1)
    # Banda emerald
    canv.setFillColor(EMERALD)
    canv.setFillAlpha(0.2)
    p2 = canv.beginPath()
    p2.moveTo(0, h * 0.35)
    p2.lineTo(w, h * 0.15)
    p2.lineTo(w, 0)
    p2.lineTo(0, 0)
    p2.close()
    canv.drawPath(p2, fill=1, stroke=0)
    canv.setFillAlpha(1)
    # Línea decorativa
    canv.setStrokeColor(EMERALD)
    canv.setLineWidth(2)
    canv.line(w * 0.2, h * 0.65, w * 0.8, h * 0.65)
    # Título
    canv.setFillColor(white)
    canv.setFont(FONT_BOLD, 48)
    canv.drawCentredString(w / 2, h * 0.72, GUIDE_INTRO["title"])
    # Subtítulo
    canv.setFillColor(HexColor("#a78bfa"))
    canv.setFont(FONT_REGULAR, 14)
    canv.drawCentredString(w / 2, h * 0.68, GUIDE_INTRO["subtitle"])
    # Descripción (envuelta manual)
    desc = GUIDE_INTRO["description"]
    canv.setFont(FONT_REGULAR, 10)
    canv.setFillColor(HexColor("#cbd5e1"))
    from reportlab.lib.utils import simpleSplit
    lines = simpleSplit(desc, FONT_REGULAR, 10, w * 0.7)
    y = h * 0.55
    for line in lines:
        canv.drawCentredString(w / 2, y, line)
        y -= 14
    # Stats en cajas
    y_stats = h * 0.25
    box_w = w * 0.18
    box_h = 50
    spacing = (w - 4 * box_w) / 5
    for i, (label, value) in enumerate(GUIDE_INTRO["stats"]):
        x = spacing + i * (box_w + spacing)
        canv.setFillColor(HexColor("#1e293b"))
        canv.setStrokeColor(EMERALD)
        canv.setLineWidth(1)
        canv.roundRect(x, y_stats, box_w, box_h, 6, fill=1, stroke=1)
        canv.setFillColor(EMERALD)
        canv.setFont(FONT_BOLD, 16)
        canv.drawCentredString(x + box_w / 2, y_stats + 25, value)
        canv.setFillColor(HexColor("#94a3b8"))
        canv.setFont(FONT_REGULAR, 8)
        canv.drawCentredString(x + box_w / 2, y_stats + 10, label.upper())
    # Footer
    canv.setFillColor(HexColor("#64748b"))
    canv.setFont(FONT_REGULAR, 9)
    canv.drawCentredString(w / 2, 30, "VetCare · Sistema de gestión veterinaria con copiloto IA")
    canv.drawCentredString(w / 2, 18, "Versión actual · Documento generado automáticamente")


# ============================================================================
# HEADER / FOOTER DE PÁGINAS INTERIORES
# ============================================================================

def draw_page_chrome(canv, doc):
    """Header y footer de páginas interiores."""
    if canv.getPageNumber() == 1:
        return  # La portada se dibuja aparte
    w, h = A4
    # Header line
    canv.setStrokeColor(SLATE_200)
    canv.setLineWidth(0.5)
    canv.line(20 * mm, h - 15 * mm, w - 20 * mm, h - 15 * mm)
    canv.setFillColor(SLATE_500)
    canv.setFont(FONT_REGULAR, 8)
    canv.drawString(20 * mm, h - 13 * mm, "Guía VetCare")
    canv.drawRightString(w - 20 * mm, h - 13 * mm, f"Página {canv.getPageNumber()}")
    # Footer line
    canv.line(20 * mm, 15 * mm, w - 20 * mm, 15 * mm)
    canv.drawCentredString(w / 2, 10 * mm, "VetCare · Gestión veterinaria con copiloto IA")


# ============================================================================
# CONSTRUCCIÓN DEL DOCUMENTO
# ============================================================================

def build_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        title="Guía VetCare",
        author="VetCare",
        subject="Manual de usuario del sistema de gestión veterinaria",
        creator="VetCare",
    )

    available_width = A4[0] - 40 * mm  # 170mm

    story = []

    # =========================================================================
    # PORTADA
    # =========================================================================
    story.append(PageBreak())  # Salto para que draw_cover dibuje en pág 1 y contenido empiece en pág 2

    # =========================================================================
    # ÍNDICE
    # =========================================================================
    story.append(Paragraph("Índice", STYLES["ChapterTitle"]))
    story.append(HRule(available_width, thickness=2, color=EMERALD, spaceBefore=2, spaceAfter=8))
    story.append(Spacer(1, 6))

    for chapter in GUIDE_CHAPTERS:
        story.append(Paragraph(chapter["title"], STYLES["TOCChapter"]))
        story.append(Paragraph(
            f"<i>{chapter['description']}</i>",
            STYLES["TOCEntry"],
        ))
        for section in chapter["sections"]:
            story.append(Paragraph(
                f"<b>{section['title']}</b> — <font color='#64748b'>{section['subtitle']}</font>",
                STYLES["TOCEntry"],
            ))
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # =========================================================================
    # INTRODUCCIÓN
    # =========================================================================
    story.append(Paragraph("Introducción", STYLES["ChapterTitle"]))
    story.append(HRule(available_width, thickness=2, color=EMERALD, spaceBefore=2, spaceAfter=10))
    story.append(Paragraph(GUIDE_INTRO["description"], STYLES["Body"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Cómo usar esta guía", STYLES["SectionTitle"]))
    story.append(Paragraph(
        f"La guía está dividida en {len(GUIDE_CHAPTERS)} capítulos, organizados por audiencia. "
        "Cada capítulo contiene secciones con: descripción del módulo, lista de features clave, "
        "pasos numerados cuando hay un flujo principal, y callouts (consejos, advertencias, "
        "notas de IA).",
        STYLES["Body"],
    ))

    # Stats en tabla
    stats_data = [[Paragraph(f"<b>{v}</b>", STYLES["Body"]), Paragraph(l, STYLES["Body"])] for l, v in GUIDE_INTRO["stats"]]
    stats_table = Table(stats_data, colWidths=[40 * mm, available_width - 40 * mm])
    stats_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SLATE_50),
        ("BOX", (0, 0), (-1, -1), 0.5, SLATE_200),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, SLATE_200),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(Spacer(1, 6))
    story.append(stats_table)

    # Nota IA
    story.append(Spacer(1, 12))
    ai_note = Paragraph(
        "<b>COPILOTO IA INTEGRADO</b><br/>"
        "La IA está mencionada en cada módulo donde aplica (no tiene sección propia): "
        "dictado de consultas, anamnesis adaptativa, diagnósticos diferenciales, detección "
        "de patrones, dosis por peso, y resumen automático de telemedicina.",
        STYLES["CalloutText"],
    )
    ai_table = Table([[ai_note]], colWidths=[available_width - 8])
    ai_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), VIOLET_LIGHT),
        ("BOX", (0, 0), (-1, -1), 1, VIOLET),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(ai_table)
    story.append(PageBreak())

    # =========================================================================
    # CAPÍTULOS Y SECCIONES
    # =========================================================================
    for ci, chapter in enumerate(GUIDE_CHAPTERS, 1):
        # Cabecera de capítulo
        story.append(Paragraph(f"Capítulo {ci}", STYLES["CalloutTitle"]))
        story.append(Paragraph(chapter["title"], STYLES["ChapterTitle"]))
        story.append(HRule(available_width, thickness=2, color=EMERALD, spaceBefore=2, spaceAfter=8))
        story.append(Paragraph(chapter["description"], STYLES["ChapterDesc"]))
        story.append(Spacer(1, 6))

        for section in chapter["sections"]:
            # Título de sección
            story.append(Paragraph(section["title"], STYLES["SectionTitle"]))
            if section.get("subtitle"):
                story.append(Paragraph(section["subtitle"], STYLES["SectionSubtitle"]))

            # Bloques
            for block in section["blocks"]:
                story.extend(render_block(block, available_width))

            story.append(Spacer(1, 8))

        # Salto de página entre capítulos
        if ci < len(GUIDE_CHAPTERS):
            story.append(PageBreak())

    # =========================================================================
    # CONTRAPORTADA
    # =========================================================================
    story.append(PageBreak())
    story.append(Spacer(1, 80))
    story.append(Paragraph("Fin de la guía", STYLES["ChapterTitle"]))
    story.append(HRule(available_width, thickness=2, color=EMERALD, spaceBefore=2, spaceAfter=10))
    story.append(Paragraph(
        "Esta guía describe la versión actual de VetCare. Para acceder a la versión "
        "interactiva dentro de la aplicación, pulsa el icono de ayuda (?) en el sidebar.",
        STYLES["Body"],
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "Para reportar errores o sugerir mejoras, contacta con el equipo de producto. "
        "Las funciones marcadas como \"en roadmap\" están planificadas pero aún no implementadas.",
        STYLES["Body"],
    ))

    # Build
    doc.build(story, onFirstPage=draw_cover, onLaterPages=draw_page_chrome)
    return output_path


if __name__ == "__main__":
    output = "/home/z/my-project/public/guia-vetcare.pdf"
    print(f"Generando PDF en {output}...")
    result = build_pdf(output)
    size = os.path.getsize(result)
    print(f"OK: {result} ({size:,} bytes)")
