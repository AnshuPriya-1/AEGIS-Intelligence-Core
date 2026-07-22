import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { SimulationProvider } from './context/SimulationContext';
import { StartupLoader } from './pages/StartupLoader';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DashboardLayout } from './layouts/DashboardLayout';

function AppShell() {
  const [stage, setStage] = useState('loader'); // 'loader' | 'landing' | 'login' | 'dashboard'
  const { activeTab, setActiveTab } = useApp();

  const handleStartupComplete = () => {
    setStage('landing');
  };

  const handleEnterDashboard = () => {
    setStage('dashboard');
  };

  const handleGoLogin = () => {
    setStage('login');
  };

  return (
    <>
      {stage === 'loader' && <StartupLoader onComplete={handleStartupComplete} />}

      {stage === 'landing' && (
        <LandingPage
          onEnterDashboard={handleEnterDashboard}
          onGoLogin={handleGoLogin}
        />
      )}

      {stage === 'login' && (
        <LoginPage
          onLoginSuccess={handleEnterDashboard}
          onBypass={handleEnterDashboard}
        />
      )}

      {stage === 'dashboard' && (
        <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
          <DashboardPage activeTab={activeTab} />
        </DashboardLayout>
      )}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <SimulationProvider>
          <AppShell />
        </SimulationProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
