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
import { EmrView } from '@/components/vet/emr/emr-view'
import { ClientPortal } from '@/components/vet/client-portal'
import { ViewSwitcher } from '@/components/vet/view-switcher'

export type ModuleKey =
  | 'dashboard'
  | 'patients'
  | 'clients'
  | 'appointments'
  | 'emr'
  | 'inventory'
  | 'billing'
  | 'staff'

export type ViewMode = 'staff' | 'client'

export default function Home() {
  const [view, setView] = useState<ViewMode>('staff')
  const [active, setActive] = useState<ModuleKey>('dashboard')

  if (view === 'client') {
    return (
      <div className="min-h-screen bg-muted/30">
        <ViewSwitcher view={view} onChange={setView} />
        <ClientPortal />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Sidebar active={active} onChange={setActive} />
      <main className="flex-1 overflow-x-hidden">
        <ViewSwitcher view={view} onChange={setView} />
        {active === 'dashboard' && <Dashboard onNavigate={setActive} />}
        {active === 'patients' && <PatientsView />}
        {active === 'clients' && <ClientsView />}
        {active === 'appointments' && <AppointmentsView />}
        {active === 'emr' && <EmrView />}
        {active === 'inventory' && <InventoryView />}
        {active === 'billing' && <BillingView />}
        {active === 'staff' && <StaffView />}
      </main>
    </div>
  )
}
