import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { MapPage } from './pages/MapPage';
import { StationsPage } from './pages/StationsPage';
import { StationDetailsPage } from './pages/StationDetailsPage';
import { AnomaliesPage } from './pages/AnomaliesPage';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { HistoricalDataPage } from './pages/HistoricalDataPage';
import { DataUploadPage } from './pages/DataUploadPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { AdminPage } from './pages/AdminPage';
import { SensorHealthPage } from './pages/SensorHealthPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { DocumentationPage } from './pages/DocumentationPage';
import { useState } from 'react';

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => Boolean(localStorage.getItem('skyguard_token')));
  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={() => setAuthenticated(true)} />} />
      <Route
        path="/*"
        element={
          authenticated ? (
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/live-monitoring" element={<LiveMonitoringPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/stations" element={<StationsPage />} />
                <Route path="/stations/:stationId" element={<StationDetailsPage />} />
                <Route path="/anomalies" element={<AnomaliesPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/historical-data" element={<HistoricalDataPage />} />
                <Route path="/data-upload" element={<DataUploadPage />} />
                <Route path="/ai-insights" element={<AIInsightsPage />} />
                <Route path="/sensor-health" element={<SensorHealthPage />} />
                <Route path="/maintenance" element={<MaintenancePage />} />
                <Route path="/system-health" element={<SystemHealthPage />} />
                <Route path="/documentation" element={<DocumentationPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}
