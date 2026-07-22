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
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Location the globe should fly to / highlight, set by search or clicking a marker.
  // Shape: { id, label, lat, lng, kind: 'country' | 'port', meta } | null
  const [focusTarget, setFocusTargetState] = useState(null);
  const [focusRequestId, setFocusRequestId] = useState(0);

  // Always bump focusRequestId so the globe re-flies even if the same target is picked twice
  const setFocusTarget = (target) => {
    setFocusTargetState(target);
    setFocusRequestId((id) => id + 1);
  };

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
        settingsOpen,
        setSettingsOpen,
        globeLayers,
        toggleGlobeLayer,
        focusTarget,
        focusRequestId,
        setFocusTarget,
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
