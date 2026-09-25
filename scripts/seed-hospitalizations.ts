// Script para añadir hospitalizaciones de demo + bitácora de turno
// Uso: bun run /home/z/my-project/scripts/seed-hospitalizations.ts
import { db } from '../src/lib/db'

async function main() {
  console.log('Limpiando internaciones previas...')
  await db.shiftLog.deleteMany()
  await db.hospitalization.deleteMany()

  const now = new Date()
  const iso = (offsetHours: number) => {
    const d = new Date(now)
    d.setHours(d.getHours() - offsetHours)
    return d
  }

  // ============ Hospitalización 1: Rocky (Bulldog Francés, problemas respiratorios) ============
  const h1 = await db.hospitalization.create({
    data: {
      petId: 'p7',
      attendingVetId: 'v1',
      admissionDate: iso(36),
      cage: 'Oxígeno-Box 1',
      status: 'active',
      reason: 'Dificultad respiratoria aguda - síndrome braquicefálico',
      weightKg: 11.0,
      feedingPlan: 'Dieta húmeda Hill\'s i/d, 4 tomas/día voluntaria',
      fluidTherapy: 'SS 500ml/día a 20ml/h',
      notes: 'Vigilar frecuencia respiratoria cada 2h. Si FR > 40 avisar vet de guardia.',
    },
  })

  // Bitácora de Rocky (varias entradas en distintas horas)
  await db.shiftLog.createMany({
    data: [
      {
        hospitalizationId: h1.id,
        timestamp: iso(35),
        type: 'note',
        reporterVetId: 'v1',
        content: 'Paciente ingresado por disnea. Se inicia oxigenoterapia en caja con concentración 40%. Canalización vía IV en vena cefálica izquierda.',
      },
      {
        hospitalizationId: h1.id,
        timestamp: iso(34),
        type: 'vital',
        reporterVetId: 'v1',
        content: 'Constantes al ingreso',
        temperatureC: 38.6,
        heartRate: 140,
        respiratoryRate: 48,
        weightKg: 11.0,
        appetite: 'no come',
        hydration: 'normohidratado',
        urination: 'normal',
        feces: 'normal',
      },
      {
        hospitalizationId: h1.id,
        timestamp: iso(33),
        type: 'medication',
        reporterVetId: 'v1',
        content: 'Dexametasona 0.1 mg/kg IV para reducir inflamación de vía aérea',
        drugName: 'Dexametasona',
        doseMg: 1.1,
        dosePerKg: 0.1,
        route: 'IV',
      },
      {
        hospitalizationId: h1.id,
        timestamp: iso(28),
        type: 'behavior',
        reporterVetId: 'v7',
        content: 'Paciente más tranquilo tras oxigenoterapia. Respira por la boca con menor esfuerzo. Permanece en decúbito esternal. Reacciona al contacto.',
      },
      {
        hospitalizationId: h1.id,
        timestamp: iso(26),
        type: 'medication',
        reporterVetId: 'v7',
        content: 'Furosemida 1 mg/kg IV para manejo de posible edema pulmonar',
        drugName: 'Furosemida',
        doseMg: 11,
        dosePerKg: 1,
        route: 'IV',
      },
      {
        hospitalizationId: h1.id,
        timestamp: iso(24),
        type: 'vital',
        reporterVetId: 'v7',
        content: 'Constantes mejorando',
        temperatureC: 38.4,
        heartRate: 120,
        respiratoryRate: 36,
        appetite: 'poco',
        hydration: 'normohidratado',
        urination: 'normal',
        feces: 'normal',
      },
      {
        hospitalizationId: h1.id,
        timestamp: iso(20),
        type: 'handover',
        reporterVetId: 'v1',
        incomingVetId: 'v7',
        content: 'Le entrego el turno a Diego Romero. Rocky evoluciona favorable: FR bajó de 48 a 36, sigue en oxígeno. Próxima dosis de furosemida a las 06:00. Si FR sube de 40 o aparece tos, avisar a Dra. Torres al 600 11 22 33.',
      },
      {
        hospitalizationId: h1.id,
        timestamp: iso(12),
        type: 'incident',
        reporterVetId: 'v7',
        content: 'Cianosis leve en lengua a las 03:30. Se subió oxígeno a 50% durante 15 min y se recuperó coloración normal. Se notificó a Dra. Torres por teléfono, indicó mantener oxígeno en 40% y vigilar.',
        severity: 'warning',
      },
      {
        hospitalizationId: h1.id,
        timestamp: iso(8),
        type: 'medication',
        reporterVetId: 'v7',
        content: 'Dexametasona 0.1 mg/kg IV (segunda dosis programada)',
        drugName: 'Dexametasona',
        doseMg: 1.1,
        dosePerKg: 0.1,
        route: 'IV',
      },
      {
        hospitalizationId: h1.id,
        timestamp: iso(4),
        type: 'vital',
        reporterVetId: 'v7',
        content: 'Constantes 04:00 - estables',
        temperatureC: 38.2,
        heartRate: 110,
        respiratoryRate: 32,
        appetite: 'voluntario',
        hydration: 'normohidratado',
        urination: 'normal',
        feces: 'normal',
      },
      {
        hospitalizationId: h1.id,
        timestamp: iso(2),
        type: 'behavior',
        reporterVetId: 'v7',
        content: 'Ha comido 2/4 de la dieta húmeda. Más reactivo, reconoce al personal. Ha miccionado correctamente.',
      },
      {
        hospitalizationId: h1.id,
        timestamp: iso(0.5),
        type: 'handover',
        reporterVetId: 'v7',
        incomingVetId: 'v1',
        content: 'Le devuelvo el turno a la Dra. Torres. Rocky ha pasado buena noche tras el episodio de cianosis a las 03:30 (subimos oxígeno a 50% 15min y se recuperó). Constantes estables: FR 32, FC 110. No ha vuelto a tener disnea. Recomendación: mantener oxígeno 40% esta mañana y revaluar a las 12:00 para ver si lo podemos bajar a 30%.',
      },
    ],
  })

  // ============ Hospitalización 2: Nube (Gato Persa, rinitis) ============
  const h2 = await db.hospitalization.create({
    data: {
      petId: 'p8',
      attendingVetId: 'v3',
      admissionDate: iso(72),
      cage: 'Jaula A-3',
      status: 'observation',
      reason: 'Rinitis crónica refractaria - observación y tratamiento intensivo',
      weightKg: 4.5,
      feedingPlan: 'Pienso Hill\'s d/d húmedo, 3 tomas/día',
      fluidTherapy: 'No requiere',
      notes: 'Gato muy estresado. Manejar con ferret first. Avisar al dueño de evolución diaria.',
    },
  })

  await db.shiftLog.createMany({
    data: [
      {
        hospitalizationId: h2.id,
        timestamp: iso(71),
        type: 'note',
        reporterVetId: 'v3',
        content: 'Ingreso para observación intensiva. Paciente ya conocía la clínica. Se coloca en jaula A-3 con escondite. Se pauta antibiótico 7 días.',
      },
      {
        hospitalizationId: h2.id,
        timestamp: iso(70),
        type: 'medication',
        reporterVetId: 'v3',
        content: 'Amoxicilina 12.5mg/kg PO cada 12h',
        drugName: 'Amoxicilina',
        doseMg: 56,
        dosePerKg: 12.5,
        route: 'Oral',
      },
      {
        hospitalizationId: h2.id,
        timestamp: iso(60),
        type: 'behavior',
        reporterVetId: 'v7',
        content: 'Paciente muy retraído, escondido en caja de cartón. Ha comido poco (1/3 de la ración). Ha miccionado en arenero correctamente.',
      },
      {
        hospitalizationId: h2.id,
        timestamp: iso(48),
        type: 'vital',
        reporterVetId: 'v7',
        content: 'Constantes nocturnas',
        temperatureC: 38.4,
        heartRate: 180,
        respiratoryRate: 28,
        appetite: 'poco',
        hydration: 'normohidratado',
        urination: 'normal',
        feces: 'normal',
      },
      {
        hospitalizationId: h2.id,
        timestamp: iso(36),
        type: 'incident',
        reporterVetId: 'v7',
        content: 'Estornudos con secreción mucopurulenta. Se limpia con suero fisiológico y se notifica a Dra. Ramírez. No requiere cambio de tratamiento según indicación.',
        severity: 'info',
      },
      {
        hospitalizationId: h2.id,
        timestamp: iso(24),
        type: 'behavior',
        reporterVetId: 'v7',
        content: 'Paciente más activo hoy. Ha salido del escondite espontáneamente y ha comido toda la ración. Se ha acurrucado en manta. Signo de mejora.',
      },
      {
        hospitalizationId: h2.id,
        timestamp: iso(12),
        type: 'medication',
        reporterVetId: 'v3',
        content: 'Amoxicilina 12.5mg/kg PO (4ª dosis del día)',
        drugName: 'Amoxicilina',
        doseMg: 56,
        dosePerKg: 12.5,
        route: 'Oral',
      },
      {
        hospitalizationId: h2.id,
        timestamp: iso(2),
        type: 'vital',
        reporterVetId: 'v7',
        content: 'Constantes últimas 24h - mejora progresiva',
        temperatureC: 38.6,
        heartRate: 170,
        respiratoryRate: 24,
        appetite: 'voluntario',
        hydration: 'normohidratado',
        urination: 'normal',
        feces: 'normal',
      },
    ],
  })

  // ============ Hospitalización 3: Max (Pastor Alemán, control displasia) ============
  const h3 = await db.hospitalization.create({
    data: {
      petId: 'p3',
      attendingVetId: 'v2',
      admissionDate: iso(12),
      cage: 'Box Grande 2',
      status: 'active',
      reason: 'Postoperatorio de limpieza quirúrgica por lesión en articulación',
      weightKg: 35.0,
      feedingPlan: 'Pienso Royal Canin Mobility, 2 tomas/día',
      fluidTherapy: 'Hartmann 1L/día a 30ml/h',
      notes: 'Paciente con antecedente de displasia de cadera. Vigilar dolor: escala Glasgow cada 4h. Movilización pasiva cada 6h.',
    },
  })

  await db.shiftLog.createMany({
    data: [
      {
        hospitalizationId: h3.id,
        timestamp: iso(11),
        type: 'note',
        reporterVetId: 'v2',
        content: 'Alta de quirófano. Paciente despierto tras anestesia. Se coloca en Box Grande 2 con colchoneta ortopédica. Vía IV permeable en vena cefálica derecha.',
      },
      {
        hospitalizationId: h3.id,
        timestamp: iso(10),
        type: 'medication',
        reporterVetId: 'v2',
        content: 'Meloxicam 0.1 mg/kg PO como antiinflamatorio post-op',
        drugName: 'Meloxicam',
        doseMg: 3.5,
        dosePerKg: 0.1,
        route: 'Oral',
      },
      {
        hospitalizationId: h3.id,
        timestamp: iso(10),
        type: 'medication',
        reporterVetId: 'v2',
        content: 'Tramadol 2mg/kg PO cada 8h como analgésico',
        drugName: 'Tramadol',
        doseMg: 70,
        dosePerKg: 2,
        route: 'Oral',
      },
      {
        hospitalizationId: h3.id,
        timestamp: iso(8),
        type: 'vital',
        reporterVetId: 'v2',
        content: 'Constantes post-op 2h',
        temperatureC: 38.5,
        heartRate: 95,
        respiratoryRate: 18,
        appetite: 'no come',
        hydration: 'normohidratado',
        urination: 'normal',
        feces: 'ausente',
      },
      {
        hospitalizationId: h3.id,
        timestamp: iso(6),
        type: 'behavior',
        reporterVetId: 'v7',
        content: 'Paciente despierto y alerta. Ladea la pata izquierda al levantarse. Reacciona a la voz del dueño (visita a las 19:00). Ha tomado agua voluntariamente.',
      },
      {
        hospitalizationId: h3.id,
        timestamp: iso(4),
        type: 'incident',
        reporterVetId: 'v7',
        content: 'Ha vomitado 2 veces bilis. Se notifica a Dr. Fernández. Indica administrar ondansetrón 0.5mg/kg IV y mantener en ayuno hasta las 06:00.',
        severity: 'warning',
      },
      {
        hospitalizationId: h3.id,
        timestamp: iso(3.5),
        type: 'medication',
        reporterVetId: 'v7',
        content: 'Ondansetrón 0.5mg/kg IV por vómitos',
        drugName: 'Ondansetrón',
        doseMg: 17.5,
        dosePerKg: 0.5,
        route: 'IV',
      },
      {
        hospitalizationId: h3.id,
        timestamp: iso(1),
        type: 'behavior',
        reporterVetId: 'v7',
        content: 'Tras ondansetrón no ha vuelto a vomitar. Ha dormido tranquilo. Constantes estables. Movilización pasiva realizada a las 23:00 sin resistencia.',
      },
    ],
  })

  const counts = {
    hospitalizations: await db.hospitalization.count(),
    shiftLogs: await db.shiftLog.count(),
  }
  console.log('Hospitalizaciones de demo sembradas:', counts)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
