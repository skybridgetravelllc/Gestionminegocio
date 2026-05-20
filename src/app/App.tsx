import { useState } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Flights } from '../pages/Flights';
import { Hotels } from '../pages/Hotels';
import { Clients } from '../pages/Clients';
import { Messages } from '../pages/Messages';
import { Calls } from '../pages/Calls';
import { Reservations } from '../pages/Reservations';
import { Reports } from '../pages/Reports';
import { Settings } from '../pages/Settings';
import { DashboardLayout } from '../components/layout/DashboardLayout';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'flights':
        return <Flights />;
      case 'hotels':
        return <Hotels />;
      case 'clients':
        return <Clients />;
      case 'messages':
        return <Messages />;
      case 'calls':
        return <Calls />;
      case 'reservations':
        return <Reservations />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}