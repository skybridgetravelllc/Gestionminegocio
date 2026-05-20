import { useEffect, useState } from 'react';
import { Users, Phone, Calendar, TrendingUp, Plane, Hotel } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { employee } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeCalls: 0,
    totalReservations: 0,
    todayReservations: 0,
  });
  const [recentReservations, setRecentReservations] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [employeesRes, callsRes, reservationsRes, todayRes] =
        await Promise.all([
          supabase.from('employees').select('id', { count: 'exact' }),
          supabase
            .from('calls')
            .select('id', { count: 'exact' })
            .eq('status', 'active'),
          supabase.from('reservations').select('id', { count: 'exact' }),
          supabase
            .from('reservations')
            .select('id', { count: 'exact' })
            .gte(
              'created_at',
              new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
            ),
        ]);

      const recentRes = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalEmployees: employeesRes.count || 0,
        activeCalls: callsRes.count || 0,
        totalReservations: reservationsRes.count || 0,
        todayReservations: todayRes.count || 0,
      });

      setRecentReservations(recentRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const statCards = [
    {
      label: 'Empleados Conectados',
      value: stats.totalEmployees,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Llamadas Activas',
      value: stats.activeCalls,
      icon: Phone,
      color: 'green',
    },
    {
      label: 'Reservas Hoy',
      value: stats.todayReservations,
      icon: Calendar,
      color: 'purple',
    },
    {
      label: 'Total Reservas',
      value: stats.totalReservations,
      icon: TrendingUp,
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {employee?.full_name}
        </h1>
        <p className="text-gray-600 mt-1">
          Panel de control - SkyBridge Travel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Reservas Recientes
          </h2>
          <div className="space-y-3">
            {recentReservations.length > 0 ? (
              recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {reservation.type === 'flight' ? (
                      <Plane className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Hotel className="w-5 h-5 text-purple-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {reservation.client_name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {reservation.type} - {reservation.status}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ${reservation.total_amount?.toLocaleString() || '0'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                No hay reservas recientes
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad del Sistema
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estado del Sistema</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Operativo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Última Actualización</span>
              <span className="text-sm text-gray-900">
                {new Date().toLocaleTimeString('es-ES')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mensajes Pendientes</span>
              <span className="text-sm font-semibold text-gray-900">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
