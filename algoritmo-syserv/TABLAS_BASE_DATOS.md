# 📊 Tablas de Base de Datos - Sistema de Agenda

Lista completa de las **15 tablas SQLite** requeridas para el funcionamiento del sistema de agenda traducido a Angular/Ionic + sql.js.

Todas estas tablas se crean automáticamente al ejecutar `agenda.service.ts → initDatabase()`.

---

## 📋 Índice de Tablas

1. [tagenda](#1-tagenda-tabla-principal-de-citasreservas) - Citas y reservaciones
2. [tclientes](#2-tclientes-clientes) - Información de clientes
3. [tusuarios](#3-tusuarios-usuariosterapeutasempleados) - Empleados y terapeutas
4. [tproductos](#4-tproductos-productos-y-servicios) - Catálogo de servicios
5. [tconfig_gral](#5-tconfig_gral-configuración-general-de-agenda) - Configuración principal
6. [tespacios_adicionales](#6-tespacios_adicionales-espacioscolumnas-adicionales) - Columnas auxiliares
7. [tagenda_aux](#7-tagenda_aux-auxiliar-de-agenda) - Servicios de citas
8. [tpermisos](#8-tpermisos-permisosroles) - Roles y permisos
9. [tempresas](#9-tempresas-empresassucursales) - Sucursales
10. [tempresas_base](#10-tempresas_base-empresas-base) - Empresas principales
11. [tconfig_gral_aux1](#11-tconfig_gral_aux1-configuración-auxiliar) - Config horarios
12. [tagenda_lnk_fecha](#12-tagenda_lnk_fecha-link-de-fechas) - Optimización de fechas
13. [tinventario](#13-tinventario-inventarioinsumos) - Control de inventario
14. [trecordatorios](#14-trecordatorios-recordatorios) - Registro de recordatorios
15. [tcontrol_asistencia](#15-tcontrol_asistencia-control-de-asistencia) - Asistencia personal

---

## 1. **tagenda** (Tabla Principal de Citas/Reservas)

### Propósito
Almacena todas las citas y reservaciones del sistema de agenda. Es la tabla central del sistema.

### Estructura

```sql
CREATE TABLE IF NOT EXISTS tagenda (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,
  id_empresa_base INTEGER,
  id_cliente INTEGER,
  id_personal INTEGER,
  fecha TEXT,
  hora TEXT,
  status TEXT DEFAULT 'Reservado',
  espacios_duracion INTEGER DEFAULT 1,
  spacio INTEGER DEFAULT 1,
  notas TEXT,
  notas2 TEXT,
  ban_cita INTEGER DEFAULT 0,
  ban_liquid_credito INTEGER DEFAULT 0,
  lnk_fecha INTEGER,
  fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
)
```

### Columnas Clave

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INTEGER | ID único de la cita (autoincremental) |
| `handel` | INTEGER | ID de sucursal |
| `id_empresa_base` | INTEGER | ID de empresa base |
| `id_cliente` | INTEGER | ID del cliente (FK → tclientes) |
| `id_personal` | INTEGER | ID del empleado/terapeuta (FK → tusuarios) |
| `fecha` | TEXT | Fecha de la cita (YYYY-MM-DD) |
| `hora` | TEXT | Hora de la cita (HH:MM:SS) |
| `status` | TEXT | Estado: 'Cobrado', 'Confirmado', 'Reservado', 'Cancelado', 'FueraTiempo' |
| `espacios_duracion` | INTEGER | Duración de la cita en espacios de tiempo |
| `spacio` | INTEGER | Columna/espacio en la agenda (1, 2, 3...) |
| `notas` | TEXT | Notas principales de la cita |
| `notas2` | TEXT | Notas adicionales/comentarios |
| `ban_cita` | INTEGER | Bandera: 1 = empleado solicitado por cliente |
| `ban_liquid_credito` | INTEGER | Bandera: 1 = crédito liquidado |
| `lnk_fecha` | INTEGER | Link a tabla tagenda_lnk_fecha |

### Relaciones
- **tclientes** (id_cliente)
- **tusuarios** (id_personal)
- **tagenda_lnk_fecha** (lnk_fecha)
- **tagenda_aux** (servicios de la cita)
- **tinventario** (insumos utilizados)

### Uso en el Sistema
- `MapaAgenda()` - Genera matriz de reservaciones
- `readReservas()` - Lee reservas del día
- `isDisponible()` - Verifica disponibilidad

---

## 2. **tclientes** (Clientes)

### Propósito
Almacena la información de todos los clientes del sistema.

### Estructura

```sql
CREATE TABLE IF NOT EXISTS tclientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,
  nombrecto TEXT,
  tel1 TEXT,
  tel2 TEXT,
  email1 TEXT,
  codPaisTel1 TEXT DEFAULT '+52',
  medio_promo TEXT,
  fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
)
```

### Columnas Clave

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INTEGER | ID único del cliente |
| `handel` | INTEGER | ID de sucursal |
| `nombrecto` | TEXT | Nombre completo del cliente |
| `tel1` | TEXT | Teléfono principal |
| `tel2` | TEXT | Teléfono secundario |
| `email1` | TEXT | Email del cliente |
| `codPaisTel1` | TEXT | Código de país (+52, +1, etc.) |
| `medio_promo` | TEXT | Medio por el que se enteró del negocio |

### Uso en el Sistema
- `readReservas()` - Obtiene nombre y teléfono para cada cita
- Renderizado de celdas en la tabla de agenda
- Control de clientes premium

---

## 3. **tusuarios** (Usuarios/Terapeutas/Empleados)

### Propósito
Almacena información de empleados, terapeutas y personal del sistema.

### Estructura

```sql
CREATE TABLE IF NOT EXISTS tusuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,
  alias TEXT,
  nombre TEXT,
  apaterno TEXT,
  amaterno TEXT,
  nombrecto TEXT,
  activo TEXT DEFAULT 'Si',
  id_permiso INTEGER,
  orden INTEGER DEFAULT 0,
  fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
)
```

### Columnas Clave

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INTEGER | ID único del usuario |
| `handel` | INTEGER | ID de sucursal |
| `alias` | TEXT | Alias/nombre corto del usuario |
| `nombre` | TEXT | Nombre(s) |
| `apaterno` | TEXT | Apellido paterno |
| `amaterno` | TEXT | Apellido materno |
| `nombrecto` | TEXT | Nombre completo concatenado |
| `activo` | TEXT | 'Si' o 'No' |
| `id_permiso` | INTEGER | ID del rol/permiso (FK → tpermisos) |
| `orden` | INTEGER | Orden de aparición en la agenda |

### Relaciones
- **tpermisos** (id_permiso)

### Uso en el Sistema
- `readTerapeutas()` - Lee terapeutas activos
- Encabezados de columnas en la agenda
- Filtro por terapeuta (optAgendProx_ID)

---

## 4. **tproductos** (Productos y Servicios)

### Propósito
Catálogo completo de productos y servicios del negocio.

### Estructura

```sql
CREATE TABLE IF NOT EXISTS tproductos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,
  nombre TEXT,
  codigo TEXT,
  tipo TEXT DEFAULT 'Servicio',
  u_medida TEXT DEFAULT 'Pieza',
  n_duracion INTEGER DEFAULT 1,
  fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
)
```

### Columnas Clave

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INTEGER | ID único del producto/servicio |
| `handel` | INTEGER | ID de sucursal |
| `nombre` | TEXT | Nombre del producto/servicio |
| `codigo` | TEXT | Código del producto |
| `tipo` | TEXT | 'Servicio', 'Materia prima', 'Producto terminado' |
| `u_medida` | TEXT | Unidad de medida (Pieza, Kg, Litro, etc.) |
| `n_duracion` | INTEGER | Duración del servicio en espacios de tiempo |

### Uso en el Sistema
- `CalcEspaciosListServicios()` - Calcula duración de servicios
- `readReservas()` - Obtiene servicios de cada cita
- Renderizado de servicios en celdas

---

## 5. **tconfig_gral** (Configuración General de Agenda)

### Propósito
Configuración principal del sistema de agenda por sucursal.

### Estructura

```sql
CREATE TABLE IF NOT EXISTS tconfig_gral (
  handel INTEGER PRIMARY KEY,
  puesto_servicio TEXT DEFAULT 'Terapeuta',
  hora_inicio INTEGER DEFAULT 9,
  hora_fin INTEGER DEFAULT 18,
  minutos_incremento INTEGER DEFAULT 30,
  color_libre TEXT DEFAULT '#FFFFFF',
  color_reservada TEXT DEFAULT '#FFF3CD',
  color_confirmada TEXT DEFAULT '#D4EDDA',
  color_cobrada TEXT DEFAULT '#CCE5FF',
  color_cancelada TEXT DEFAULT '#F8D7DA',
  color_ftiempo TEXT DEFAULT '#E9ECEF',
  most_disponibilidad TEXT DEFAULT 'Si',
  rangoManual TEXT DEFAULT 'No',
  rangoHora TEXT DEFAULT 'No',
  vizNombreTerapeuta TEXT DEFAULT 'Si',
  Filas TEXT,
  num_columnas INTEGER DEFAULT 0
)
```

### Columnas Clave

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `handel` | INTEGER | ID de sucursal (PRIMARY KEY) |
| `puesto_servicio` | TEXT | Nombre del puesto: 'Terapeuta', 'Médico', etc. |
| `hora_inicio` | INTEGER | Hora de inicio de agenda (9 = 9:00 AM) |
| `hora_fin` | INTEGER | Hora de fin de agenda (18 = 6:00 PM) |
| `minutos_incremento` | INTEGER | Incremento de tiempo (15, 30, 60 minutos) |
| `color_libre` | TEXT | Color hexadecimal para celdas libres |
| `color_reservada` | TEXT | Color para citas reservadas |
| `color_confirmada` | TEXT | Color para citas confirmadas |
| `color_cobrada` | TEXT | Color para citas cobradas/pagadas |
| `color_cancelada` | TEXT | Color para citas canceladas |
| `color_ftiempo` | TEXT | Color para fuera de tiempo |
| `most_disponibilidad` | TEXT | Mostrar disponibilidad: 'Si' o 'No' |
| `rangoManual` | TEXT | Usar rango manual de horarios |
| `rangoHora` | TEXT | Usar rango por horas |
| `vizNombreTerapeuta` | TEXT | Visualizar nombre de terapeuta en encabezado |
| `Filas` | TEXT | Configuración de filas/columnas fijas (JSON) |
| `num_columnas` | INTEGER | Número de columnas fijas |

### Uso en el Sistema
- `readConfigAgenda()` - Lee configuración al inicializar
- `getInfoConfigAgenda()` - Obtiene configuración actual
- Determina horarios, colores y comportamiento de la agenda

---

## 6. **tespacios_adicionales** (Espacios/Columnas Adicionales)

### Propósito
Almacena columnas auxiliares/adicionales que se crean dinámicamente por día.

### Estructura

```sql
CREATE TABLE IF NOT EXISTS tespacios_adicionales (
  handel INTEGER NOT NULL,
  fecha TEXT NOT NULL,
  col_aux INTEGER DEFAULT 0,
  PRIMARY KEY (handel, fecha)
)
```

### Columnas Clave

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `handel` | INTEGER | ID de sucursal |
| `fecha` | TEXT | Fecha específica (YYYY-MM-DD) |
| `col_aux` | INTEGER | Número de columnas auxiliares creadas |

### Constraint
- **UNIQUE** (handel, fecha) - Un solo registro por sucursal por día

### Uso en el Sistema
- `readEspaciosAdicionales()` - Lee columnas adicionales
- `cantColumnas()` - Calcula total de columnas del día
- Permite expandir la agenda dinámicamente

---

## 7. **tagenda_aux** (Auxiliar de Agenda - Servicios de Citas)

### Propósito
Almacena los servicios específicos de cada cita (relación many-to-many).

### Estructura

```sql
CREATE TABLE IF NOT EXISTS tagenda_aux (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_agenda INTEGER NOT NULL,
  id_producto_servicio INTEGER,
  cantidad INTEGER DEFAULT 1,
  costo REAL DEFAULT 0,
  FOREIGN KEY (id_agenda) REFERENCES tagenda(id)
)
```

### Columnas Clave

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INTEGER | ID único del registro |
| `id_agenda` | INTEGER | ID de la cita (FK → tagenda) |
| `id_producto_servicio` | INTEGER | ID del servicio (FK → tproductos) |
| `cantidad` | INTEGER | Cantidad del servicio |
| `costo` | REAL | Costo del servicio |

### Relaciones
- **tagenda** (id_agenda)
- **tproductos** (id_producto_servicio)

### Uso en el Sistema
- `readReservas()` - Obtiene servicios de cada cita
- `CalcEspaciosListServicios()` - Calcula duración total
- Renderizado de servicios en celdas

---

## 8. **tpermisos** (Permisos/Roles)

### Propósito
Define los roles y permisos de usuarios del sistema.

### Estructura

```sql
CREATE TABLE IF NOT EXISTS tpermisos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,
  nombre TEXT
)
```

### Columnas Clave

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INTEGER | ID único del permiso/rol |
| `handel` | INTEGER | ID de sucursal |
| `nombre` | TEXT | Nombre del rol: 'Administrador', 'Recepcionista', etc. |

### Uso en el Sistema
- Control de acceso y privilegios
- Relación con tusuarios

---

## 9. **tempresas** (Empresas/Sucursales)

### Propósito
Información de sucursales del negocio.

### Estructura

```sql
CREATE TABLE IF NOT EXISTS tempresas (
  handel INTEGER PRIMARY KEY,
  id_empresa_base INTEGER,
  nombreSucursal_Sel TEXT,
  Telefono TEXT,
  activa TEXT DEFAULT 'Si'
)
```

### Columnas Clave

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `handel` | INTEGER | ID de sucursal (PRIMARY KEY) |
| `id_empresa_base` | INTEGER | ID de empresa base (FK → tempresas_base) |
| `nombreSucursal_Sel` | TEXT | Nombre de la sucursal |
| `Telefono` | TEXT | Teléfono de contacto |
| `activa` | TEXT | 'Si' o 'No' |

### Relaciones
- **tempresas_base** (id_empresa_base)

---

## 10. **tempresas_base** (Empresas Base)

### Propósito
Configuración de empresas principales (matriz).

### Estructura

```sql
CREATE TABLE IF NOT EXISTS tempresas_base (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_empresa TEXT,
  activa TEXT DEFAULT 'Si',
  tiempo_notificacion_1 INTEGER DEFAULT 1440,
  tiempo_notificacion_2 INTEGER DEFAULT 60,
  status_send_1 TEXT DEFAULT 'Confirmado',
  status_send_2 TEXT DEFAULT 'Confirmado',
  send_type_1 TEXT DEFAULT 'SMS',
  send_type_2 TEXT DEFAULT 'SMS',
  dias_ctespr INTEGER DEFAULT 365,
  nventa_ctespr INTEGER DEFAULT 1
)
```

### Columnas Clave

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INTEGER | ID de empresa base |
| `nombre_empresa` | TEXT | Nombre de la empresa |
| `activa` | TEXT | Estado activo |
| `tiempo_notificacion_1` | INTEGER | Minutos antes (1440 = 24 horas) |
| `tiempo_notificacion_2` | INTEGER | Minutos antes (60 = 1 hora) |
| `status_send_1` | TEXT | Estado para enviar 1er recordatorio |
| `status_send_2` | TEXT | Estado para enviar 2do recordatorio |
| `send_type_1` | TEXT | Tipo: 'SMS', 'Email', 'WhatsApp' |
| `send_type_2` | TEXT | Tipo de 2do recordatorio |
| `dias_ctespr` | INTEGER | Días para considerar cliente premium |
| `nventa_ctespr` | INTEGER | Número de ventas para premium |

### Uso en el Sistema
- Configuración de recordatorios automáticos
- Cálculo de clientes premium
- `calcularClientesPremium()`

---

## 11. **tconfig_gral_aux1** (Configuración Auxiliar)

### Propósito
Configuración adicional de horarios especiales.

### Estructura

```sql
CREATE TABLE IF NOT EXISTS tconfig_gral_aux1 (
  handel INTEGER PRIMARY KEY,
  horario_sabado TEXT,
  horario_domingo TEXT,
  formato_hora TEXT DEFAULT 'militar',
  str_dias TEXT DEFAULT 'L,M,Mi,J,V,S,D'
)
```

### Columnas Clave

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `handel` | INTEGER | ID de sucursal |
| `horario_sabado` | TEXT | Horario especial para sábados (JSON) |
| `horario_domingo` | TEXT | Horario especial para domingos (JSON) |
| `formato_hora` | TEXT | 'militar' (24h) o 'regular' (12h AM/PM) |
| `str_dias` | TEXT | Días laborables separados por comas |

### Uso en el Sistema
- `readConfigAgenda()` - Lee configuración de horarios
- Manejo de horarios especiales por día de semana

---

## 12. **tagenda_lnk_fecha** (Link de Fechas)

### Propósito
Tabla auxiliar para optimizar consultas por fecha (índice de fechas únicas).

### Estructura

```sql
CREATE TABLE IF NOT EXISTS tagenda_lnk_fecha (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT UNIQUE NOT NULL
)
```

### Columnas Clave

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INTEGER | ID único |
| `fecha` | TEXT | Fecha única (YYYY-MM-DD) |

### Constraint
- **UNIQUE** (fecha) - No duplicados

### Uso en el Sistema
- Optimización de queries
- Link desde tagenda.lnk_fecha

---

## 13. **tinventario** (Inventario/Insumos)

### Propósito
Control de inventario y materias primas utilizadas en citas.

### Estructura

```sql
CREATE TABLE IF NOT EXISTS tinventario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,
  id_producto INTEGER,
  id_agenda INTEGER,
  cantidad REAL DEFAULT 0,
  ban_add_manual INTEGER DEFAULT 0,
  fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
)
```

### Columnas Clave

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INTEGER | ID único |
| `handel` | INTEGER | ID de sucursal |
| `id_producto` | INTEGER | ID del producto/insumo (FK → tproductos) |
| `id_agenda` | INTEGER | ID de la cita (FK → tagenda) |
| `cantidad` | REAL | Cantidad utilizada |
| `ban_add_manual` | INTEGER | 1 = agregado manualmente, 0 = automático |

### Relaciones
- **tagenda** (id_agenda)
- **tproductos** (id_producto)

### Uso en el Sistema
- Control de stock
- Materias primas usadas por servicio

---

## 14. **trecordatorios** (Recordatorios)

### Propósito
Registro de recordatorios enviados a clientes.

### Estructura

```sql
CREATE TABLE IF NOT EXISTS trecordatorios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,
  id_agenda INTEGER,
  tipo TEXT,
  fecha_envio TEXT DEFAULT CURRENT_TIMESTAMP
)
```

### Columnas Clave

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INTEGER | ID único |
| `handel` | INTEGER | ID de sucursal |
| `id_agenda` | INTEGER | ID de la cita (FK → tagenda) |
| `tipo` | TEXT | 'SMS', 'Email', 'WhatsApp' |
| `fecha_envio` | TEXT | Fecha/hora de envío |

### Relaciones
- **tagenda** (id_agenda)

### Uso en el Sistema
- Control de recordatorios enviados
- Evitar duplicados

---

## 15. **tcontrol_asistencia** (Control de Asistencia)

### Propósito
Control de asistencia de personal.

### Estructura

```sql
CREATE TABLE IF NOT EXISTS tcontrol_asistencia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,
  id_personal INTEGER,
  fecha_evento TEXT,
  tipo_evento TEXT,
  hora_evento TEXT DEFAULT CURRENT_TIMESTAMP
)
```

### Columnas Clave

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INTEGER | ID único |
| `handel` | INTEGER | ID de sucursal |
| `id_personal` | INTEGER | ID del empleado (FK → tusuarios) |
| `fecha_evento` | TEXT | Fecha del evento |
| `tipo_evento` | TEXT | 'Entrada', 'Salida', 'Falta', etc. |
| `hora_evento` | TEXT | Hora del evento |

### Relaciones
- **tusuarios** (id_personal)

### Uso en el Sistema
- Control de horarios de personal
- Reportes de asistencia

---

## 🔗 Diagrama de Relaciones (ERD Simplificado)

```
┌─────────────────────┐
│   tempresas_base    │
│  (Empresa matriz)   │
└──────────┬──────────┘
           │
           ├─ id_empresa_base
           ↓
┌─────────────────────┐      ┌──────────────────┐
│     tempresas       │──────│  tconfig_gral    │
│   (Sucursales)      │      │  (Config agenda) │
└──────────┬──────────┘      └──────────────────┘
           │
           │ handel
           ├─────────────────────────────┐
           │                             │
           ↓                             ↓
┌─────────────────────┐      ┌──────────────────┐
│     tusuarios       │      │    tclientes     │
│   (Empleados)       │      │   (Clientes)     │
└──────────┬──────────┘      └────────┬─────────┘
           │                          │
           │ id_personal             │ id_cliente
           │                          │
           └──────────┬───────────────┘
                      ↓
           ┌──────────────────────┐
           │      tagenda         │◄──┐
           │  (Citas/Reservas)    │   │
           └──────────┬───────────┘   │
                      │                │
                      ├─ id_agenda    │
                      ↓                │
           ┌──────────────────────┐   │
           │    tagenda_aux       │   │
           │  (Servicios cita)    │───┤ id_agenda
           └──────────┬───────────┘   │
                      │                │
                      ├─ id_producto  │
                      ↓                │
           ┌──────────────────────┐   │
           │     tproductos       │   │
           │ (Servicios/Prod)     │   │
           └──────────────────────┘   │
                                      │
           ┌──────────────────────┐   │
           │    tinventario       │───┘
           │   (Inventario)       │
           └──────────────────────┘
```

---

## 📝 Notas de Implementación

### Inicialización de Tablas

Todas las tablas se crean automáticamente al llamar:

```typescript
await this.agendaService.initDatabase();
```

Este método se encuentra en `agenda.service.ts` línea ~150.

### Población de Datos de Prueba

El servicio incluye métodos para insertar datos de ejemplo:

```typescript
await this.agendaService.insertarDatosPrueba();
```

Esto inserta:
- 1 configuración de agenda
- 3 terapeutas de ejemplo
- 5 servicios de ejemplo
- 10 clientes de ejemplo
- 15 citas de ejemplo

### Migración desde MySQL

Si tienes datos en MySQL, necesitarás:

1. Exportar datos a JSON/CSV
2. Adaptar tipos de datos:
   - `INT` → `INTEGER`
   - `VARCHAR` → `TEXT`
   - `DATETIME` → `TEXT` (ISO 8601)
   - `DECIMAL` → `REAL`

3. Adaptar sintaxis SQL:
   - `NOW()` → `CURRENT_TIMESTAMP`
   - `CURDATE()` → `date('now')`
   - `CONCAT()` → Operador `||`

### Índices Recomendados

Para mejorar el rendimiento, considera crear índices:

```sql
CREATE INDEX idx_tagenda_fecha ON tagenda(fecha);
CREATE INDEX idx_tagenda_handel ON tagenda(handel);
CREATE INDEX idx_tagenda_status ON tagenda(status);
CREATE INDEX idx_tclientes_handel ON tclientes(handel);
CREATE INDEX idx_tusuarios_handel ON tusuarios(handel);
```

---

## ⚠️ Consideraciones Importantes

1. **Tamaño de Base de Datos**: sql.js carga toda la BD en memoria. Para >10,000 citas, considera optimización.

2. **Persistencia**: sql.js NO persiste automáticamente. Debes exportar la BD y guardarla:
   ```typescript
   const data = this.db.export();
   localStorage.setItem('agenda_db', JSON.stringify(Array.from(data)));
   ```

3. **Sincronización**: Si necesitas sincronizar con un servidor, implementa:
   - Timestamps de última modificación
   - ID único por registro
   - Conflict resolution

4. **Backup**: Implementa backups automáticos del localStorage.

---

## 📚 Referencias

- **Archivo fuente**: `agenda.service.ts` (líneas 150-400)
- **Documentación**: Ver `AGENDA_SERVICE_README.md`
- **sql.js docs**: https://sql.js.org/

---

**Versión**: 1.0.0
**Fecha**: 2025-01-13
**Total de tablas**: 15
**Compatible con**: SQLite 3.x, sql.js 1.x
