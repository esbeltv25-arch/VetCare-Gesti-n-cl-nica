'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/vet/sidebar'
import { Dashboard } from '@/components/vet/dashboard'
import { PatientsView } from '@/components/vet/patients'
import { ClientsView } from '@/components/vet/clients'
import { AppointmentsView } from '@/components/vet/appointments'
import { InventoryView } from '@/components/vet/inventory'
import { BillingView } from '@/components/vet/billing'
import { StaffView } from '@/components/vet/staff'

export type ModuleKey =
  | 'dashboard'
  | 'patients'
  | 'clients'
  | 'appointments'
  | 'inventory'
  | 'billing'
  | 'staff'

export default function Home() {
  const [active, setActive] = useState<ModuleKey>('dashboard')

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Sidebar active={active} onChange={setActive} />
      <main className="flex-1 overflow-x-hidden">
        {active === 'dashboard' && <Dashboard onNavigate={setActive} />}
        {active === 'patients' && <PatientsView />}
        {active === 'clients' && <ClientsView />}
        {active === 'appointments' && <AppointmentsView />}
        {active === 'inventory' && <InventoryView />}
        {active === 'billing' && <BillingView />}
        {active === 'staff' && <StaffView />}
      </main>
    </div>
  )
}
