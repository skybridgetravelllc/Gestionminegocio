import { useState } from 'react';
import {
  Home,
  Plane,
  Hotel,
  Users,
  MessageSquare,
  Phone,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut, isDirectorGeneral, isSupervisor } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home, forAll: true },
    { id: 'flights', label: 'Vuelos', icon: Plane, forAll: true },
    { id: 'hotels', label: 'Hoteles', icon: Hotel, forAll: true },
    { id: 'clients', label: 'Clientes', icon: Users, forAll: true },
    { id: 'messages', label: 'Mensajes', icon: MessageSquare, forAll: true },
    { id: 'calls', label: 'Llamadas', icon: Phone, forAll: true },
    { id: 'reservations', label: 'Reservas', icon: Calendar, forAll: true },
    {
      id: 'reports',
      label: 'Reportes',
      icon: BarChart3,
      forAll: false,
      requiresRole: ['director_general', 'supervisor'],
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      forAll: false,
      requiresRole: ['director_general'],
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const canAccessItem = (item: any) => {
    if (item.forAll) return true;
    if (item.requiresRole) {
      if (isDirectorGeneral) return true;
      if (isSupervisor && item.requiresRole.includes('supervisor')) return true;
    }
    return false;
  };

  return (
    <div
      className={clsx(
        'h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">SkyBridge</h1>
              <p className="text-xs text-gray-500">Travel</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.filter(canAccessItem).map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={clsx(
                'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Salir</span>}
        </button>
      </div>
    </div>
  );
}
