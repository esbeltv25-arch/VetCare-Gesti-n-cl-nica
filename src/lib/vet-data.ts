// Datos mock para la app de gestión veterinaria VetCare

export interface Client {
  id: string
  name: string
  phone: string
  email: string
  address: string
  since: string
  petIds: string[]
  loyaltyPoints: number
  avatarColor: string
}

export interface Pet {
  id: string
  name: string
  species: 'Perro' | 'Gato' | 'Conejo' | 'Ave' | 'Reptil'
  breed: string
  birthDate: string
  weight: number // kg
  sex: 'M' | 'H'
  microchip: string
  sterilized: boolean
  clientId: string
  photoUrl: string
  allergies: string[]
  chronicConditions: string[]
  vaccines: { name: string; date: string; nextDue?: string }[]
  lastVisit?: string
  status: 'Sano' | 'En tratamiento' | 'Crítico' | 'En observación'
}

export interface Appointment {
  id: string
  petId: string
  clientId: string
  vetId: string
  date: string // ISO date
  time: string // HH:MM
  duration: number // minutes
  reason: string
  type: 'Consulta' | 'Vacunación' | 'Cirugía' | 'Control' | 'Urgencia' | 'Peluquería'
  status: 'Confirmada' | 'Pendiente' | 'Cancelada' | 'Completada'
}

export interface Vet {
  id: string
  name: string
  role: 'Veterinario' | 'Recepción' | 'Peluquería' | 'Administrador' | 'Auxiliar'
  specialty: string
  phone: string
  email: string
  shift: 'Mañana' | 'Tarde' | 'Completo'
  active: boolean
  appointmentsToday: number
  rating: number
  avatarColor: string
}

export interface InventoryItem {
  id: string
  name: string
  category: 'Medicamento' | 'Alimento' | 'Accesorio' | 'Insumo médico' | 'Higiene'
  stock: number
  minStock: number
  unit: string
  expiryDate?: string
  supplier: string
  price: number
  lot: string
}

export interface Invoice {
  id: string
  number: string
  clientId: string
  petId: string
  date: string
  items: { description: string; qty: number; unitPrice: number }[]
  total: number
  status: 'Pagada' | 'Pendiente' | 'Vencida'
  paymentMethod?: string
}

// Avatares de colores
const AVATAR_COLORS = [
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-cyan-100 text-cyan-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
]

// Fotos de mascotas (usando imágenes de Unsplash)
const PET_PHOTOS: Record<string, string> = {
  // Perros
  'perro-1': 'https://images.unsplash.com/photo-1552053846-06e9c81de1a8?w=400&h=400&fit=crop',
  'perro-2': 'https://images.unsplash.com/photo-1537151628847-61e8b4d2e3d4?w=400&h=400&fit=crop',
  'perro-3': 'https://images.unsplash.com/photo-1518717758536-3a9c1d2e0a3c?w=400&h=400&fit=crop',
  'perro-4': 'https://images.unsplash.com/photo-1583572178660-1fe9d4d8c9c4?w=400&h=400&fit=crop',
  'perro-5': 'https://images.unsplash.com/photo-1605812882504-9c2f3e2e1b21?w=400&h=400&fit=crop',
  // Gatos
  'gato-1': 'https://images.unsplash.com/photo-1514888286974-8cd924e1c4d4?w=400&h=400&fit=crop',
  'gato-2': 'https://images.unsplash.com/photo-1495360010541-f48222b45e6e?w=400&h=400&fit=crop',
  'gato-3': 'https://images.unsplash.com/photo-1513360371669-4a4a4d5e0c48?w=400&h=400&fit=crop',
  'gato-4': 'https://images.unsplash.com/photo-1592194996308-7b43878c37c4?w=400&h=400&fit=crop',
  // Conejos
  'conejo-1': 'https://images.unsplash.com/photo-1591389703635-e10a5d8dc23c?w=400&h=400&fit=crop',
  // Aves
  'ave-1': 'https://images.unsplash.com/photo-1522858547137-f1a2e0a4e8e0?w=400&h=400&fit=crop',
}

export const clients: Client[] = [
  {
    id: 'c1',
    name: 'María González',
    phone: '+34 611 22 33 44',
    email: 'maria.gonzalez@email.com',
    address: 'C/ Mayor 12, Madrid',
    since: '2021-03-15',
    petIds: ['p1', 'p2'],
    loyaltyPoints: 320,
    avatarColor: AVATAR_COLORS[0],
  },
  {
    id: 'c2',
    name: 'Carlos Ruiz',
    phone: '+34 622 33 44 55',
    email: 'carlos.ruiz@email.com',
    address: 'Av. Diagonal 45, Barcelona',
    since: '2022-06-20',
    petIds: ['p3'],
    loyaltyPoints: 150,
    avatarColor: AVATAR_COLORS[1],
  },
  {
    id: 'c3',
    name: 'Laura Pérez',
    phone: '+34 633 44 55 66',
    email: 'laura.perez@email.com',
    address: 'C/ Sol 8, Valencia',
    since: '2020-01-10',
    petIds: ['p4', 'p5'],
    loyaltyPoints: 580,
    avatarColor: AVATAR_COLORS[2],
  },
  {
    id: 'c4',
    name: 'Javier Martínez',
    phone: '+34 644 55 66 77',
    email: 'javier.martinez@email.com',
    address: 'Pl. España 3, Sevilla',
    since: '2023-09-05',
    petIds: ['p6'],
    loyaltyPoints: 75,
    avatarColor: AVATAR_COLORS[3],
  },
  {
    id: 'c5',
    name: 'Ana López',
    phone: '+34 655 66 77 88',
    email: 'ana.lopez@email.com',
    address: 'C/ Larios 22, Málaga',
    since: '2021-11-30',
    petIds: ['p7', 'p8'],
    loyaltyPoints: 410,
    avatarColor: AVATAR_COLORS[4],
  },
  {
    id: 'c6',
    name: 'Roberto Sánchez',
    phone: '+34 666 77 88 99',
    email: 'roberto.sanchez@email.com',
    address: 'C/ Gran Vía 1, Bilbao',
    since: '2022-04-18',
    petIds: ['p9'],
    loyaltyPoints: 220,
    avatarColor: AVATAR_COLORS[5],
  },
  {
    id: 'c7',
    name: 'Elena García',
    phone: '+34 677 88 99 00',
    email: 'elena.garcia@email.com',
    address: 'C/ Real 7, Zaragoza',
    since: '2024-02-14',
    petIds: ['p10'],
    loyaltyPoints: 35,
    avatarColor: AVATAR_COLORS[6],
  },
]

export const pets: Pet[] = [
  {
    id: 'p1',
    name: 'Luna',
    species: 'Perro',
    breed: 'Labrador Retriever',
    birthDate: '2020-05-12',
    weight: 28.5,
    sex: 'H',
    microchip: '985141052345678',
    sterilized: true,
    clientId: 'c1',
    photoUrl: PET_PHOTOS['perro-1'],
    allergies: ['Polen'],
    chronicConditions: [],
    vaccines: [
      { name: 'Rabia', date: '2024-03-10', nextDue: '2025-03-10' },
      { name: 'Moquillo', date: '2024-03-10', nextDue: '2025-03-10' },
      { name: 'Parvovirus', date: '2024-03-10', nextDue: '2025-03-10' },
    ],
    lastVisit: '2025-09-15',
    status: 'Sano',
  },
  {
    id: 'p2',
    name: 'Mia',
    species: 'Gato',
    breed: 'Siamés',
    birthDate: '2021-08-22',
    weight: 4.2,
    sex: 'H',
    microchip: '985141052345689',
    sterilized: true,
    clientId: 'c1',
    photoUrl: PET_PHOTOS['gato-1'],
    allergies: [],
    chronicConditions: [],
    vaccines: [
      { name: 'Rabia', date: '2024-06-15', nextDue: '2025-06-15' },
      { name: 'Leucemia felina', date: '2024-06-15', nextDue: '2025-06-15' },
    ],
    lastVisit: '2025-09-20',
    status: 'Sano',
  },
  {
    id: 'p3',
    name: 'Max',
    species: 'Perro',
    breed: 'Pastor Alemán',
    birthDate: '2019-02-14',
    weight: 35.0,
    sex: 'M',
    microchip: '985141052345690',
    sterilized: false,
    clientId: 'c2',
    photoUrl: PET_PHOTOS['perro-2'],
    allergies: ['Carne de res'],
    chronicConditions: ['Displasia de cadera'],
    vaccines: [
      { name: 'Rabia', date: '2024-01-20', nextDue: '2025-01-20' },
    ],
    lastVisit: '2025-09-22',
    status: 'En tratamiento',
  },
  {
    id: 'p4',
    name: 'Buddy',
    species: 'Perro',
    breed: 'Beagle',
    birthDate: '2018-11-03',
    weight: 12.5,
    sex: 'M',
    microchip: '985141052345701',
    sterilized: true,
    clientId: 'c3',
    photoUrl: PET_PHOTOS['perro-3'],
    allergies: [],
    chronicConditions: ['Obesidad'],
    vaccines: [
      { name: 'Rabia', date: '2024-04-10', nextDue: '2025-04-10' },
      { name: 'Moquillo', date: '2024-04-10', nextDue: '2025-04-10' },
    ],
    lastVisit: '2025-09-18',
    status: 'En observación',
  },
  {
    id: 'p5',
    name: 'Whiskers',
    species: 'Gato',
    breed: 'Común europeo',
    birthDate: '2020-03-25',
    weight: 5.0,
    sex: 'M',
    microchip: '985141052345712',
    sterilized: true,
    clientId: 'c3',
    photoUrl: PET_PHOTOS['gato-2'],
    allergies: [],
    chronicConditions: [],
    vaccines: [
      { name: 'Rabia', date: '2024-07-01', nextDue: '2025-07-01' },
    ],
    lastVisit: '2025-09-10',
    status: 'Sano',
  },
  {
    id: 'p6',
    name: 'Coco',
    species: 'Perro',
    breed: 'Caniche',
    birthDate: '2022-04-18',
    weight: 8.0,
    sex: 'H',
    microchip: '985141052345723',
    sterilized: true,
    clientId: 'c4',
    photoUrl: PET_PHOTOS['perro-4'],
    allergies: [],
    chronicConditions: [],
    vaccines: [
      { name: 'Rabia', date: '2024-09-05', nextDue: '2025-09-05' },
    ],
    lastVisit: '2025-09-25',
    status: 'Sano',
  },
  {
    id: 'p7',
    name: 'Rocky',
    species: 'Perro',
    breed: 'Bulldog Francés',
    birthDate: '2019-07-09',
    weight: 11.0,
    sex: 'M',
    microchip: '985141052345734',
    sterilized: true,
    clientId: 'c5',
    photoUrl: PET_PHOTOS['perro-5'],
    allergies: ['Polvo'],
    chronicConditions: ['Brachycephalic syndrome'],
    vaccines: [
      { name: 'Rabia', date: '2024-05-12', nextDue: '2025-05-12' },
    ],
    lastVisit: '2025-09-24',
    status: 'Crítico',
  },
  {
    id: 'p8',
    name: 'Nube',
    species: 'Gato',
    breed: 'Persa',
    birthDate: '2020-12-01',
    weight: 4.5,
    sex: 'H',
    microchip: '985141052345745',
    sterilized: true,
    clientId: 'c5',
    photoUrl: PET_PHOTOS['gato-3'],
    allergies: [],
    chronicConditions: ['Rinitis crónica'],
    vaccines: [
      { name: 'Rabia', date: '2024-08-22', nextDue: '2025-08-22' },
    ],
    lastVisit: '2025-09-19',
    status: 'En tratamiento',
  },
  {
    id: 'p9',
    name: 'Pelusa',
    species: 'Conejo',
    breed: 'Mini Lop',
    birthDate: '2022-06-10',
    weight: 1.8,
    sex: 'H',
    microchip: '985141052345756',
    sterilized: true,
    clientId: 'c6',
    photoUrl: PET_PHOTOS['conejo-1'],
    allergies: [],
    chronicConditions: [],
    vaccines: [
      { name: 'Mixomatosis', date: '2024-09-15', nextDue: '2025-09-15' },
    ],
    lastVisit: '2025-09-12',
    status: 'Sano',
  },
  {
    id: 'p10',
    name: 'Kiwi',
    species: 'Ave',
    breed: 'Periquito',
    birthDate: '2023-01-20',
    weight: 0.1,
    sex: 'H',
    microchip: '',
    sterilized: false,
    clientId: 'c7',
    photoUrl: PET_PHOTOS['ave-1'],
    allergies: [],
    chronicConditions: [],
    vaccines: [],
    lastVisit: '2025-09-05',
    status: 'Sano',
  },
]

export const vets: Vet[] = [
  {
    id: 'v1',
    name: 'Dra. Elena Torres',
    role: 'Veterinario',
    specialty: 'Cirugía y traumatología',
    phone: '+34 600 11 22 33',
    email: 'elena.torres@vetcare.com',
    shift: 'Completo',
    active: true,
    appointmentsToday: 8,
    rating: 4.9,
    avatarColor: AVATAR_COLORS[1],
  },
  {
    id: 'v2',
    name: 'Dr. Miguel Fernández',
    role: 'Veterinario',
    specialty: 'Medicina interna',
    phone: '+34 600 22 33 44',
    email: 'miguel.fernandez@vetcare.com',
    shift: 'Mañana',
    active: true,
    appointmentsToday: 5,
    rating: 4.7,
    avatarColor: AVATAR_COLORS[2],
  },
  {
    id: 'v3',
    name: 'Dra. Sofía Ramírez',
    role: 'Veterinario',
    specialty: 'Dermatología',
    phone: '+34 600 33 44 55',
    email: 'sofia.ramirez@vetcare.com',
    shift: 'Tarde',
    active: true,
    appointmentsToday: 6,
    rating: 4.8,
    avatarColor: AVATAR_COLORS[3],
  },
  {
    id: 'v4',
    name: 'Lucía Moreno',
    role: 'Recepción',
    specialty: 'Atención al cliente',
    phone: '+34 600 44 55 66',
    email: 'lucia.moreno@vetcare.com',
    shift: 'Completo',
    active: true,
    appointmentsToday: 0,
    rating: 4.6,
    avatarColor: AVATAR_COLORS[4],
  },
  {
    id: 'v5',
    name: 'Pedro Jiménez',
    role: 'Peluquería',
    specialty: 'Estética canina',
    phone: '+34 600 55 66 77',
    email: 'pedro.jimenez@vetcare.com',
    shift: 'Mañana',
    active: true,
    appointmentsToday: 4,
    rating: 4.5,
    avatarColor: AVATAR_COLORS[5],
  },
  {
    id: 'v6',
    name: 'Carmen Vega',
    role: 'Administrador',
    specialty: 'Gestión clínica',
    phone: '+34 600 66 77 88',
    email: 'carmen.vega@vetcare.com',
    shift: 'Completo',
    active: true,
    appointmentsToday: 0,
    rating: 4.9,
    avatarColor: AVATAR_COLORS[6],
  },
  {
    id: 'v7',
    name: 'Diego Romero',
    role: 'Auxiliar',
    specialty: 'Laboratorio',
    phone: '+34 600 77 88 99',
    email: 'diego.romero@vetcare.com',
    shift: 'Tarde',
    active: false,
    appointmentsToday: 0,
    rating: 4.4,
    avatarColor: AVATAR_COLORS[7],
  },
]

// Citas del día hoy y próximas
const today = new Date()
const fmt = (d: Date) => d.toISOString().split('T')[0]
const addDays = (n: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return fmt(d)
}

export const appointments: Appointment[] = [
  {
    id: 'a1',
    petId: 'p1',
    clientId: 'c1',
    vetId: 'v1',
    date: fmt(today),
    time: '09:00',
    duration: 30,
    reason: 'Vacunación anual',
    type: 'Vacunación',
    status: 'Confirmada',
  },
  {
    id: 'a2',
    petId: 'p3',
    clientId: 'c2',
    vetId: 'v2',
    date: fmt(today),
    time: '09:30',
    duration: 45,
    reason: 'Control de displasia',
    type: 'Control',
    status: 'Confirmada',
  },
  {
    id: 'a3',
    petId: 'p7',
    clientId: 'c5',
    vetId: 'v1',
    date: fmt(today),
    time: '10:15',
    duration: 60,
    reason: 'Dificultad respiratoria',
    type: 'Urgencia',
    status: 'Confirmada',
  },
  {
    id: 'a4',
    petId: 'p6',
    clientId: 'c4',
    vetId: 'v5',
    date: fmt(today),
    time: '11:00',
    duration: 60,
    reason: 'Baño y corte',
    type: 'Peluquería',
    status: 'Pendiente',
  },
  {
    id: 'a5',
    petId: 'p4',
    clientId: 'c3',
    vetId: 'v3',
    date: fmt(today),
    time: '12:00',
    duration: 30,
    reason: 'Consulta dermatológica',
    type: 'Consulta',
    status: 'Confirmada',
  },
  {
    id: 'a6',
    petId: 'p2',
    clientId: 'c1',
    vetId: 'v2',
    date: fmt(today),
    time: '13:00',
    duration: 30,
    reason: 'Vacunación leucemia',
    type: 'Vacunación',
    status: 'Confirmada',
  },
  {
    id: 'a7',
    petId: 'p8',
    clientId: 'c5',
    vetId: 'v3',
    date: fmt(today),
    time: '16:00',
    duration: 45,
    reason: 'Control rinitis',
    type: 'Control',
    status: 'Pendiente',
  },
  {
    id: 'a8',
    petId: 'p9',
    clientId: 'c6',
    vetId: 'v1',
    date: fmt(today),
    time: '17:00',
    duration: 30,
    reason: 'Cirugía castración',
    type: 'Cirugía',
    status: 'Confirmada',
  },
  // Mañana
  {
    id: 'a9',
    petId: 'p5',
    clientId: 'c3',
    vetId: 'v2',
    date: addDays(1),
    time: '10:00',
    duration: 30,
    reason: 'Vacunación rabia',
    type: 'Vacunación',
    status: 'Confirmada',
  },
  {
    id: 'a10',
    petId: 'p10',
    clientId: 'c7',
    vetId: 'v3',
    date: addDays(1),
    time: '11:30',
    duration: 30,
    reason: 'Revisión general',
    type: 'Consulta',
    status: 'Pendiente',
  },
  // Pasado mañana
  {
    id: 'a11',
    petId: 'p1',
    clientId: 'c1',
    vetId: 'v5',
    date: addDays(2),
    time: '09:00',
    duration: 60,
    reason: 'Peluquería completa',
    type: 'Peluquería',
    status: 'Confirmada',
  },
  {
    id: 'a12',
    petId: 'p4',
    clientId: 'c3',
    vetId: 'v1',
    date: addDays(2),
    time: '15:00',
    duration: 90,
    reason: 'Limpieza dental',
    type: 'Cirugía',
    status: 'Pendiente',
  },
]

export const inventory: InventoryItem[] = [
  {
    id: 'i1',
    name: 'Vacuna Antirrábica (Nobivac)',
    category: 'Medicamento',
    stock: 24,
    minStock: 10,
    unit: 'dosis',
    expiryDate: '2026-02-15',
    supplier: 'MSD Animal Health',
    price: 18.5,
    lot: 'RAB-2024-08',
  },
  {
    id: 'i2',
    name: 'Vacuna Moquillo (Nobivac DHPP)',
    category: 'Medicamento',
    stock: 8,
    minStock: 10,
    unit: 'dosis',
    expiryDate: '2025-11-30',
    supplier: 'MSD Animal Health',
    price: 22.0,
    lot: 'DHPP-2024-06',
  },
  {
    id: 'i3',
    name: 'Amoxicilina 250mg',
    category: 'Medicamento',
    stock: 120,
    minStock: 30,
    unit: 'comprimidos',
    expiryDate: '2026-06-20',
    supplier: 'Calier Vet',
    price: 0.45,
    lot: 'AMX-2025-01',
  },
  {
    id: 'i4',
    name: 'Meloxicam 1.5mg/ml (oral)',
    category: 'Medicamento',
    stock: 15,
    minStock: 8,
    unit: 'frascos',
    expiryDate: '2025-10-15',
    supplier: 'Boehringer Ingelheim',
    price: 12.8,
    lot: 'MEL-2024-09',
  },
  {
    id: 'i5',
    name: 'Suero Fisiológico 500ml',
    category: 'Insumo médico',
    stock: 50,
    minStock: 20,
    unit: 'bolsas',
    expiryDate: '2026-12-01',
    supplier: 'B. Braun',
    price: 3.2,
    lot: 'SF-2025-03',
  },
  {
    id: 'i6',
    name: 'Jeringas desechables 5ml',
    category: 'Insumo médico',
    stock: 320,
    minStock: 100,
    unit: 'unidades',
    supplier: 'Becton Dickinson',
    price: 0.08,
    lot: 'JR-2025-02',
  },
  {
    id: 'i7',
    name: 'Pienso Royal Canin Adulto 15kg',
    category: 'Alimento',
    stock: 12,
    minStock: 5,
    unit: 'bolsas',
    supplier: 'Royal Canin',
    price: 68.0,
    lot: 'RC-AD-2025-04',
  },
  {
    id: 'i8',
    name: 'Pienso Hills gato castrado 4kg',
    category: 'Alimento',
    stock: 4,
    minStock: 6,
    unit: 'bolsas',
    supplier: 'Hill\'s Pet Nutrition',
    price: 32.5,
    lot: 'HIL-SC-2025-03',
  },
  {
    id: 'i9',
    name: 'Antiparasitario Frontline (pipetas)',
    category: 'Medicamento',
    stock: 45,
    minStock: 15,
    unit: 'pipetas',
    expiryDate: '2026-08-10',
    supplier: 'Boehringer Ingelheim',
    price: 9.5,
    lot: 'FRN-2025-01',
  },
  {
    id: 'i10',
    name: 'Champú hipoalergénico 500ml',
    category: 'Higiene',
    stock: 18,
    minStock: 5,
    unit: 'frascos',
    expiryDate: '2027-01-15',
    supplier: 'Virbac',
    price: 14.9,
    lot: 'VIR-CH-2024',
  },
  {
    id: 'i11',
    name: 'Guantes látex (caja 100)',
    category: 'Insumo médico',
    stock: 22,
    minStock: 10,
    unit: 'cajas',
    supplier: 'Médical Express',
    price: 8.5,
    lot: 'GL-2025-Q1',
  },
  {
    id: 'i12',
    name: 'Collar isabelino (varios tamaños)',
    category: 'Accesorio',
    stock: 14,
    minStock: 6,
    unit: 'unidades',
    supplier: 'Kruuse',
    price: 5.75,
    lot: 'KB-2024',
  },
  {
    id: 'i13',
    name: 'Cepillo dental canino',
    category: 'Accesorio',
    stock: 9,
    minStock: 4,
    unit: 'unidades',
    supplier: 'Beaphar',
    price: 4.2,
    lot: 'BP-2025-1',
  },
  {
    id: 'i14',
    name: 'Praziquantel comprimidos (antiparasitario)',
    category: 'Medicamento',
    stock: 6,
    minStock: 12,
    unit: 'comprimidos',
    expiryDate: '2025-12-31',
    supplier: 'Calier Vet',
    price: 1.2,
    lot: 'PRZ-2024',
  },
]

export const invoices: Invoice[] = [
  {
    id: 'inv1',
    number: 'F-2025-0142',
    clientId: 'c1',
    petId: 'p1',
    date: '2025-09-15',
    items: [
      { description: 'Consulta general + exploración', qty: 1, unitPrice: 35 },
      { description: 'Vacunación rabia (Nobivac)', qty: 1, unitPrice: 25 },
      { description: 'Desparasitación interna', qty: 1, unitPrice: 15 },
    ],
    total: 75,
    status: 'Pagada',
    paymentMethod: 'Tarjeta',
  },
  {
    id: 'inv2',
    number: 'F-2025-0143',
    clientId: 'c2',
    petId: 'p3',
    date: '2025-09-22',
    items: [
      { description: 'Control displasia cadera (RX + consulta)', qty: 1, unitPrice: 80 },
      { description: 'Antiinflamatorio (Meloxicam 30 días)', qty: 1, unitPrice: 28 },
    ],
    total: 108,
    status: 'Pagada',
    paymentMethod: 'Efectivo',
  },
  {
    id: 'inv3',
    number: 'F-2025-0144',
    clientId: 'c5',
    petId: 'p7',
    date: '2025-09-24',
    items: [
      { description: 'Urgencia respiratoria ( Bulldog)', qty: 1, unitPrice: 65 },
      { description: 'Medicación oxígeno', qty: 1, unitPrice: 18 },
      { description: 'Análisis sangre', qty: 1, unitPrice: 45 },
    ],
    total: 128,
    status: 'Pendiente',
  },
  {
    id: 'inv4',
    number: 'F-2025-0145',
    clientId: 'c4',
    petId: 'p6',
    date: '2025-09-25',
    items: [
      { description: 'Peluquería completa (Caniche)', qty: 1, unitPrice: 35 },
      { description: 'Corte de uñas', qty: 1, unitPrice: 8 },
    ],
    total: 43,
    status: 'Pendiente',
  },
  {
    id: 'inv5',
    number: 'F-2025-0140',
    clientId: 'c3',
    petId: 'p4',
    date: '2025-09-18',
    items: [
      { description: 'Consulta dermatológica', qty: 1, unitPrice: 45 },
      { description: 'Champú medicinal (300ml)', qty: 1, unitPrice: 18 },
      { description: 'Dieta Hills d/d 4kg', qty: 1, unitPrice: 38 },
    ],
    total: 101,
    status: 'Pagada',
    paymentMethod: 'Tarjeta',
  },
  {
    id: 'inv6',
    number: 'F-2025-0138',
    clientId: 'c5',
    petId: 'p8',
    date: '2025-09-19',
    items: [
      { description: 'Control rinitis crónica', qty: 1, unitPrice: 50 },
      { description: 'Antibiótico (10 días)', qty: 1, unitPrice: 22 },
    ],
    total: 72,
    status: 'Pagada',
    paymentMethod: 'Bizum',
  },
  {
    id: 'inv7',
    number: 'F-2025-0135',
    clientId: 'c6',
    petId: 'p9',
    date: '2025-09-12',
    items: [
      { description: 'Vacunación mixomatosis', qty: 1, unitPrice: 22 },
      { description: 'Consulta conejo', qty: 1, unitPrice: 30 },
    ],
    total: 52,
    status: 'Pagada',
    paymentMethod: 'Efectivo',
  },
  {
    id: 'inv8',
    number: 'F-2025-0130',
    clientId: 'c1',
    petId: 'p2',
    date: '2025-09-20',
    items: [
      { description: 'Vacunación leucemia felina', qty: 1, unitPrice: 28 },
      { description: 'Desparasitación', qty: 1, unitPrice: 12 },
    ],
    total: 40,
    status: 'Vencida',
  },
]

// Helpers
export function getPet(id: string): Pet | undefined {
  return pets.find(p => p.id === id)
}

export function getClient(id: string): Client | undefined {
  return clients.find(c => c.id === id)
}

export function getVet(id: string): Vet | undefined {
  return vets.find(v => v.id === id)
}

export function getPetsByClient(clientId: string): Pet[] {
  return pets.filter(p => p.clientId === clientId)
}

export function getAppointmentsByPet(petId: string): Appointment[] {
  return appointments.filter(a => a.petId === petId)
}

export function getInvoicesByClient(clientId: string): Invoice[] {
  return invoices.filter(i => i.clientId === clientId)
}

export function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()
  if (years === 0) return `${months} meses`
  if (months < 0) return `${years - 1} años`
  return years === 1 ? `${years} año` : `${years} años`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}
