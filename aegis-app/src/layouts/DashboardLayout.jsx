import React, { useState } from 'react';
import { Header } from '../components/organisms/Header';
import { Sidebar } from '../components/organisms/Sidebar';
import { CommandPaletteModal } from '../components/organisms/CommandPaletteModal';
import { ReportGeneratorModal } from '../components/organisms/ReportGeneratorModal';
import { NotificationDrawer } from '../components/organisms/NotificationDrawer';
import { AiMemoryPanel } from '../components/organisms/AiMemoryPanel';
import { GlobalSearchModal } from '../components/organisms/GlobalSearchModal';
import { CrisisSimulationOverlay } from '../components/organisms/CrisisSimulationOverlay';
import { SystemSettingsModal } from '../components/organisms/SystemSettingsModal';

export function DashboardLayout({ children, activeTab, setActiveTab }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
      <Header />
      <div className="flex flex-1 relative">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-x-hidden min-w-0 pb-12">
          {children}
        </main>
      </div>

      {/* Global Command Center Modals */}
      <CommandPaletteModal />
      <ReportGeneratorModal />
      <NotificationDrawer />
      <AiMemoryPanel />
      <GlobalSearchModal />
      <CrisisSimulationOverlay />
      <SystemSettingsModal />
    </div>
  );
}
