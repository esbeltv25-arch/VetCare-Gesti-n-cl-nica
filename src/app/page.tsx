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
import { HospitalizationView } from '@/components/vet/hospitalization/hospitalization-view'
import { ClientPortal } from '@/components/vet/client-portal'
import { GuideModal } from '@/components/vet/guide-modal'
import { SettingsDialog } from '@/components/vet/settings-dialog'
import { useApplyClinicSettings } from '@/lib/vet-clinic-hooks'

export type ModuleKey =
  | 'dashboard'
  | 'patients'
  | 'clients'
  | 'appointments'
  | 'emr'
  | 'hospitalization'
  | 'inventory'
  | 'billing'
  | 'staff'

export type ViewMode = 'staff' | 'client'

export default function Home() {
  const [view, setView] = useState<ViewMode>('staff')
  const [active, setActive] = useState<ModuleKey>('dashboard')
  const [guideOpen, setGuideOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Aplicar settings al documento (CSS variables + dark mode + brand name)
  useApplyClinicSettings()

  if (view === 'client') {
    return (
      <div className="min-h-screen bg-muted/30">
        <ClientPortal view={view} onViewChange={setView} />
        <GuideModal open={guideOpen} onOpenChange={setGuideOpen} />
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Sidebar
        active={active}
        onChange={setActive}
        view={view}
        onViewChange={setView}
        onOpenGuide={() => setGuideOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <main className="flex-1 overflow-x-hidden">
        {active === 'dashboard' && <Dashboard onNavigate={setActive} />}
        {active === 'patients' && <PatientsView />}
        {active === 'clients' && <ClientsView />}
        {active === 'appointments' && <AppointmentsView />}
        {active === 'emr' && <EmrView />}
        {active === 'hospitalization' && <HospitalizationView />}
        {active === 'inventory' && <InventoryView />}
        {active === 'billing' && <BillingView />}
        {active === 'staff' && <StaffView />}
      </main>
      <GuideModal open={guideOpen} onOpenChange={setGuideOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
