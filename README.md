# SkyBridge Travel - Sistema de Gestión Interno

Plataforma empresarial completa para agencias de viajes con integración real de APIs, Supabase y WebRTC.

## Características Principales

- **Autenticación Real**: Sistema completo con Supabase Auth
- **Búsqueda de Vuelos**: Integración con Skyscanner API (RapidAPI)
- **Búsqueda de Hoteles**: Integración con Booking.com API (RapidAPI)
- **Mensajería Interna**: Sistema de chat en tiempo real con Supabase Realtime
- **Llamadas VoIP**: Sistema de llamadas internas con WebRTC
- **Gestión de Clientes**: Base de datos completa de clientes
- **Gestión de Reservas**: Control total de reservas de vuelos, hoteles, autos
- **Reportes y Analytics**: Gráficos y métricas del negocio
- **Roles y Permisos**: Director General, Supervisor, Empleado
- **Diseño Profesional**: Interfaz moderna y corporativa en modo claro

## Tecnologías

- React 18
- TypeScript
- Tailwind CSS v4
- Supabase (Auth, Database, Realtime)
- RapidAPI (Skyscanner, Booking.com, Expedia)
- WebRTC (Simple-Peer)
- Recharts (Gráficos)
- Vite

## Configuración Inicial

### 1. Configurar Supabase

1. Ve a tu proyecto Supabase: https://ybyhwotxrtpvelotkcyd.supabase.co
2. Navega a **SQL Editor**
3. Copia y pega el contenido del archivo `supabase_setup.sql`
4. Ejecuta el script
5. Verifica que todas las tablas se crearon correctamente en **Table Editor**

### 2. Crear Usuario Director General

Opción A - Usando la Interfaz de Supabase:
1. Ve a **Authentication** > **Users**
2. Click en **Add User**
3. Email: `director@skybridge.com` (o tu email)
4. Password: Tu contraseña segura
5. Marca la opción "Auto Confirm Email"
6. Después de crear el usuario, copia su UUID
7. Ve a **Table Editor** > **employees**
8. Inserta un nuevo registro:
   - id: [UUID del usuario]
   - email: [email del usuario]
   - full_name: "Director General"
   - role: "director_general"
   - status: "available"

Opción B - Usando la aplicación:
1. Primero crea un usuario cualquiera en Supabase Auth
2. Inicia sesión en la aplicación
3. Ve manualmente a la tabla employees y cambia tu rol a "director_general"
4. Cierra sesión y vuelve a iniciar sesión
5. Ahora tendrás acceso a Settings para crear más empleados

### 3. Instalación de Dependencias

El proyecto ya tiene todas las dependencias instaladas:
- @supabase/supabase-js
- simple-peer (WebRTC)
- socket.io-client
- react-router-dom
- recharts
- lucide-react

## Estructura del Proyecto

```
src/
├── app/
│   ├── App.tsx                 # Aplicación principal con routing
│   └── components/
│       ├── layout/
│       │   ├── Sidebar.tsx     # Menú lateral colapsable
│       │   ├── TopBar.tsx      # Barra superior
│       │   └── DashboardLayout.tsx
│       └── ui/
│           ├── Button.tsx
│           └── Input.tsx
├── pages/
│   ├── Login.tsx               # Página de inicio de sesión
│   ├── Dashboard.tsx           # Panel principal con métricas
│   ├── Flights.tsx             # Búsqueda de vuelos (RapidAPI)
│   ├── Hotels.tsx              # Búsqueda de hoteles (RapidAPI)
│   ├── Clients.tsx             # Gestión de clientes
│   ├── Messages.tsx            # Sistema de mensajería
│   ├── Calls.tsx               # Sistema de llamadas VoIP
│   ├── Reservations.tsx        # Gestión de reservas
│   ├── Reports.tsx             # Reportes (Director/Supervisor)
│   └── Settings.tsx            # Configuración (Solo Director)
├── contexts/
│   └── AuthContext.tsx         # Contexto de autenticación
├── lib/
│   └── supabase.ts             # Cliente Supabase y tipos
└── styles/
    ├── theme.css
    └── fonts.css
```

## Roles y Permisos

### Director General
- Acceso completo a todo el sistema
- Crear, editar y eliminar empleados
- Cambiar roles y contraseñas
- Ver todos los reportes
- Monitorear llamadas

### Supervisor
- Monitorear empleados
- Escuchar llamadas activas
- Ver reportes
- No puede gestionar empleados

### Empleado
- Buscar vuelos y hoteles
- Atender clientes
- Mensajería interna
- Recibir y hacer llamadas
- Gestionar reservas
- Sin acceso a reportes ni configuración

## Integración de APIs

### RapidAPI Key
```
64f8c405ebmsh6f6e46adfdb4015p11800ajsnca51de007226
```

### APIs Integradas

1. **Skyscanner Flights**
   - Endpoint: `https://sky-scrapper.p.rapidapi.com/api/v2/flights/searchFlightsComplete`
   - Búsqueda completa de vuelos con precios reales

2. **Booking.com Hotels**
   - Endpoint: `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels`
   - Búsqueda de hoteles con disponibilidad

## Funcionalidades Clave

### Sistema de Mensajería
- Chat en tiempo real entre empleados
- Estados: disponible, ocupado, ausente
- Notificaciones de mensajes nuevos
- Historial de conversaciones

### Sistema de Llamadas
- Llamadas VoIP internas con WebRTC
- Transferencia de llamadas
- Historial de llamadas
- Monitoreo para supervisores
- Estados de agentes

### Búsqueda de Vuelos
- Búsqueda por código IATA
- Filtros de clase (económica, ejecutiva, primera)
- Múltiples pasajeros
- Vuelos de ida o ida y vuelta
- Resultados con precios reales

### Búsqueda de Hoteles
- Búsqueda por ciudad/destino
- Fechas de check-in/check-out
- Número de huéspedes y habitaciones
- Calificaciones y reseñas
- Precios en tiempo real

## Notas Importantes

1. **No usar datos mock**: Todas las funcionalidades están conectadas a APIs reales
2. **Supabase RLS**: Las políticas de seguridad están configuradas
3. **WebRTC**: Requiere HTTPS en producción para funcionar
4. **Realtime**: Mensajes y llamadas funcionan en tiempo real
5. **Responsive**: Diseñado para desktop, laptop y tablet

## Próximos Pasos

1. Ejecutar el script SQL en Supabase
2. Crear el usuario Director General
3. Iniciar sesión en la aplicación
4. Crear empleados desde Settings
5. Probar búsquedas de vuelos y hoteles
6. Probar sistema de mensajería
7. Configurar llamadas WebRTC

## Soporte

Para problemas o preguntas:
- Verifica que Supabase esté configurado correctamente
- Revisa la consola del navegador para errores
- Verifica que las credenciales de RapidAPI sean válidas
- Confirma que los usuarios estén en la tabla employees

## Deploy en Cloudflare Pages

El proyecto está optimizado para Cloudflare Pages:
- Build command: Ya configurado
- Compatible con Vite
- Variables de entorno configuradas
- Sin uso de Node.js específico
