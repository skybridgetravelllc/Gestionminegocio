import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, User } from 'lucide-react';
import { supabase, Employee, UserRole } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function Settings() {
  const { isDirectorGeneral } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'employee' as UserRole,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDirectorGeneral) {
      loadEmployees();
    }
  }, [isDirectorGeneral]);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleCreateEmployee = async () => {
    if (!newEmployee.email || !newEmployee.password || !newEmployee.full_name) {
      alert('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: newEmployee.email,
          password: newEmployee.password,
          email_confirm: true,
        });

      if (authError) throw authError;

      if (authData.user) {
        const { error: employeeError } = await supabase
          .from('employees')
          .insert({
            id: authData.user.id,
            email: newEmployee.email,
            full_name: newEmployee.full_name,
            role: newEmployee.role,
          });

        if (employeeError) throw employeeError;

        setShowAddModal(false);
        setNewEmployee({
          email: '',
          password: '',
          full_name: '',
          role: 'employee',
        });
        loadEmployees();
      }
    } catch (error: any) {
      console.error('Error creating employee:', error);
      alert(error.message || 'Error al crear empleado');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este empleado?')) return;

    try {
      const { error } = await supabase.from('employees').delete().eq('id', id);

      if (error) throw error;

      await supabase.auth.admin.deleteUser(id);

      loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Error al eliminar empleado');
    }
  };

  if (!isDirectorGeneral) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600">
            Solo el Director General puede acceder a esta sección
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">
            Gestión de empleados y configuración del sistema
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Agregar Empleado
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Empleados del Sistema
        </h2>

        <div className="space-y-4">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  {employee.avatar_url ? (
                    <img
                      src={employee.avatar_url}
                      alt={employee.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {employee.full_name}
                  </h3>
                  <p className="text-sm text-gray-600">{employee.email}</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
                    {employee.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteEmployee(employee.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Agregar Nuevo Empleado
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nombre Completo
                </label>
                <Input
                  value={newEmployee.full_name}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, full_name: e.target.value })
                  }
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <Input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, email: e.target.value })
                  }
                  placeholder="juan@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <Input
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, password: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Rol
                </label>
                <select
                  value={newEmployee.role}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      role: e.target.value as UserRole,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="employee">Empleado</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="director_general">Director General</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-6">
              <Button
                onClick={handleCreateEmployee}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creando...' : 'Crear Empleado'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
