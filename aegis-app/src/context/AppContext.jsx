import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState('baseline');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [aiMemoryOpen, setAiMemoryOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  // Globe Layers State
  const [globeLayers, setGlobeLayers] = useState({
    shippingRoutes: true,
    energyFlow: true,
    riskZones: true,
    strategicPorts: true,
    legend: true,
  });

  const toggleGlobeLayer = (layerKey) => {
    setGlobeLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  return (
    <AppContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        activeScenario,
        setActiveScenario,
        activeTab,
        setActiveTab,
        commandPaletteOpen,
        setCommandPaletteOpen,
        reportModalOpen,
        setReportModalOpen,
        notificationDrawerOpen,
        setNotificationDrawerOpen,
        aiMemoryOpen,
        setAiMemoryOpen,
        globalSearchOpen,
        setGlobalSearchOpen,
        globeLayers,
        toggleGlobeLayer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
