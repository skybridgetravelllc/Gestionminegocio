-- SkyBridge Travel - Supabase Database Setup
-- Ejecuta este script en tu dashboard de Supabase (SQL Editor)

-- Tabla de empleados
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('director_general', 'supervisor', 'employee')),
  avatar_url TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'away')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_reservations INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de llamadas
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('ringing', 'active', 'ended', 'missed')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER
);

-- Tabla de señales de llamada (para WebRTC)
CREATE TABLE IF NOT EXISTS call_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  signal JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('flight', 'hotel', 'car', 'package')),
  details JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  total_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de logs de actividad
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para employees
CREATE POLICY "Employees can view all employees"
  ON employees FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Employees can update their own profile"
  ON employees FOR UPDATE
  USING (auth.uid() = id);

-- Políticas RLS para clients
CREATE POLICY "Employees can view all clients"
  ON clients FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Employees can insert clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Employees can update clients"
  ON clients FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Políticas RLS para messages
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Políticas RLS para calls
CREATE POLICY "Users can view their own calls"
  ON calls FOR SELECT
  USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can initiate calls"
  ON calls FOR INSERT
  WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can update their calls"
  ON calls FOR UPDATE
  USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Políticas RLS para call_signals
CREATE POLICY "Users can view their own call signals"
  ON call_signals FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send call signals"
  ON call_signals FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Políticas RLS para reservations
CREATE POLICY "Employees can view all reservations"
  ON reservations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Employees can insert reservations"
  ON reservations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Employees can update reservations"
  ON reservations FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Políticas RLS para activity_logs
CREATE POLICY "Employees can view activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Employees can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas RLS para notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = employee_id);

-- Habilitar Realtime para las tablas necesarias
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE calls;
ALTER PUBLICATION supabase_realtime ADD TABLE call_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE employees;

-- Función para actualizar el timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear un usuario Director General inicial (opcional)
-- NOTA: Debes ejecutar esto después de crear el usuario en el panel de autenticación
-- O usar la interfaz de Settings dentro de la aplicación

-- Insertar datos de ejemplo (opcional - comentar si no deseas datos de prueba)
-- INSERT INTO clients (full_name, email, phone) VALUES
--   ('Juan Pérez', 'juan@example.com', '+1234567890'),
--   ('María García', 'maria@example.com', '+0987654321');

COMMENT ON TABLE employees IS 'Empleados del sistema con roles y permisos';
COMMENT ON TABLE clients IS 'Base de datos de clientes';
COMMENT ON TABLE messages IS 'Sistema de mensajería interna en tiempo real';
COMMENT ON TABLE calls IS 'Registro de llamadas VoIP';
COMMENT ON TABLE call_signals IS 'Señales WebRTC para llamadas';
COMMENT ON TABLE reservations IS 'Reservas de vuelos, hoteles, autos, etc.';
COMMENT ON TABLE activity_logs IS 'Logs de actividad del sistema';
COMMENT ON TABLE notifications IS 'Notificaciones para empleados';
