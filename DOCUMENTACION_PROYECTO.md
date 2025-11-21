# 📱 DOCUMENTACIÓN DEL PROYECTO - AGENDA OFFLINE SYSERV

**Última actualización**: 2025-11-20
**Versión**: 0.0.1
**Estado**: En Desarrollo - Migración a localStorage Completa

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura y Tecnologías](#arquitectura-y-tecnologías)
3. [Estado Actual del Proyecto](#estado-actual-del-proyecto)
4. [Análisis de Requisitos](#análisis-de-requisitos)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Componentes Implementados](#componentes-implementados)
7. [Gaps y Pendientes](#gaps-y-pendientes)
8. [Roadmap de Desarrollo](#roadmap-de-desarrollo)
9. [Changelog](#changelog)
10. [Notas Técnicas](#notas-técnicas)

---

## 🎯 RESUMEN EJECUTIVO

### Objetivo
Desarrollar una aplicación móvil **offline-first** para Android e iOS que permita a los negocios registrados en SyServ consultar y gestionar su agenda de citas cuando no tienen conexión a internet.

### Alcance
- **Consulta de agenda**: Visualización de citas programadas
- **Gestión offline**: Crear, editar y cancelar citas sin internet
- **Sincronización automática**: Bidireccional cuando se recupera conectividad
- **Multi-tenant**: Soporte para múltiples empresas con aislamiento de datos

### Contexto
Esta app es un **complemento del sistema web SyServ existente**, no un reemplazo. El backend PHP ya está desarrollado y operativo. La app consume sus APIs y funciona como capa offline.

---

## 🏗️ ARQUITECTURA Y TECNOLOGÍAS

### Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Framework Principal | Angular | 20.0.0 |
| UI Framework | Ionic | 8.0.0 |
| Plataforma Nativa | Capacitor | 7.4.4 |
| Almacenamiento Local | localStorage | HTML5 API |
| Base de Datos Local | SQLite (comentado) | 7.0.2 |
| Lenguaje | TypeScript | 5.8.0 |
| Gestión de Estado | RxJS Observables | 7.8.0 |

### Dependencias Clave Instaladas
```json
{
  "@capacitor-community/sqlite": "^7.0.2",
  "@capacitor/app": "7.1.0",
  "@capacitor/android": "^7.4.4",
  "@capacitor/ios": "^7.4.4",
  "@ionic/angular": "^8.0.0"
}
```

### Arquitectura de Componentes
- **Standalone Components**: Sin NgModules (arquitectura moderna de Angular)
- **Lazy Loading**: Carga bajo demanda de páginas
- **Reactive Programming**: RxJS para manejo de estado asíncrono

---

## ✅ ESTADO ACTUAL DEL PROYECTO

### Resumen General
**Progreso UI/Diseño**: 85%
**Progreso Lógica de Negocio**: 40%
**Progreso Integración APIs**: 0%
**Progreso Sistema Offline**: 30%

### ⚡ Cambio Crítico Reciente: Migración a localStorage
**Fecha**: 2025-11-20 | **Commit**: 390b1ab

Se completó la migración de SQLite a localStorage como sistema de almacenamiento primario debido a problemas de inicialización de SQLite en dispositivos Android. La agenda ahora funciona correctamente tanto en navegador web como en APK de Android.

**Razones del cambio**:
- SQLite presentaba problemas de inicialización en Android (DatabaseService no se inicializaba correctamente)
- Código con condicionales de plataforma (`Capacitor.getPlatform()`) causaba comportamiento divergente
- En web funcionaba con datos mock de localStorage ✓
- En Android intentaba usar SQLite que fallaba → agenda vacía ✗
- localStorage es más simple y suficiente para el alcance actual del proyecto

**Estado actual**:
- ✅ **localStorage**: Sistema primario funcional en todas las plataformas
- 🔄 **SQLite**: Código completo preservado en comentarios para futura depuración
- ✅ **Formulario de citas**: Muestra datos de personal, clientes y servicios correctamente
- ✅ **Vista de agenda**: Despliega configuración y citas en web y Android

**Servicios afectados**:
- `AgendaService`: Métodos `readConfigAgenda()` y `readReservas()` ahora usan localStorage exclusivamente
- `SeedSimpleService`: Incluye población automática de `config_agenda` en localStorage
- `DatabaseService`: Preservado completo en comentarios (17 tablas, 16 índices)

### Módulos Completados

#### 1. ✅ Splash Screen
- **Archivo**: `src/app/features/splash/`
- **Estado**: Completado
- **Funcionalidad**:
  - Animación de entrada con logo "S"
  - Transición automática a login después de 3s
  - Animaciones fluidas

#### 2. ✅ Login Screen
- **Archivo**: `src/app/features/auth/pages/login/`
- **Estado**: Diseño completo, lógica mock
- **Funcionalidad**:
  - Formulario email/password
  - Botones OAuth (Google, Microsoft) - preparados
  - Toggle para mostrar/ocultar contraseña
  - Validaciones básicas de formulario
  - **Modo claro forzado**: Siempre se muestra en modo claro independiente del tema global
  - **Pendiente**: Integración real con AuthService

#### 3. ⚠️ Auth Service
- **Archivo**: `src/app/core/services/auth.service.ts`
- **Estado**: Estructura base implementada
- **Funcionalidad Actual**:
  - Login mock con delay simulado
  - Manejo de usuario con BehaviorSubject
  - Persistencia en localStorage
  - Logout básico
  - Estructura para refresh token
- **Interfaces Definidas**:
  ```typescript
  interface User {
    id: number;
    email: string;
    name: string;
    companyId: number;  // ✅ Multi-tenant preparado
    token: string;
  }
  ```
- **Pendiente**:
  - Conectar con API real (`POST /api/auth/login`)
  - Implementar refresh token automático
  - Validación JWT con expiración
  - OAuth real con Google/Microsoft

#### 4. ✅ Menú Principal (Home)
- **Archivo**: `src/app/home/`
- **Estado**: Completado
- **Funcionalidad**:
  - Cards de navegación (Agenda, Perfil, Configuración)
  - Botón de cerrar sesión
  - Animaciones de entrada con delays secuenciales
  - Navegación funcional a Agenda, Perfil y Configuración
  - Soporte completo de modo oscuro
  - Espaciado optimizado entre iconos y texto (1.5rem margin-top)

#### 5. ✅ Vista Principal de Agenda
- **Archivo**: `src/app/features/agenda/pages/agenda-main/`
- **Estado**: Diseño completo, datos mock
- **Funcionalidad**:
  - **Timeline por horas**: 9 AM - 7 PM (configurable)
  - **Calendario semanal**: Selector de días con indicador de "hoy"
  - **Cards de citas**: Visualización destacada con:
    - Hora de inicio
    - Nombre del cliente
    - Servicio
    - Duración
  - **Bottom Navigation**: 5 tabs (Citas, Clientes, Reportes, Marketing, Negocio)
    - Tab "Negocio" muestra perfil del negocio integrado
  - **FAB**: Botón flotante para nueva cita
  - **Menú de opciones**: ActionSheet con:
    - Volver al Menú
    - Configuración
    - Ayuda
    - Cancelar
  - **Loading Screen**: Animación de carga inicial
  - **Soporte completo de modo oscuro** con estilos optimizados

**Ajustes Visuales Realizados**:
- Altura de slot de tiempo: 260px (optimizado para legibilidad)
- Grid slot: 65px por intervalo de 15 minutos
- Card de cita: Padding aumentado (2rem x 1.75rem)
- Tamaños de fuente en citas:
  - Cliente: 1.5rem
  - Servicio: 1.25rem
  - Hora/Duración: 1.125rem
- Etiquetas de hora: 1.125rem

**Datos Mock Actuales**:
```typescript
// Cita de ejemplo en 9:15 AM
{
  clientName: 'Juan Pérez',
  service: 'Corte de Cabello',
  duration: 45,
  status: 'confirmed'
}
```

**Contenido del Tab "Negocio"**:
- Header con avatar y descripción del negocio
- Estadísticas: 4 métricas (citas, clientes, calificación, ingresos)
- Información de contacto (dirección, teléfono, email, sitio web)
- Horarios de atención (lun-dom)
- Servicios ofrecidos (chips interactivos)
- Animaciones secuenciales por card
- Tema oscuro completo

#### 6. ✅ Página de Perfil del Negocio
- **Archivo**: `src/app/features/profile/pages/profile-main/`
- **Estado**: Completado
- **Funcionalidad**:
  - **Header del perfil**:
    - Avatar del negocio (120px)
    - Nombre y descripción
    - Badge de estado (Abierto/Cerrado)
    - Fondo degradado con animación de patrón
  - **Estadísticas del negocio**:
    - Grid 2x2 con métricas clave
    - Iconos con colores temáticos
    - Valores numéricos destacados
  - **Información de contacto**:
    - Dirección física
    - Teléfono
    - Email
    - Sitio web
    - Iconos coloridos por tipo de contacto
  - **Horario de atención**:
    - Tabla completa lun-dom
    - Destacado del día actual
    - Indicador visual de "Cerrado"
  - **Servicios ofrecidos**:
    - Grid de chips interactivos
    - Iconos por tipo de servicio
    - Hover effects
  - **Botón de acción**: "Editar Información del Negocio" (preparado)
  - **Animaciones**: Cards con delays secuenciales (0.1s-0.5s)
  - **Modo oscuro**: Soporte completo con paleta optimizada

**Datos Mock del Perfil**:
```typescript
businessInfo = {
  name: 'Salón Belleza & Estilo',
  logo: 'https://via.placeholder.com/150/3B82F6/FFFFFF?text=BE',
  description: 'Tu salón de confianza con más de 10 años...',
  address: 'Av. Principal 123, Col. Centro, Ciudad de México',
  phone: '+52 55 1234 5678',
  email: 'contacto@bellezaestilo.com',
  website: 'www.bellezaestilo.com',
  status: 'Abierto ahora'
}

stats = [
  { icon: 'calendar-outline', value: '245', label: 'Citas este mes', color: 'primary' },
  { icon: 'people-outline', value: '128', label: 'Clientes activos', color: 'secondary' },
  { icon: 'star-outline', value: '4.8', label: 'Calificación', color: 'warning' },
  { icon: 'cash-outline', value: '$45K', label: 'Ingresos del mes', color: 'success' }
]
```

#### 7. ✅ Página de Configuración
- **Archivo**: `src/app/features/settings/pages/settings-main/`
- **Estado**: Completado
- **Funcionalidad**:
  - **Apariencia**:
    - Toggle de modo oscuro (funcional con localStorage)
    - Aplicación global del tema
    - Persistencia entre sesiones
  - **Notificaciones**:
    - Toggle Push (preparado para integración)
    - Toggle Email (estático)
    - Toggle SMS (estático)
    - Toggle Recordatorios (estático)
    - Slider de volumen (0-100, persiste en localStorage)
  - **Idioma**:
    - Selector con 3 opciones (Español, English, Português)
    - Persistencia en localStorage
    - Preparado para i18n
  - **Almacenamiento**:
    - Indicador de caché usado (45 MB)
    - Botón "Limpiar Caché" (simulado)
    - Botón "Borrar Datos Locales" (preparado)
  - **Privacidad y Soporte**:
    - Enlaces a Política de Privacidad (preparado)
    - Enlaces a Términos de Servicio (preparado)
    - Contactar Soporte (preparado)
  - **Información de la App**:
    - Versión: 1.0.0
    - Botón "Acerca de" (preparado)
  - **Navegación**: Botón para volver al menú
  - **Modo oscuro**: Soporte completo

**Configuraciones Persistentes**:
```typescript
localStorage.setItem('darkMode', 'true/false');
localStorage.setItem('notificationVolume', '0-100');
localStorage.setItem('selectedLanguage', 'es/en/pt');
localStorage.setItem('notificationSettings', JSON.stringify({
  push: true,
  email: false,
  sms: true,
  reminders: true
}));
```

---

## 📊 ANÁLISIS DE REQUISITOS

### Requisitos del Documento (requisitos.txt)

#### ✅ Cumplidos Parcialmente
1. **Autenticación** (30%)
   - ✅ Estructura de login
   - ✅ Persistencia de token en localStorage
   - ❌ JWT real
   - ❌ Refresh token automático
   - ❌ OAuth real

2. **UI/UX de Agenda** (60%)
   - ✅ Vista de día con timeline
   - ✅ Selector semanal
   - ✅ Cards visuales de citas
   - ❌ Vista de semana (scroll horizontal)
   - ❌ Filtros (servicio, personal, estatus)
   - ❌ Indicadores de conectividad

#### ✅ Parcialmente Implementados

3. **Almacenamiento Local** (30%)
   - ✅ **localStorage implementado y funcional**:
     - ✅ StorageService con abstracción genérica
     - ✅ Clientes, Personal, Productos/Servicios en localStorage
     - ✅ Configuración de agenda (horarios, colores, terapeutas)
     - ✅ Array de citas (actualmente vacío, listo para uso)
     - ✅ SeedSimpleService poblando datos de prueba
   - 🔄 **SQLite implementado pero comentado**:
     - 17 tablas completas definidas
     - 16 índices para optimización
     - CRUD completo implementado
     - Soporte multi-tenant preparado
     - Código preservado para futura activación
   - ❌ **Pendiente**:
     - Resolver inicialización de SQLite en Android
     - Sistema de migrations automáticas
     - Tabla `outbox` para cola de sincronización
     - Tabla `sync_state` para marcas de sincronización

#### ❌ No Implementados (CRÍTICOS)

4. **Sincronización Bidireccional** (0%)
   - ❌ Detección de conectividad
   - ❌ Pull de deltas desde servidor
   - ❌ Push de outbox al servidor
   - ❌ Manejo de conflictos
   - ❌ Idempotencia con UUIDs

5. **Operativa Offline** (0%)
   - ❌ Crear citas offline con UUID v4
   - ❌ Editar citas localmente
   - ❌ Cancelar citas
   - ❌ Registro en outbox
   - ❌ Validaciones locales

6. **Consumo de APIs** (0%)
   - ❌ HttpClient configurado
   - ❌ Endpoints implementados:
     - `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`
     - `/api/catalogs?since=timestamp`
     - `/api/agenda?from=YYYY-MM-DD&to=YYYY-MM-DD`
     - `/api/appointments` (POST/PUT/DELETE)
   - ❌ Interceptor para tokens
   - ❌ Retry con backoff exponencial

7. **Multi-tenant** (20%)
   - ✅ Campo `companyId` en User interface
   - ✅ Campo `handel` y `id_empresa_base` en modelos
   - ❌ Aislamiento de datos en BD local
   - ❌ Filtrado por tenant en todas las queries

8. **Validaciones de Negocio** (0%)
   - ❌ Disponibilidad de staff
   - ❌ Detección de solapamientos
   - ❌ Duración conforme a servicios
   - ❌ Ventana de anticipación
   - ❌ Horarios de operación

---

## 📁 ESTRUCTURA DEL PROYECTO

```
agenda/
├── android/                      # ✅ Proyecto Android nativo
├── ios/                          # ✅ Proyecto iOS nativo
├── src/
│   ├── app/
│   │   ├── core/                 # 🟡 Servicios core (Auth implementado)
│   │   │   └── services/
│   │   │       └── auth.service.ts
│   │   ├── features/             # 🟢 Módulos por funcionalidad
│   │   │   ├── auth/
│   │   │   │   └── pages/login/
│   │   │   ├── agenda/
│   │   │   │   └── pages/agenda-main/
│   │   │   └── splash/
│   │   ├── home/                 # ✅ Menú principal
│   │   └── app.routes.ts         # ✅ Rutas configuradas
│   ├── assets/                   # Recursos estáticos
│   ├── theme/                    # ✅ Variables de tema
│   └── environments/             # 🟡 Configuración por entorno
├── capacitor.config.ts           # ⚠️ Pendiente actualizar appId
├── package.json                  # ✅ Dependencias instaladas
├── requisitos.txt                # 📋 Documento de requisitos
└── DOCUMENTACION_PROYECTO.md     # 📄 Este archivo
```

### Leyenda
- ✅ Completado
- 🟢 En buen estado
- 🟡 Parcialmente implementado
- ⚠️ Requiere atención
- ❌ No implementado

---

## 🔧 COMPONENTES IMPLEMENTADOS

### Servicios

#### AuthService (`core/services/auth.service.ts`)
**Propósito**: Manejo de autenticación y sesión de usuario

**Métodos Implementados**:
- `login(email, password)`: Login mock con simulación
- `loginWithGoogle()`: Preparado, sin OAuth real
- `loginWithMicrosoft()`: Preparado, sin OAuth real
- `logout()`: Limpiar sesión
- `refreshToken()`: Mock de renovación
- `isTokenValid()`: Verificación básica

**Propiedades Observables**:
- `currentUser$`: Usuario actual
- `isAuthenticated$`: Estado de autenticación

**Estado**: Mock funcional, listo para conectar con API

#### StorageService (`core/services/storage.service.ts`)
**Propósito**: Abstracción para almacenamiento en localStorage

**Métodos Implementados**:
- `set<T>(key: string, value: T)`: Guardar datos con tipo genérico
- `get<T>(key: string, defaultValue?: T)`: Obtener datos con valor por defecto
- `remove(key: string)`: Eliminar una clave específica
- `clear()`: Limpiar todo el almacenamiento
- `has(key: string)`: Verificar existencia de clave

**Estado**: ✅ Funcional y en uso en toda la aplicación

#### AgendaService (`core/services/agenda.service.ts`)
**Propósito**: Gestión de agenda, citas y generación de calendario (2,277 líneas)

**Métodos Clave Implementados**:
- `readConfigAgenda(fecha: string)`: Lee configuración desde localStorage
- `readReservas(fecha: string)`: Lee citas/reservas desde localStorage
- `genCalendar(fecha: string)`: Algoritmo complejo de generación de calendario
- `readHorariosAgenda(horaInicio, horaFin)`: Genera horarios disponibles
- `setMinutosIncremento(minutos)`: Configuración de intervalos de tiempo

**Características**:
- Algoritmo traducido de PHP original de SyServ
- Soporte para múltiples terapeutas/personal
- Manejo de disponibilidad y citas
- Intervalos configurables (15, 30, 60 minutos)
- Colores por estado de cita (libre, reservada, confirmada, cancelada, cobrado)

**Estado**: ✅ Funcional con localStorage en todas las plataformas (web + Android)

#### SeedSimpleService (`core/services/seed-simple.service.ts`)
**Propósito**: Población de datos de prueba en localStorage

**Métodos Implementados**:
- `hasData()`: Verifica si existen datos en localStorage
- `seedDatabase()`: Puebla localStorage con datos de prueba
- `clearAllData()`: Limpia todos los datos

**Datos de prueba incluidos**:
- 5 clientes de ejemplo (Juan Pérez, María González, etc.)
- 4 personal/terapeutas (Dr. Rodríguez, Dra. Fernández, etc.)
- 6 servicios (Masaje Relajante, Acupuntura, etc.)
- Configuración completa de agenda (horarios, colores, incrementos)
- Array vacío de citas (para ser llenado por el usuario)

**Estado**: ✅ Funcional, se ejecuta automáticamente en primer inicio

#### DatabaseService (`core/services/database.service.ts`)
**Propósito**: Implementación completa de SQLite (ACTUALMENTE COMENTADO)

**Estado**: 🔄 Preservado para futura depuración
**Contenido**:
- 17 tablas definidas (companies, branches, services, staff, appointments, etc.)
- 16 índices para optimización
- Métodos CRUD completos
- Soporte multi-tenant
- Sincronización preparada (outbox, sync_state)

**Razón de estar comentado**: Problemas de inicialización en Android causaban que la agenda apareciera vacía en APK. Se preserva el código completo para futuro uso cuando se resuelvan los problemas de SQLite en Capacitor.

---

### Páginas

#### SplashPage
- **Ruta**: `/splash`
- **Función**: Pantalla inicial con logo y animación
- **Tiempo**: 3 segundos → redirect a login
- **Estado**: ✅ Completado

#### LoginPage
- **Ruta**: `/login`
- **Función**: Autenticación de usuarios
- **Métodos de login**:
  - Email/Password
  - Google OAuth (preparado)
  - Microsoft OAuth (preparado)
- **Estado**: ✅ UI completa, lógica mock

#### HomePage (Menú)
- **Ruta**: `/menu` o `/home`
- **Función**: Menú principal de navegación
- **Opciones**: Agenda, Perfil, Configuración, Logout
- **Estado**: ✅ Completado

#### AgendaMainPage
- **Ruta**: `/agenda`
- **Función**: Vista principal de la agenda
- **Componentes visuales**:
  - Banner superior motivacional
  - Header con notificaciones
  - Calendario semanal (7 días)
  - Timeline de citas (9 AM - 7 PM)
  - FAB para nueva cita
  - Bottom navigation (5 tabs)
  - ActionSheet de opciones
- **Estado**: ✅ UI completa, datos hardcoded

---

## 🔴 GAPS Y PENDIENTES

### CRÍTICOS (Bloqueantes para funcionalidad offline)

#### 1. Storage System ✅ RESUELTO CON localStorage
**Prioridad**: 🟢 COMPLETADO
**Archivos existentes**:
- `src/app/core/services/storage.service.ts` ✅ Funcional
- `src/app/core/services/database.service.ts` 🔄 Preservado en comentarios

**Estado actual**:
- ✅ localStorage implementado y funcional en todas las plataformas
- ✅ StorageService proporciona abstracción limpia
- ✅ Datos de prueba poblados automáticamente con SeedSimpleService
- 🔄 SQLite completamente implementado pero comentado para futura migración

**Tareas futuras (opcional - solo si se necesita SQLite)**:
- [ ] Resolver problemas de inicialización de SQLite en Android
- [ ] Descomentar y activar DatabaseService
- [ ] Migrar datos de localStorage a SQLite
- [ ] Implementar migrations automáticas

**Tablas Requeridas**:
```sql
-- Configuración
companies (id, name, settings_json, created_at, updated_at)
branches (id, company_id, name, address, active, deleted)
services (id, company_id, name, duration_min, price, deleted, updated_at)
staff (id, company_id, name, active, schedule_json, deleted, updated_at)
status (id, company_id, name, color, deleted)
cancel_reasons (id, company_id, reason, deleted)
settings (id, company_id, key, value, updated_at)

-- Agenda
appointments (
  id,                    -- ID del servidor (null si es local)
  uuid_local,            -- UUID v4 generado localmente
  company_id,
  branch_id,
  service_id,
  staff_id,
  client_id,
  client_name,
  date,
  start_time,
  end_time,
  status,
  notes,
  sync_status,           -- 'pending' | 'synced' | 'conflict'
  version,
  created_at,
  updated_at,
  deleted
)

-- Sincronización
outbox (
  op_id,                 -- UUID de la operación
  type,                  -- 'CREATE_APPOINTMENT' | 'UPDATE_APPOINTMENT' | 'CANCEL_APPOINTMENT'
  company_id,
  payload,               -- JSON de la operación
  created_at,
  attempts,
  status,                -- 'pending' | 'processing' | 'completed' | 'failed'
  last_error
)

sync_state (
  id,
  company_id,
  resource,              -- 'catalogs' | 'agenda'
  last_full_sync,
  last_delta_sync,
  last_window_from,
  last_window_to
)
```

#### 2. API Service
**Prioridad**: 🔴 CRÍTICA
**Archivos a crear**:
- `src/app/core/services/api.service.ts`
- `src/app/core/interceptors/auth.interceptor.ts`
- `src/app/core/models/api-responses.ts`

**Tareas**:
- [ ] Configurar HttpClient
- [ ] Crear interceptor para agregar JWT en headers
- [ ] Implementar retry con exponential backoff
- [ ] Manejo de errores centralizado
- [ ] Timeout configurado (30s)

**Endpoints a implementar**:
```typescript
// Autenticación
POST   /api/auth/login       { email, password }
POST   /api/auth/refresh     { token }
POST   /api/auth/logout      { }

// Catálogos
GET    /api/catalogs?since=ISO8601

// Agenda
GET    /api/agenda?from=YYYY-MM-DD&to=YYYY-MM-DD&since=ISO8601

// Citas
POST   /api/appointments     { ...appointment, Idempotency-Key }
PUT    /api/appointments/:id { ...appointment }
DELETE /api/appointments/:id
POST   /api/appointments/:id/cancel
```

#### 3. Sync Service
**Prioridad**: 🔴 CRÍTICA
**Archivos a crear**:
- `src/app/core/services/sync.service.ts`
- `src/app/core/services/network.service.ts`

**Tareas**:
- [ ] Detectar cambios de conectividad (Capacitor Network)
- [ ] Implementar delta-pull de catálogos
- [ ] Implementar delta-pull de agenda
- [ ] Procesar outbox (push a servidor)
- [ ] Reconciliar IDs locales con IDs de servidor
- [ ] Detectar y resolver conflictos
- [ ] Triggers automáticos de sync

**Lógica de Sincronización**:
```typescript
// Pull (Descarga)
1. Verificar conectividad
2. Obtener last_delta_sync de sync_state
3. Llamar GET /api/catalogs?since={timestamp}
4. Aplicar upserts y soft deletes en BD local
5. Actualizar sync_state

// Push (Subida)
1. Obtener operaciones pendientes de outbox
2. Ordenar por created_at (FIFO)
3. Para cada operación:
   - Agregar header Idempotency-Key: {op_id}
   - Enviar a API correspondiente
   - Si éxito:
     - Reconciliar uuid_local → id_servidor
     - Actualizar sync_status = 'synced'
     - Eliminar de outbox
   - Si error:
     - Incrementar attempts
     - Guardar last_error
     - Aplicar backoff exponencial
```

#### 4. Appointment Service
**Prioridad**: 🔴 CRÍTICA
**Archivos a crear**:
- `src/app/core/services/appointment.service.ts`
- `src/app/core/models/appointment.model.ts`

**Tareas**:
- [ ] Crear cita offline (generar UUID v4)
- [ ] Guardar en BD local con sync_status='pending'
- [ ] Agregar a outbox
- [ ] Editar cita local
- [ ] Cancelar cita local
- [ ] Validaciones locales (disponibilidad, solapamientos)
- [ ] Obtener citas por rango de fechas
- [ ] Filtrar por staff, servicio, estatus

---

### ALTOS (Funcionalidad importante)

#### 5. Formularios de Citas
**Prioridad**: 🟠 ALTA
**Archivos a crear**:
- `src/app/features/agenda/pages/appointment-form/`

**Tareas**:
- [ ] Modal/Página de crear cita
- [ ] Selección de servicio (desde catálogo local)
- [ [ ] Selección de staff disponible
- [ ] Selección de fecha y hora
- [ ] Validación de disponibilidad en tiempo real
- [ ] Detección de solapamientos
- [ ] Guardar en BD local + outbox
- [ ] Modo edición
- [ ] Cancelación con motivo

#### 6. Catalog Service
**Prioridad**: 🟠 ALTA
**Archivos a crear**:
- `src/app/core/services/catalog.service.ts`

**Tareas**:
- [ ] Obtener servicios de BD local
- [ ] Obtener staff disponible
- [ ] Obtener sucursales
- [ ] Obtener estatus de citas
- [ ] Filtrado por company_id
- [ ] Caché en memoria para performance

---

### MEDIOS (Mejoras y optimizaciones)

#### 7. Configuración de Entorno
**Prioridad**: 🟡 MEDIA
**Archivo**: `src/environments/environment.ts`

**Actualizar con**:
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://api.syserv.com',
  apiTimeout: 30000,
  syncIntervalMinutes: 5,
  offlineAgendaWeeks: 6,
  retryAttempts: 3,
  retryDelayMs: 1000
};
```

#### 8. Capacitor Config
**Prioridad**: 🟡 MEDIA
**Archivo**: `capacitor.config.ts`

**Actualizar**:
```typescript
const config: CapacitorConfig = {
  appId: 'com.syserv.agenda',      // Cambiar de 'io.ionic.starter'
  appName: 'SyServ Agenda',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0  // Usamos nuestro splash custom
    }
  }
};
```

#### 9. Pantalla de Estado de Sync
**Prioridad**: 🟡 MEDIA
**Archivos a crear**:
- `src/app/features/sync/pages/sync-status/`

**Componentes**:
- Indicador online/offline
- Última sincronización exitosa
- Cola de operaciones pendientes
- Errores y conflictos
- Botón "Sincronizar ahora"
- Log de actividad de sync

---

## 🗺️ ROADMAP DE DESARROLLO

### ✅ FASE 0: Fundamentos UI (COMPLETADO)
**Duración**: 1 semana
**Estado**: ✅ 100%

- [x] Configuración inicial de Ionic + Angular
- [x] Instalación de dependencias (SQLite, Capacitor)
- [x] Splash screen
- [x] Pantalla de login (diseño)
- [x] Menú principal
- [x] Vista de agenda (diseño)
- [x] Navegación entre pantallas
- [x] AuthService base

---

### ✅ FASE 1: Capa de Datos (COMPLETADO CON localStorage)
**Duración real**: 2 semanas
**Prioridad**: CRÍTICA
**Estado**: ✅ 80% (localStorage funcional, SQLite pendiente)

#### Objetivos Alcanzados
Implementar almacenamiento local y servicios de persistencia funcionales en todas las plataformas.

#### Tareas Completadas
1. **StorageService** ✅
   - [x] Abstracción genérica sobre localStorage
   - [x] Métodos get/set con tipos TypeScript
   - [x] Métodos clear/remove/has
   - [x] Funcional en web y Android

2. **AgendaService** ✅
   - [x] Lectura de configuración desde localStorage
   - [x] Lectura de citas/reservas desde localStorage
   - [x] Algoritmo completo de generación de calendario
   - [x] Manejo de horarios y disponibilidad
   - [x] 2,277 líneas de lógica compleja funcional

3. **SeedSimpleService** ✅
   - [x] Población automática de datos de prueba
   - [x] Clientes, Personal, Servicios
   - [x] Configuración de agenda completa
   - [x] Verificación de datos existentes

4. **DatabaseService** 🔄
   - [x] Esquema completo de 17 tablas definido
   - [x] 16 índices implementados
   - [x] Métodos CRUD completos
   - [ ] Inicialización en Android (pendiente - problema con Capacitor)
   - [x] Código preservado en comentarios para futura activación

**Entregables**:
- ✅ Sistema de almacenamiento localStorage funcional
- ✅ Servicios de lectura/escritura en todas las plataformas
- ✅ Datos de prueba poblados automáticamente
- 🔄 SQLite completamente implementado (código preservado)

---

### 🚀 FASE 2: Conectividad y APIs (PENDIENTE)
**Duración estimada**: 2 semanas
**Prioridad**: CRÍTICA
**Estado**: ❌ 0%

#### Objetivos
Conectar con el backend PHP y habilitar sincronización básica.

#### Tareas
1. **ApiService + Interceptors** (3 días)
   - [ ] Configurar HttpClient
   - [ ] Interceptor de autenticación (JWT)
   - [ ] Manejo de errores HTTP
   - [ ] Retry con exponential backoff
   - [ ] Timeout configurado

2. **NetworkService** (1 día)
   - [ ] Detección de conectividad
   - [ ] Eventos de cambio online/offline
   - [ ] Indicador visual en UI

3. **SyncService** (4 días)
   - [ ] Delta-pull de catálogos
   - [ ] Delta-pull de agenda
   - [ ] Push de outbox
   - [ ] Reconciliación de IDs
   - [ ] Detección de conflictos
   - [ ] Triggers automáticos

4. **Integración con AuthService** (2 días)
   - [ ] Login real con API
   - [ ] Refresh token automático
   - [ ] Logout con API
   - [ ] Validación JWT

**Entregables**:
- Consumo completo de APIs del backend
- Sincronización bidireccional funcional
- Manejo de conflictos implementado

---

### 📱 FASE 3: UI Funcional (PENDIENTE)
**Duración estimada**: 1.5 semanas
**Prioridad**: ALTA
**Estado**: ❌ 0%

#### Objetivos
Convertir los diseños en funcionalidad completa con datos reales.

#### Tareas
1. **Formulario de Citas** (3 días)
   - [ ] Modal de crear cita
   - [ ] Selección de servicio/staff
   - [ ] Picker de fecha y hora
   - [ ] Validaciones en tiempo real
   - [ ] Modo edición
   - [ ] Cancelación

2. **Mejoras en Agenda** (2 días)
   - [ ] Datos desde BD local (no mock)
   - [ ] Filtros funcionales
   - [ ] Vista de semana
   - [ ] Refresh pull-to-refresh
   - [ ] Indicadores de sync

3. **Pantalla de Sync Status** (1 día)
   - [ ] Estado de conexión
   - [ ] Cola de operaciones
   - [ ] Botón sync manual
   - [ ] Log de errores

**Entregables**:
- CRUD completo de citas funcional
- Datos reales desde BD y API
- UX fluida offline/online

---

### 🔒 FASE 4: Seguridad y Optimización (PENDIENTE)
**Duración estimada**: 1 semana
**Prioridad**: MEDIA
**Estado**: ❌ 0%

#### Tareas
1. **Seguridad** (2 días)
   - [ ] Migrar tokens a SecureStorage
   - [ ] Validación JWT con expiración
   - [ ] HTTPS enforcement
   - [ ] Sanitización de logs

2. **Performance** (3 días)
   - [ ] Virtual scroll en listas
   - [ ] Lazy loading optimizado
   - [ ] Compresión HTTP
   - [ ] Índices en BD SQLite
   - [ ] Profiling y optimización

**Entregables**:
- App segura para producción
- Performance optimizado

---

### 🧪 FASE 5: Testing y QA (PENDIENTE)
**Duración estimada**: 1 semana
**Prioridad**: ALTA
**Estado**: ❌ 0%

#### Tareas
- [ ] Tests de modo avión
- [ ] Tests de conflictos
- [ ] Tests de idempotencia
- [ ] Tests multi-tenant
- [ ] Tests de regresión
- [ ] Casos límite y edge cases

**Entregables**:
- Suite de tests completa
- Documento de casos de prueba

---

## 📝 CHANGELOG

### [2025-11-20] - Migración Completa a localStorage y Resolución de Problema en Android APK

#### 🔴 Problema Crítico Resuelto
**Síntoma**: La agenda aparecía vacía en dispositivos Android (APK) pero funcionaba correctamente en navegador web. El formulario de citas mostraba datos correctamente en ambas plataformas.

**Causa Raíz**: Código con condicionales específicos de plataforma en `AgendaService`:
- Métodos `readConfigAgenda()` y `readReservas()` tenían bloques `if (platform === 'web')`
- En navegador: Usaba datos mock de localStorage → ✅ Funcionaba
- En Android: Intentaba usar queries SQLite que fallaban → ❌ Agenda vacía
- DatabaseService nunca se inicializaba correctamente en Android

#### ✅ Solución Implementada (Commit 390b1ab)

**Modificado**:
- ✅ **AgendaService** (`src/app/core/services/agenda.service.ts`)
  - `readConfigAgenda()`: Eliminados condicionales de plataforma, ahora usa localStorage universalmente
  - `readReservas()`: Eliminados condicionales de plataforma, ahora usa localStorage universalmente
  - Código SQLite preservado en comentarios con marcador "MANTENER PARA DEPURACIÓN"
  - Agregados console.log para depuración

- ✅ **SeedSimpleService** (`src/app/core/services/seed-simple.service.ts`)
  - Agregado objeto `config_agenda` completo a `seedDatabase()`
  - Incluye configuración de horarios, colores, terapeutas, disponibilidad
  - Población automática en primer inicio

**Archivos Preservados**:
- ✅ **DatabaseService**: Código completo preservado (17 tablas, 16 índices, CRUD completo)
- Se mantiene para futura depuración cuando se resuelvan problemas de SQLite + Capacitor

#### 📊 Resultados
- ✅ Agenda funciona en navegador web
- ✅ Agenda funciona en APK de Android
- ✅ Formulario de citas funciona en ambas plataformas
- ✅ Configuración de agenda cargada correctamente
- ✅ Compilación exitosa sin errores

#### 🔧 Decisión Técnica
**Por qué localStorage en lugar de SQLite (por ahora)**:
- localStorage es más simple y directo
- No requiere inicialización compleja con Capacitor
- Suficiente para ~1000-2000 citas (5-10 MB límite típico)
- SQLite se retomará cuando se resuelvan los problemas de inicialización en Android
- Código SQLite completamente preservado para facilitar futura migración

#### 📝 Lecciones Aprendidas
1. **Evitar condicionales de plataforma**: Causan comportamiento divergente difícil de depurar
2. **Unificar acceso a datos**: Un solo método de acceso a datos independiente de plataforma
3. **Preservar código**: Comentar en lugar de eliminar para facilitar futuras iteraciones
4. **Logs estratégicos**: console.log claros ayudan a diagnosticar problemas en producción

---

### [2025-11-10] - Implementación Completa de UI Principal y Modo Oscuro

#### Agregado
- ✅ **Página de Perfil del Negocio** (`src/app/features/profile/pages/profile-main/`)
  - Header con avatar y descripción del negocio
  - 4 estadísticas clave (citas, clientes, calificación, ingresos)
  - Información de contacto completa (dirección, teléfono, email, web)
  - Horarios de atención con indicador del día actual
  - Grid de servicios ofrecidos con chips interactivos
  - Animaciones secuenciales de entrada
  - Soporte completo de modo oscuro

- ✅ **Página de Configuración** (`src/app/features/settings/pages/settings-main/`)
  - Toggle de modo oscuro funcional con persistencia
  - 4 toggles de notificaciones (Push, Email, SMS, Recordatorios) con persistencia
  - Slider de volumen (0-100) con persistencia en localStorage
  - Selector de idioma (Español, English, Português) con persistencia
  - Opciones de almacenamiento (limpiar caché, borrar datos)
  - Enlaces de privacidad y soporte
  - Información de la app (versión 1.0.0)
  - Soporte completo de modo oscuro

- ✅ **Sistema de Modo Oscuro Global**
  - Implementado en `src/theme/variables.scss` (180+ líneas de estilos)
  - Aplicación automática en `app.component.ts` al iniciar
  - Persistencia en localStorage
  - Soporte en todas las páginas: Home, Agenda, Perfil, Settings
  - Login forzado a modo claro (protección especial)

- ✅ **Integración de Perfil en Agenda**
  - Tab "Negocio" en bottom navigation muestra perfil completo
  - Mismo contenido que la página de perfil standalone
  - Navegación condicional (muestra banner/header/calendario solo en tab Citas)
  - +380 líneas de estilos específicos para business content en agenda

#### Modificado
- ✅ **Menú Principal (Home)**
  - Mejorado espaciado entre iconos y texto (1.5rem margin-top)
  - Habilitada navegación a Perfil y Configuración
  - Agregado soporte completo de modo oscuro

- ✅ **Vista de Agenda**
  - Agregado contenido de perfil en tab "Negocio"
  - Optimizado display condicional de elementos según tab activo
  - Soporte completo de modo oscuro con estilos mejorados
  - Importados componentes adicionales (IonCard, IonAvatar, IonGrid, IonChip)
  - Registrados 14 iconos adicionales para el perfil

- ✅ **Login Page**
  - Protección especial contra modo oscuro
  - Forzado a modo claro siempre usando `:host-context(body.dark)` overrides
  - Solución a problema de ViewEncapsulation de Angular

- ✅ **App Component**
  - Agregado `ngOnInit()` con carga de preferencia de modo oscuro
  - Aplicación automática del tema al iniciar la app

#### Técnico
- **Persistencia en localStorage**:
  - `darkMode`: boolean (tema global)
  - `notificationVolume`: number 0-100
  - `selectedLanguage`: string ('es', 'en', 'pt')
  - `notificationSettings`: objeto JSON con 4 preferencias

- **Nuevas rutas**:
  - `/profile` → ProfileMainPage
  - `/settings` → SettingsMainPage

- **Arquitectura de estilos para modo oscuro**:
  - Estilos globales en `variables.scss` (body.dark)
  - Estilos por componente usando `:host-context(body.dark)`
  - Protección especial en login con overrides `!important`

- **Archivos modificados/creados**: 12
  - Creados: profile-main.page (ts/html/scss), settings-main.page (ts/html/scss)
  - Modificados: app.component.ts, app.routes.ts, home.page (ts/scss), agenda-main.page (ts/html/scss), login.page.scss, variables.scss

#### Progreso Actualizado
- **UI/Diseño**: 65% → 85% (+20%)
- **Lógica de Negocio**: 10% → 15% (+5%)

### [2025-11-08] - Traducción Completa al Español

#### Modificado
- ✅ Traducido todos los textos visibles al usuario:
  - Días de la semana: SUN→DOM, MON→LUN, TUE→MAR, WED→MIÉ, THU→JUE, FRI→VIE, SAT→SÁB
  - "Today" → "Hoy"
  - Mensajes de autenticación en español
  - "Login exitoso" → "Inicio de sesión exitoso"
- ✅ Actualizada documentación del proyecto

### [2025-11-08] - Diseño UI y Documentación Inicial

#### Agregado
- ✅ Splash screen con animaciones
- ✅ Login page con soporte OAuth preparado
- ✅ AuthService base con estructura completa
- ✅ Menú principal (HomePage)
- ✅ Vista de agenda con timeline y calendario semanal
- ✅ ActionSheet de opciones con "Volver al Menú"
- ✅ Bottom navigation con 5 tabs
- ✅ FAB para nueva cita
- ✅ Loading screen en agenda
- ✅ Sistema de rutas configurado
- ✅ Documento de requisitos (`requisitos.txt`)
- ✅ Este archivo de documentación

#### Modificado
- ✅ Ajustado tamaño de cards de citas:
  - Altura de slot: 260px
  - Grid slot: 65px
  - Padding de card: 2rem x 1.75rem
  - Fuentes aumentadas para mejor legibilidad
- ✅ Optimizado espaciado en timeline
- ✅ Mejorados estilos de las etiquetas de hora

#### Notas Técnicas
- Actualmente usando datos mock para demostración
- AuthService usa localStorage temporal (migrar a SecureStorage)
- SQLite instalado pero no inicializado
- Todas las APIs están preparadas con TODOs

---

## 📚 NOTAS TÉCNICAS

### Decisiones de Arquitectura

#### 1. Standalone Components
**Decisión**: Usar standalone components sin NgModules
**Razón**: Arquitectura moderna de Angular 20, mejor tree-shaking, carga más rápida
**Impacto**: Todos los componentes importan sus dependencias directamente

#### 2. Lazy Loading
**Decisión**: Cargar páginas bajo demanda con loadComponent
**Razón**: Reducir tamaño inicial del bundle
**Implementación**:
```typescript
{
  path: 'agenda',
  loadComponent: () => import('./features/agenda/pages/agenda-main/agenda-main.page')
    .then((m) => m.AgendaMainPage)
}
```

#### 3. RxJS para Estado
**Decisión**: BehaviorSubject + Observables para estado de autenticación
**Razón**: Reactive programming, fácil de subscribirse desde múltiples componentes
**Ejemplo**: `currentUser$`, `isAuthenticated$`

#### 4. localStorage como Almacenamiento Principal
**Decisión actual**: localStorage para datos de aplicación y tokens
**Razón**:
- Más simple y directo que SQLite
- No requiere inicialización compleja
- Funciona consistentemente en todas las plataformas (web, Android, iOS)
- Suficiente para ~1000-2000 citas (límite típico 5-10 MB)

**Consideraciones**:
- localStorage es síncrono (puede bloquear UI con grandes datasets)
- Límite de almacenamiento ~5-10 MB dependiendo del navegador/plataforma
- Datos almacenados como strings (requiere JSON.stringify/parse)

**Plan futuro**:
- Tokens: Migrar a Capacitor SecureStorage (más seguro)
- Datos: Considerar SQLite si se necesita:
  - Más de 2000 citas
  - Queries complejas con joins
  - Índices para búsquedas rápidas
  - Transacciones atómicas

**Migración a SQLite**: Código completo ya implementado y preservado en comentarios, listo para activarse cuando se resuelvan problemas de inicialización en Android

#### 5. Sistema de Modo Oscuro
**Decisión**: Implementación manual con clase `body.dark`
**Razón**: Control total sobre el tema, mejor que `prefers-color-scheme`
**Implementación**:
- Toggle en Settings aplica/remueve clase `dark` en `<body>`
- Persistencia en localStorage con clave `darkMode`
- Carga automática en `app.component.ts` ngOnInit
- Estilos globales en `variables.scss` (body.dark)
- Estilos por componente con `:host-context(body.dark)`

**Desafío de ViewEncapsulation**:
- Angular encapsula estilos por defecto
- Selector `body.dark` no funciona dentro de componentes
- **Solución**: Usar `:host-context(body.dark)` que sí atraviesa el shadow DOM
- **Excepción Login**: Protección especial con overrides `!important` para mantenerlo siempre en claro

**Ejemplo**:
```scss
// ❌ NO FUNCIONA en componentes Angular
body.dark {
  .my-element {
    color: white;
  }
}

// ✅ FUNCIONA correctamente
:host-context(body.dark) {
  .my-element {
    color: white;
  }
}
```

---

### Convenciones de Código

#### Nomenclatura
- **Servicios**: `*.service.ts` (ej: `auth.service.ts`)
- **Páginas**: `*.page.ts` (ej: `login.page.ts`)
- **Modelos**: `*.model.ts` (ej: `appointment.model.ts`)
- **Interfaces**: PascalCase (ej: `User`, `LoginResponse`)

#### Estructura de Carpetas
```
features/
  feature-name/
    pages/
      page-name/
        page-name.page.ts
        page-name.page.html
        page-name.page.scss
    components/    # Si hay componentes reutilizables
    services/      # Si hay servicios específicos del feature
```

#### Imports
Orden recomendado:
1. Angular core
2. Ionic
3. RxJS
4. Third-party
5. App (servicios, modelos)

---

### Estructura de Datos en localStorage

#### Claves Almacenadas

**Datos de aplicación**:
```typescript
// Catálogos
'clientes': Cliente[]           // Array de clientes
'personal': Personal[]          // Array de personal/staff
'productos': Producto[]         // Array de servicios/productos

// Agenda
'citas': Cita[]                // Array de citas/reservas
'config_agenda': ConfigAgenda  // Configuración de agenda

// Autenticación
'user': User                   // Usuario actual
'authToken': string           // Token JWT
```

**Configuración de usuario**:
```typescript
'darkMode': boolean            // Preferencia de tema
'selectedLanguage': string     // Idioma ('es', 'en', 'pt')
'notificationVolume': number   // Volumen 0-100
'notificationSettings': {      // Preferencias de notificaciones
  push: boolean,
  email: boolean,
  sms: boolean,
  reminders: boolean
}
```

#### Interfaces de Datos

**Cliente**:
```typescript
interface Cliente {
  id: number;
  handel: number;
  id_empresa_base: number;
  nombre: string;
  apaterno: string;
  amaterno: string;
  tel1: string;
  email1: string;
  activo: number;
}
```

**Personal**:
```typescript
interface Personal {
  id: number;
  handel: number;
  id_empresa_base: number;
  alias: string;
  nombre: string;
  apellidos: string;
  activo: number;
  orden: number;
}
```

**Producto (Servicio)**:
```typescript
interface Producto {
  id: number;
  handel: number;
  id_empresa_base: number;
  codigo: string;
  nombre: string;
  tipo: string;
  n_duracion: number;  // Múltiplo de 30 min (1=30min, 2=60min, 3=90min)
  precio: number;
  activo: number;
}
```

**ConfigAgenda**:
```typescript
interface ConfigAgenda {
  puesto_servicio: string;
  hora_inicio: number;
  minutos_incremento: number;  // 15, 30, o 60
  hora_fin: number;
  color_libre: string;
  color_reservada: string;
  color_confirmada: string;
  color_cancelada: string;
  color_cobrado: string;
  color_fuera_tiempo: string;
  most_disponibilidad: boolean;
  rangoManual: boolean;
  rangoHora: boolean;
  vizNombreTerapeuta: boolean;
  num_columnas: number;
  config_horario: {
    horario_sabado: string;
    horario_domingo: string;
    formato_hora: string;
    str_dias: string;
  };
  arrTerapeutas: Array<{id: number, alias: string, nombre: string}>;
  arrLisTerapeutas: number[];
  aliasTerapeutas: string[];
  disponibilidad: {
    hora_inicio: number;
    hora_fin: number;
    dia_habil: boolean;
  };
}
```

#### Limitaciones de localStorage

**Capacidad**:
- Típicamente 5-10 MB por dominio
- ~1000-2000 citas estimadas antes de alcanzar límite
- Considerar SQLite si se excede capacidad

**Performance**:
- API síncrona (puede bloquear UI thread)
- JSON.parse/stringify en cada operación
- No hay índices ni optimización de queries

**Seguridad**:
- Datos no encriptados
- Accesible desde JavaScript
- Tokens deberían migrar a SecureStorage

---

### Esquema de Base de Datos Local (SQLite - Preservado para Futuro)

#### Consideraciones Multi-Tenant
- **Todas las tablas** deben tener `company_id`
- **Queries** siempre filtrar por `company_id` del usuario actual
- **Índices** compuestos en `(company_id, ...)` para performance

#### Soft Deletes
- Campo `deleted` (boolean) en lugar de DELETE físico
- Razón: Sincronización requiere saber qué se eliminó

#### Campos de Auditoría
Todas las tablas deben tener:
- `created_at`: Timestamp de creación
- `updated_at`: Timestamp de última modificación
- `version`: Entero incremental para detección de conflictos

---

### Sincronización - Casos Especiales

#### Conflicto de Edición
**Escenario**: Usuario edita cita offline, servidor también la editó

**Resolución**:
1. Comparar `version` local vs servidor
2. Si servidor tiene version mayor:
   - Política por defecto: **Servidor Gana**
   - Marcar como 'conflict' en sync_status
   - Mostrar UI para que usuario decida
3. Usuario puede:
   - Aceptar cambios del servidor (descartar locales)
   - Mantener cambios locales (reintentar UPDATE con nueva version)

#### Cancelación vs Edición
**Escenario**: Cita cancelada en servidor, editada localmente

**Resolución**:
- **Cancelación prevalece** siempre
- Descartar edición local
- Notificar usuario

#### Citas Creadas Offline
**Flujo**:
1. Generar `uuid_local` (UUID v4)
2. Guardar con `id = null`, `sync_status = 'pending'`
3. Agregar a outbox con `type = 'CREATE_APPOINTMENT'`
4. En sync:
   - POST a `/api/appointments` con `Idempotency-Key: {uuid_local}`
   - Servidor responde con `id` definitivo
   - Actualizar `id` local y `sync_status = 'synced'`
   - Eliminar de outbox

---

### Variables de Entorno

#### Desarrollo (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',  // Backend local
  apiTimeout: 30000,
  syncIntervalMinutes: 5,
  offlineAgendaWeeks: 6,
  enableDebugLogs: true
};
```

#### Producción (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.syserv.com/api',
  apiTimeout: 30000,
  syncIntervalMinutes: 10,
  offlineAgendaWeeks: 4,
  enableDebugLogs: false
};
```

---

### APIs del Backend - Contrato de Datos

#### Autenticación

##### POST /api/auth/login
**Request**:
```json
{
  "email": "user@example.com",
  "password": "secreto123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Usuario Demo",
    "company_id": 14
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600
}
```

#### Catálogos

##### GET /api/catalogs?since=2025-11-04T00:00:00Z
**Response**:
```json
{
  "since": "2025-11-04T00:00:00Z",
  "services": [
    {
      "id": 64178,
      "company_id": 14,
      "name": "Corte caballero",
      "duration_min": 45,
      "price": 150.00,
      "updated_at": "2025-11-05T10:00:00Z",
      "deleted": false
    }
  ],
  "staff": [
    {
      "id": 112,
      "company_id": 14,
      "name": "Dante",
      "active": true,
      "schedule": {...},
      "updated_at": "2025-11-05T09:40:00Z",
      "deleted": false
    }
  ],
  "branches": [...],
  "status": [...],
  "cancel_reasons": [...]
}
```

#### Agenda

##### GET /api/agenda?from=2025-11-01&to=2025-11-30&since=2025-11-04T00:00:00Z
**Response**:
```json
{
  "appointments": [
    {
      "id": 2487712,
      "uuid_local": "d5e0c2f0-8a4f-4a93-9b53-2d1c0c9f9c1b",
      "company_id": 14,
      "branch_id": 3,
      "service_id": 64178,
      "staff_id": 112,
      "client_id": 55631,
      "client_name": "Juan Pérez",
      "date": "2025-11-05",
      "start_time": "15:30",
      "end_time": "16:15",
      "status": "Confirmada",
      "notes": "Primera vez",
      "version": 7,
      "updated_at": "2025-11-05T15:42:11Z",
      "deleted": false
    }
  ]
}
```

#### Crear Cita

##### POST /api/appointments
**Headers**:
```
Authorization: Bearer {token}
Idempotency-Key: {uuid_local}
```

**Request**:
```json
{
  "uuid_local": "a1b2c3d4-...",
  "company_id": 14,
  "branch_id": 3,
  "service_id": 64178,
  "staff_id": 112,
  "client_name": "Juan Pérez",
  "date": "2025-11-05",
  "start_time": "15:30",
  "notes": "Primera vez"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "appointment": {
    "id": 2487712,
    "uuid_local": "a1b2c3d4-...",
    ...resto de campos
  }
}
```

---

### Performance - Recomendaciones

#### Índices SQLite
```sql
-- Citas por fecha y empresa
CREATE INDEX idx_appointments_date_company
ON appointments(company_id, date, start_time);

-- Citas por staff
CREATE INDEX idx_appointments_staff
ON appointments(company_id, staff_id, date);

-- Sincronización
CREATE INDEX idx_appointments_sync
ON appointments(sync_status, updated_at);

-- Outbox pendiente
CREATE INDEX idx_outbox_pending
ON outbox(status, created_at)
WHERE status = 'pending';
```

#### Virtual Scroll
Para listas de más de 50 elementos, usar `ion-virtual-scroll`:
```html
<ion-virtual-scroll [items]="appointments" approxItemHeight="100px">
  <ion-item *virtualItem="let appointment">
    <!-- Contenido -->
  </ion-item>
</ion-virtual-scroll>
```

---

### Seguridad - Checklist

- [ ] Migrar tokens de localStorage a Capacitor SecureStorage
- [ ] Validar expiración de JWT antes de cada request
- [ ] Implementar refresh token automático
- [ ] Sanitizar inputs de usuario
- [ ] No loggear información sensible en producción
- [ ] Implementar Certificate Pinning (opcional, avanzado)
- [ ] Validar permisos por tenant en cada operación
- [ ] Encriptar base de datos local (opcional, para datos muy sensibles)

---

## 🔗 RECURSOS Y REFERENCIAS

### Documentación Oficial
- [Ionic Framework](https://ionicframework.com/docs)
- [Angular](https://angular.dev)
- [Capacitor](https://capacitorjs.com/docs)
- [SQLite Plugin](https://github.com/capacitor-community/sqlite)

### Guías Útiles
- [Offline First Apps](https://offlinefirst.org/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## 📞 CONTACTO Y SOPORTE

### Desarrollo
- **Proyecto**: Agenda Offline SyServ
- **Backend**: PHP (existente)
- **Frontend**: Ionic + Angular

### Estado del Proyecto a la Fecha

**Última compilación exitosa**: 2025-11-20
**Último commit**: 390b1ab - "Fix agenda display in Android by migrating to localStorage"
**Build generado**: AppFlow APK
**Plataformas probadas**: Web (navegador) ✅ | Android (APK) ✅

**Archivos clave modificados en último commit**:
- `src/app/core/services/agenda.service.ts` (líneas 778-1083)
- `src/app/core/services/seed-simple.service.ts` (líneas 204-245)

### Próximos Pasos Recomendados

**Inmediato (Alta prioridad)**:
1. ✅ ~~Implementar almacenamiento local~~ (COMPLETADO con localStorage)
2. ✅ ~~Resolver problema de agenda en Android~~ (RESUELTO)
3. **Implementar formulario de creación de citas** (siguiente paso crítico)
   - Usar datos de localStorage (clientes, personal, productos)
   - Guardar citas en array 'citas' de localStorage
   - Validaciones básicas de disponibilidad

**Corto plazo (1-2 semanas)**:
4. Implementar edición y cancelación de citas
5. Agregar filtros en vista de agenda (por personal, servicio, estatus)
6. Configurar entornos (dev/prod) en `environment.ts`
7. Actualizar `capacitor.config.ts` con appId definitivo

**Mediano plazo (2-4 semanas)**:
8. Conectar AuthService con API real del backend PHP
9. Implementar NetworkService para detección de conectividad
10. Implementar SyncService básico (pull de datos desde API)
11. Agregar indicadores visuales de estado online/offline

**Largo plazo (opcional)**:
12. Resolver inicialización de SQLite en Android si se requiere mayor capacidad
13. Migrar de localStorage a SQLite cuando sea necesario
14. Implementar sistema completo de sincronización bidireccional
15. Implementar Outbox pattern para operaciones offline

### Consideraciones Técnicas

**localStorage es suficiente si**:
- Número de citas < 2000
- No se requieren queries complejas con joins
- Performance actual es aceptable
- No se necesita sincronización compleja

**Migrar a SQLite cuando**:
- Número de citas > 2000
- Se requiera mejor performance en búsquedas
- Se necesiten índices para filtrado rápido
- Se implemente sincronización con outbox/sync_state

---

**Fin del documento** | Última actualización: 2025-11-20
