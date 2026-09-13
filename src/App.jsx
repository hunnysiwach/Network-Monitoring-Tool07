import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DemoBanner from './components/DemoBanner';
import { api } from './services/api';

// Pages
import DashboardPage from './pages/DashboardPage';
import NetworkPage from './pages/NetworkPage';
import ProcessesPage from './pages/ProcessesPage';
import UsersPage from './pages/UsersPage';
import HistoryPage from './pages/HistoryPage';
import AlertsPage from './pages/AlertsPage';
import FileMonitorPage from './pages/FileMonitorPage';
import ServicePage from './pages/ServicePage';
import DoctorPage from './pages/DoctorPage';
import ReportsPage from './pages/ReportsPage';
import ConfigurationPage from './pages/ConfigurationPage';
import DocumentationPage from './pages/DocumentationPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [config, setConfig] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [timeRange, setTimeRange] = useState('15m');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchCoreTelemetry = async () => {
    try {
      const [dash, conf, srv] = await Promise.all([
        api.getDashboard(timeRange),
        api.getConfig(),
        api.getServiceStatus()
      ]);
      setDashboardData(dash);
      setConfig(conf);
      setServiceStatus(srv);
      setIsDemoMode(dash.telemetry?.demoMode || conf.DEMO_MODE || false);
    } catch (err) {
      console.error('Error fetching core telemetry:', err);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchCoreTelemetry();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleToggleDemo = async () => {
    try {
      const res = await api.toggleDemoMode();
      setIsDemoMode(res.demoMode);
      fetchCoreTelemetry();
    } catch (err) {
      console.error('Failed to toggle demo mode:', err);
    }
  };

  useEffect(() => {
    fetchCoreTelemetry();
    const interval = setInterval(fetchCoreTelemetry, 2000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const activeAlertCount = dashboardData?.alertCounts?.active || 0;

  return (
    <div className="flex h-screen bg-[#0a0f1d] text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        alertCount={activeAlertCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          telemetry={dashboardData?.telemetry}
          serviceStatus={serviceStatus}
          jsonStatus={dashboardData?.jsonStatus}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
          isDemoMode={isDemoMode}
          onToggleDemo={handleToggleDemo}
        />

        {/* Demo Mode Notice Banner */}
        <DemoBanner isDemoMode={isDemoMode} onToggle={handleToggleDemo} />

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentPage === 'dashboard' && (
            <DashboardPage
              dashboardData={dashboardData}
              timeRange={timeRange}
              onRangeChange={setTimeRange}
              onNavigate={setCurrentPage}
              config={config}
            />
          )}
          {currentPage === 'network' && <NetworkPage />}
          {currentPage === 'processes' && <ProcessesPage />}
          {currentPage === 'users' && <UsersPage />}
          {currentPage === 'history' && <HistoryPage />}
          {currentPage === 'alerts' && <AlertsPage />}
          {currentPage === 'file-monitor' && <FileMonitorPage />}
          {currentPage === 'service' && <ServicePage />}
          {currentPage === 'doctor' && <DoctorPage />}
          {currentPage === 'reports' && <ReportsPage />}
          {currentPage === 'configuration' && <ConfigurationPage />}
          {currentPage === 'documentation' && <DocumentationPage />}
          {currentPage === 'about' && <AboutPage />}
          {currentPage === 'privacy' && <PrivacyPage />}
        </main>
      </div>
    </div>
  );
}
