# Guía Rápida - SkyBridge Travel

## Paso 1: Configurar Base de Datos (5 minutos)

1. Abre tu proyecto Supabase: https://app.supabase.com/project/ybyhwotxrtpvelotkcyd
2. Ve a **SQL Editor** (ícono de base de datos en el menú lateral)
3. Click en **New Query**
4. Copia TODO el contenido de `supabase_setup.sql`
5. Pégalo en el editor
6. Click en **Run** (o presiona Ctrl/Cmd + Enter)
7. Verifica que veas el mensaje de éxito

## Paso 2: Crear tu Usuario Administrador (2 minutos)

### Método Rápido (Recomendado):

1. Ve a **Authentication** > **Users** en Supabase
2. Click **Add User** o **Invite User**
3. Email: `admin@skybridge.com` (o tu email preferido)
4. Password: Tu contraseña segura (mínimo 8 caracteres)
5. ✅ Marca **Auto Confirm User** 
6. Click **Create User**
7. **IMPORTANTE**: Copia el UUID del usuario (ej: `550e8400-e29b-41d4-a716-446655440000`)
8. Ve a **Table Editor** > **employees**
9. Click **Insert** > **Insert row**
10. Llena los campos:
    - **id**: Pega el UUID que copiaste
    - **email**: admin@skybridge.com (el mismo email)
    - **full_name**: "Director General" (o tu nombre)
    - **role**: Selecciona `director_general`
    - **status**: Selecciona `available`
11. Click **Save**

## Paso 3: Iniciar Sesión (30 segundos)

1. La aplicación ya está corriendo
2. Verás la pantalla de login de SkyBridge Travel
3. Ingresa:
   - Usuario: admin@skybridge.com
   - Contraseña: [tu contraseña]
4. Click **Iniciar Sesión**

## Paso 4: Crear Empleados (Opcional)

1. Una vez dentro, ve a **Configuración** (último ítem del menú)
2. Click **Agregar Empleado**
3. Llena los datos:
   - Nombre Completo
   - Correo Electrónico
   - Contraseña
   - Rol (Empleado, Supervisor, Director General)
4. Click **Crear Empleado**
5. Repite para cada empleado

## Paso 5: Probar Funcionalidades

### Búsqueda de Vuelos:
1. Click en **Vuelos** en el menú
2. Ingresa:
   - Origen: `JFK` (Nueva York)
   - Destino: `LAX` (Los Ángeles)
   - Fecha: Cualquier fecha futura
   - Pasajeros: 1
3. Click **Buscar Vuelos**
4. ¡Deberías ver resultados reales!

### Búsqueda de Hoteles:
1. Click en **Hoteles**
2. Ingresa:
   - Destino: `New York` o `London`
   - Check-in: Fecha futura
   - Check-out: 2-3 días después
   - Adultos: 2
3. Click **Buscar Hoteles**
4. ¡Deberías ver resultados reales!

### Mensajería Interna:
1. Primero crea al menos 2 empleados
2. Inicia sesión con el primer empleado
3. Ve a **Mensajes**
4. Selecciona el segundo empleado
5. Envía un mensaje
6. Abre otra ventana de incógnito
7. Inicia sesión con el segundo empleado
8. Ve a **Mensajes**
9. ¡Deberías ver el mensaje en tiempo real!

### Sistema de Llamadas:
1. Con 2 empleados activos
2. Ve a **Llamadas**
3. Click en **Llamar** junto al nombre de un empleado
4. El otro empleado recibirá la llamada
5. Puede contestar o rechazar

## Problemas Comunes

### ❌ "Error al iniciar sesión"
- Verifica que el email esté confirmado en Supabase Auth
- Verifica que el usuario exista en la tabla `employees`
- Verifica que el rol esté bien escrito: `director_general`, `supervisor`, o `employee`

### ❌ "No puedo ver algunos menús"
- Verifica tu rol en la tabla employees
- Solo el Director General ve "Configuración"
- Solo Director y Supervisor ven "Reportes"

### ❌ "Error al buscar vuelos/hoteles"
- Las APIs pueden tener límites de rate
- Espera un momento e intenta nuevamente
- Verifica que el RapidAPI key esté activo

### ❌ "No funciona el chat en tiempo real"
- Verifica que Realtime esté habilitado en Supabase
- Ve a Settings > API > Realtime
- Debe estar ON

### ❌ "Las llamadas no conectan"
- WebRTC requiere HTTPS en producción
- En desarrollo local funciona con HTTP
- Verifica permisos del micrófono en el navegador

## Credenciales del Sistema

### Supabase:
- URL: `https://ybyhwotxrtpvelotkcyd.supabase.co`
- Anon Key: Ya configurada en el código
- Service Role: Ya configurada (solo backend)

### RapidAPI:
- Key: `64f8c405ebmsh6f6e46adfdb4015p11800ajsnca51de007226`
- Ya configurada en el código

## Estructura de Roles

```
Director General
  └─ Acceso total
  └─ Crear/editar/eliminar empleados
  └─ Ver reportes
  └─ Monitorear llamadas
  └─ Configuración del sistema

Supervisor
  └─ Ver reportes
  └─ Monitorear empleados
  └─ Escuchar llamadas
  └─ Sin acceso a configuración

Empleado
  └─ Buscar vuelos/hoteles
  └─ Atender clientes
  └─ Mensajes
  └─ Llamadas
  └─ Gestionar reservas
```

## Próximos Pasos

1. ✅ Configura la base de datos
2. ✅ Crea tu usuario administrador
3. ✅ Inicia sesión
4. ✅ Crea empleados
5. ✅ Prueba las búsquedas
6. ✅ Prueba mensajería
7. ✅ Configura tu perfil
8. 🎉 ¡Empieza a usar el sistema!

## Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica que Supabase esté respondiendo
3. Confirma que las tablas existen
4. Verifica que el usuario esté en `employees`

¡Listo! Tu sistema SkyBridge Travel está operativo y funcional.
