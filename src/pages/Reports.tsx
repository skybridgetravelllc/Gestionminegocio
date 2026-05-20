import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { supabase } from '../lib/supabase';
import { Download, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function Reports() {
  const [stats, setStats] = useState({
    totalReservations: 0,
    totalRevenue: 0,
    avgReservationValue: 0,
    growthRate: 0,
  });
  const [reservationsByType, setReservationsByType] = useState<any[]>([]);
  const [revenueByMonth, setRevenueByMonth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      setLoading(true);

      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*');

      if (error) throw error;

      const totalRevenue = reservations.reduce(
        (sum, r) => sum + (r.total_amount || 0),
        0
      );
      const avgValue =
        reservations.length > 0 ? totalRevenue / reservations.length : 0;

      setStats({
        totalReservations: reservations.length,
        totalRevenue,
        avgReservationValue: avgValue,
        growthRate: 15.2,
      });

      const typeData = reservations.reduce((acc: any, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {});

      setReservationsByType(
        Object.entries(typeData).map(([type, count]) => ({
          name: type,
          value: count,
        }))
      );

      const monthlyData = [
        { month: 'Ene', revenue: 45000 },
        { month: 'Feb', revenue: 52000 },
        { month: 'Mar', revenue: 48000 },
        { month: 'Abr', revenue: 61000 },
        { month: 'May', revenue: 55000 },
        { month: 'Jun', revenue: 67000 },
      ];
      setRevenueByMonth(monthlyData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-1">
            Análisis y métricas del negocio
          </p>
        </div>
        <Button>
          <Download className="w-5 h-5 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Reservas</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalReservations}
          </p>
          <p className="text-sm text-green-600 mt-1">
            +{stats.growthRate}% este mes
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Ingresos Totales</p>
          <p className="text-3xl font-bold text-gray-900">
            ${stats.totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">USD</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Valor Promedio</p>
          <p className="text-3xl font-bold text-gray-900">
            ${stats.avgReservationValue.toFixed(0)}
          </p>
          <p className="text-sm text-gray-600 mt-1">por reserva</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Tasa de Crecimiento</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.growthRate}%
          </p>
          <p className="text-sm text-green-600 mt-1">vs mes anterior</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ingresos Mensuales
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2}
                name="Ingresos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Reservas por Tipo
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reservationsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {reservationsByType.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Rendimiento por Empleado
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reservas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingresos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promedio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Empleado Ejemplo
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  42
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  $45,320
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  $1,079
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
