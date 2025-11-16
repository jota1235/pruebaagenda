# 📊 ANÁLISIS COMPLETO: ALGORITMO-SYSERV Y ESTRUCTURA DE BASE DE DATOS

**Fecha**: 2025-11-14
**Propósito**: Análisis exhaustivo del código de referencia y propuesta de integración

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Contenido de algoritmo-syserv](#contenido-de-algoritmo-syserv)
3. [Análisis del AgendaService](#análisis-del-agendaservice)
4. [Estructura de Base de Datos](#estructura-de-base-de-datos)
5. [Algoritmo de Mapeo de Agenda](#algoritmo-de-mapeo-de-agenda)
6. [Propuesta de Integración](#propuesta-de-integración)
7. [Plan de Implementación](#plan-de-implementación)
8. [Ajustes Dinámicos Necesarios](#ajustes-dinámicos-necesarios)

---

## 🎯 RESUMEN EJECUTIVO

### Objetivo
Integrar el **algoritmo completo de agenda** (traducido desde PHP a TypeScript) en la aplicación Ionic/Angular actual, adaptando la base de datos de **sql.js** a **Capacitor SQLite** para funcionamiento offline-first.

### Estado del Código de Referencia
✅ **COMPLETO Y LISTO PARA USAR**

- **2,179 líneas** de código TypeScript funcional
- **17 interfaces** TypeScript definidas
- **15 tablas SQL** documentadas
- **80+ métodos** implementados
- **Documentación completa** de 585 líneas

### Compatibilidad
- ✅ Arquitectura moderna (standalone components)
- ⚠️ Usa `sql.js` (navegador) → Debe migrarse a `Capacitor SQLite` (móvil)
- ✅ Lógica de negocio 100% compatible con Angular
- ✅ Interfaces TypeScript reutilizables

---

## 📂 CONTENIDO DE ALGORITMO-SYSERV

### Archivos Principales

```
algoritmo-syserv/
├── agenda.service.ts                 # 2,179 líneas - Servicio completo ✅
├── agenda.interfaces.ts              # 242 líneas - 17 interfaces ✅
├── AGENDA_SERVICE_README.md          # 585 líneas - Documentación ✅
├── TABLAS_BASE_DATOS.md              # 777 líneas - Documentación SQL ✅
│
├── agenda-ejemplo.component.ts       # Ejemplo de uso
├── agenda-ejemplo.page.html          # Vista de ejemplo
├── agenda-ejemplo.page.scss          # Estilos de ejemplo
│
├── agenda-tabla.component.ts         # Componente tabla agenda
├── agenda-tabla.component.html
├── agenda-tabla.component.scss
│
├── agenda-privilegios.service.ts     # Sistema de permisos
├── TABLA_AGENDA_README.md            # Docs del componente
├── RESUMEN_TRADUCCION.md             # Resumen de traducción PHP→TS
├── RESUMEN_TABLA_CALENDARIO.md
├── README.md                          # Documentación general
│
└── DB/                                # 12 Esquemas SQL
    ├── tagenda.sql                    # 101k tokens - Tabla principal
    ├── tclientes.sql                  # 89k tokens - Clientes
    ├── tusuarios.sql                  # Usuarios/Personal ✅
    ├── tproductos.sql                 # 94k tokens - Servicios
    ├── tconfig_gral.sql               # Configuración ✅
    ├── tagenda_aux.sql                # Auxiliar de agenda
    ├── tagenda_lnk_fecha.sql          # Links de fechas
    ├── tespacios_adicionales.sql      # Columnas extra
    ├── tpermisos.sql                  # Permisos
    ├── tempresas.sql                  # Sucursales
    ├── tempresas_base.sql             # Empresas base
    └── tconfig_gral_aux1.sql          # Config auxiliar
```

### Tamaños y Complejidad

| Archivo | Líneas | Tokens | Estado |
|---------|--------|--------|--------|
| `agenda.service.ts` | 2,179 | ~15,000 | ✅ Completo |
| `agenda.interfaces.ts` | 242 | ~1,800 | ✅ Completo |
| `tagenda.sql` | ? | 101,723 | ⚠️ Muy grande (datos de ejemplo) |
| `tclientes.sql` | ? | 89,333 | ⚠️ Muy grande (datos de ejemplo) |
| `tproductos.sql` | ? | 94,359 | ⚠️ Muy grande (datos de ejemplo) |

**Nota**: Los archivos SQL son enormes porque incluyen miles de registros de ejemplo (INSERT statements). Solo necesitamos los CREATE TABLE.

---

## 🔧 ANÁLISIS DEL AGENDASERVICE

### Arquitectura General

```typescript
@Injectable({ providedIn: 'root' })
export class AgendaService {
  // Base de datos
  private db: Database | null = null;
  private SQL: SqlJsStatic | null = null;

  // Configuración multi-tenant
  private handel: number = 0;              // ID de sucursal
  private id_empresa_base: number = 0;    // ID de empresa

  // Estado de la agenda
  private vecConfigAgenda: ConfigAgenda;   // Configuración
  private vecReservas: Reserva[];          // Citas del día
  private listHorarios: string[];          // ["09:00", "09:30", ...]
  private arrMapa: string[][];             // Matriz de ocupación
  private info_cols_terapeutas: Terapeuta[]; // Personal

  // Parámetros de operación
  private fecha_op: string;                // Fecha seleccionada
  private minutos_incremento: number = 30; // Incremento de tiempo
  private reservar_con_antelacion: number = 15; // Min antelación
}
```

### Métodos Críticos (Principales)

#### 1. **initDatabase()** - Inicialización
```typescript
async initDatabase(): Promise<void>
```
- Carga sql.js desde `assets/sql-wasm.wasm`
- Lee BD de localStorage o crea nueva
- Crea 15 tablas automáticamente

**Status**: ⚠️ Usa sql.js → Migrar a Capacitor SQLite

---

#### 2. **readConfigAgenda(fecha)** - Lee Configuración
```typescript
readConfigAgenda(fecha: string = ''): boolean
```
**Retorna**: `true` si encuentra configuración

**Carga**:
- Configuración general (hora_inicio, hora_fin, incrementos)
- Lista de terapeutas activos
- Columnas auxiliares del día
- Horarios especiales (sábados/domingos)
- Disponibilidad del día

**Datos guardados en**:
- `this.vecConfigAgenda` (ConfigAgenda)
- `this.info_cols_terapeutas` (Terapeuta[])
- `this.listHorarios` (string[])

---

#### 3. **readReservas(fecha)** - Lee Citas del Día
```typescript
readReservas(fecha: string = ''): boolean
```
**Retorna**: `true` si hay citas

**Query SQL**:
```sql
SELECT
  t1.id as id_agenda,
  t1.id_cliente,
  t1.id_personal,
  t1.hora,
  t1.status,
  t1.espacios_duracion as duracion,
  t1.spacio as columna,
  t2.nombrecto as cliente,
  t2.tel1, t2.tel2, t2.email1,
  t1.notas,
  u.alias, u.nombrecto as nombre_personal,
  GROUP_CONCAT(tprod.codigo) as servicios_agenda
FROM tagenda t1
JOIN tclientes t2 ON t1.id_cliente = t2.id
JOIN tusuarios u ON t1.id_personal = u.id
LEFT JOIN tagenda_aux agAux ON agAux.id_agenda = t1.id
LEFT JOIN tproductos tprod ON agAux.id_producto_servicio = tprod.id
WHERE t1.fecha = ? AND t1.handel = ?
```

**Datos guardados en**:
- `this.vecReservas` (Reserva[])

---

#### 4. **MapaAgenda(updateData)** - Genera Matriz de Ocupación
```typescript
MapaAgenda(updateData: boolean = true): Reserva[]
```
**Retorna**: Array de citas procesadas

**Algoritmo** (5 fases):

```
1. Leer configuración (readConfigAgenda)
2. Leer todas las reservas (readReservas)
3. Inicializar matriz vacía [columnas][filas]
4. FASE 1: Mapear citas normales (Cobrado, Confirmado, Reservado)
   → Buscar espacio disponible
   → Marcar con ID de cita
   → Continuación con 'X'
5. FASE 2: Mapear citas en columnas auxiliares
   → Buscar espacio en columnas extra
6. FASE 3: Mapear bloqueos (FueraTiempo)
   → Marcar con 'i' (inhábil)
7. FASE 4: Ajustar citas canceladas
   → Solo ajustar columna, no mapear
8. FASE 5: Bloquear días inhábiles
   → Todo el mapa con 'i'
9. FASE 6: Aplicar restricciones de columnas
   → Marcar con 'd' (deshabilitado)
```

**Resultado**:
```typescript
arrMapa[columna][fila] =
  '' = Libre
  '123' = ID de cita
  'X' = Continuación de cita
  'i' = Día inhábil
  'd' = Columna deshabilitada
```

**Datos guardados en**:
- `this.arrMapa` (string[][])

---

#### 5. **isDisponible(fila, columna, espacios)** - Verifica Disponibilidad
```typescript
isDisponible(fila_inicial: number, columna: number, espacios: number): boolean
```
**Retorna**: `true` si todos los espacios están libres

**Lógica**:
```typescript
for (let y = fila_inicial; y <= fila_inicial + espacios - 1; y++) {
  if (this.arrMapa[columna][y] !== '') {
    return false; // Ocupado
  }
}
return true; // Disponible
```

**Uso**:
- Validar antes de crear cita
- Buscar primer espacio disponible
- Mostrar indicador visual en UI

---

### Métodos Auxiliares Importantes

#### **readHorariosAgenda()** - Genera Lista de Horarios
```typescript
readHorariosAgenda(hora_inicio, hora_fin, minutos_incremento, sav): string[]
```

**Ejemplo**:
```typescript
// Input: hora_inicio=9, hora_fin=18, incremento=30
// Output: ["09:00", "09:30", "10:00", ..., "18:00"]
```

**Datos guardados en**:
- `this.listHorarios` (string[]) - Simple: ["09:00", "09:30"]
- `this.listHorariosAll` (HorarioAgenda[]) - Completo con formato AM/PM

---

#### **CalcEspaciosListServicios()** - Calcula Duración de Servicios
```typescript
CalcEspaciosListServicios(ids_servicios: string, defult: number): number
```

**Ejemplo**:
```typescript
// Input: ids_servicios = "1|2|3"
// Query: SELECT n_duracion FROM tproductos WHERE id IN (1, 2, 3)
// Output: espacios_requeridos = 5 (suma de duraciones)
```

**Uso**:
- Antes de reservar, calcular cuántos slots necesita
- Validar disponibilidad con `isDisponible()`

---

#### **IdentificaColumna()** - ID Personal → Columna
```typescript
IdentificaColumna(id_personal_ag: number, columna_directa: number): number
```

**Lógica**:
```typescript
// Busca en qué posición está el terapeuta
vecConfigAgenda.arrLisTerapeutas.forEach((id, index) => {
  if (id === id_personal_ag) {
    return index; // Columna 0, 1, 2...
  }
});
```

---

#### **IdentificaFila()** - Hora → Fila
```typescript
IdentificaFila(hora_ag: string): number
```

**Ejemplo**:
```typescript
// listHorarios = ["09:00", "09:30", "10:00", ...]
// IdentificaFila("09:30") → 1 (índice en el array)
```

---

### Métodos de Base de Datos

#### **executeQuery()** - Consultas SELECT
```typescript
private executeQuery(query: string, params: any[]): any[]
```

**Implementación actual** (sql.js):
```typescript
const stmt = this.db.prepare(query);
stmt.bind(params);
const results: any[] = [];
while (stmt.step()) {
  results.push(stmt.getAsObject());
}
stmt.free();
return results;
```

⚠️ **Requiere migración** a Capacitor SQLite

---

#### **executeCommand()** - INSERT/UPDATE/DELETE
```typescript
private executeCommand(query: string, params: any[]): boolean
```

**Implementación actual**:
```typescript
const stmt = this.db.prepare(query);
stmt.bind(params);
stmt.step();
stmt.free();
this.saveDatabase(); // ⚠️ Guarda en localStorage
return true;
```

⚠️ **Requiere migración** a Capacitor SQLite

---

### Flujo de Uso Típico

```typescript
// 1. Inicializar base de datos
await agendaService.initDatabase();

// 2. Configurar sucursal y fecha
agendaService.setHandel(117);          // Sucursal 117
agendaService.setEmpresaBase(44);      // Empresa 44
agendaService.setFechaAg('2025-11-15'); // Fecha

// 3. Leer configuración
const tieneConfig = agendaService.readConfigAgenda();
if (!tieneConfig) {
  console.error('No hay configuración para esta sucursal');
  return;
}

// 4. Generar mapa de agenda
const citas = agendaService.MapaAgenda(false);

// 5. Obtener datos para UI
const horarios = agendaService.getInfoHorarios(true); // Con AM/PM
const terapeutas = agendaService.getInfoColsTerapeutas();
const mapa = agendaService.getArrMapa();

// 6. Renderizar en vista
// horarios.forEach((h, fila) => {
//   terapeutas.forEach((t, columna) => {
//     const valor = mapa[columna][fila];
//     // Mostrar celda según valor
//   });
// });
```

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### Tablas Principales (15 tablas)

#### 1. **tagenda** - Citas y Reservaciones

```sql
CREATE TABLE tagenda (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,           -- ID de sucursal
  id_empresa_base INTEGER,           -- ID de empresa
  id_cliente INTEGER,                -- FK → tclientes
  id_personal INTEGER,               -- FK → tusuarios
  fecha TEXT,                        -- YYYY-MM-DD
  hora TEXT,                         -- HH:MM
  status TEXT,                       -- 'Cobrado'|'Confirmado'|'Reservado'|'Cancelado'|'FueraTiempo'
  espacios_duracion INTEGER DEFAULT 1, -- Duración en slots
  spacio INTEGER DEFAULT 0,          -- Columna (0, 1, 2...)
  notas TEXT,
  notas2 TEXT,
  ban_cita INTEGER DEFAULT 0,        -- 1 = empleado solicitado
  ban_liquid_credito INTEGER DEFAULT 0,
  id_caja INTEGER DEFAULT 0,
  folio INTEGER DEFAULT 0,
  lnk_fecha INTEGER,                 -- FK → tagenda_lnk_fecha

  -- Campos de pago
  efectivo REAL DEFAULT 0,
  tarjeta REAL DEFAULT 0,
  transferencia REAL DEFAULT 0,
  deposito REAL DEFAULT 0,
  puntos REAL DEFAULT 0,
  credito REAL DEFAULT 0,
  apartado REAL DEFAULT 0
);
```

**Campos Clave**:
- `id`: ID único de la cita
- `handel`: Multi-tenant (ID de sucursal)
- `id_personal`: Quién atiende
- `fecha + hora`: Cuándo es la cita
- `espacios_duracion`: Cuántos slots ocupa (1 slot = 15/30 min)
- `spacio`: En qué columna está (posición en agenda)
- `status`: Estado de la cita

**Índices Recomendados**:
```sql
CREATE INDEX idx_tagenda_fecha ON tagenda(fecha);
CREATE INDEX idx_tagenda_handel_fecha ON tagenda(handel, fecha);
CREATE INDEX idx_tagenda_status ON tagenda(status);
```

---

#### 2. **tclientes** - Clientes

```sql
CREATE TABLE tclientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,
  nombrecto TEXT,                    -- Nombre completo
  nombre TEXT,
  apaterno TEXT,
  amaterno TEXT,
  tel1 TEXT,
  tel2 TEXT,
  email1 TEXT,
  codPaisTel1 TEXT DEFAULT '+52',
  medio_promo TEXT                   -- Cómo se enteró del negocio
);
```

---

#### 3. **tusuarios** - Personal/Terapeutas

```sql
CREATE TABLE tusuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,
  alias TEXT,                        -- Nombre corto para agenda
  nombre TEXT,
  apaterno TEXT,
  amaterno TEXT,
  nombrecto TEXT,
  activo TEXT DEFAULT 'Si',          -- 'Si' | 'No'
  id_permiso INTEGER,                -- FK → tpermisos
  orden INTEGER DEFAULT 0            -- Orden en agenda
);
```

**Uso**:
- Encabezados de columnas en agenda
- Filtrado por terapeuta
- Control de disponibilidad

---

#### 4. **tproductos** - Servicios y Productos

```sql
CREATE TABLE tproductos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,
  nombre TEXT,
  codigo TEXT,
  tipo TEXT,                         -- 'Servicio' | 'Producto' | 'Materia prima'
  u_medida TEXT,
  n_duracion INTEGER DEFAULT 1       -- Duración en slots
);
```

**Campo Crítico**:
- `n_duracion`: Determina cuántos espacios de tiempo ocupa el servicio

---

#### 5. **tconfig_gral** - Configuración de Agenda

```sql
CREATE TABLE tconfig_gral (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER UNIQUE NOT NULL,
  id_empresa_base INTEGER,
  puesto_servicio TEXT,              -- 'Terapeuta' | 'Doctor' | 'Estilista'
  hora_inicio INTEGER DEFAULT 9,     -- 9 = 9:00 AM
  hora_fin INTEGER DEFAULT 18,       -- 18 = 6:00 PM
  minutos_incremento INTEGER DEFAULT 30,

  -- Colores por estado
  color_libre TEXT DEFAULT '#ffffff',
  color_reservada TEXT DEFAULT '#FFF3CD',
  color_confirmada TEXT DEFAULT '#D4EDDA',
  color_cancelada TEXT DEFAULT '#F8D7DA',
  color_cobrado TEXT DEFAULT '#CCE5FF',
  color_fuera_tiempo TEXT DEFAULT '#E9ECEF',

  -- Configuración visual
  most_disponibilidad TEXT DEFAULT 'SI',
  rangoManual TEXT DEFAULT 'NO',
  rangoHora TEXT DEFAULT 'SI',
  vizNombreTerapeuta TEXT DEFAULT 'SI',
  Filas TEXT,
  num_columnas INTEGER DEFAULT 0
);
```

**Configuración Importante**:
- `hora_inicio`, `hora_fin`: Define horario de operación
- `minutos_incremento`: Tamaño de cada slot (15, 30, 60 min)
- `vizNombreTerapeuta`: Si muestra nombres o solo números

---

#### 6. **tespacios_adicionales** - Columnas Auxiliares

```sql
CREATE TABLE tespacios_adicionales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,
  fecha TEXT NOT NULL,
  col_aux INTEGER DEFAULT 0,         -- Número de columnas extra
  UNIQUE(handel, fecha)
);
```

**Uso**:
- Cuando todos los terapeutas están ocupados
- Se crean columnas "auxiliares" temporales
- Útil para días con alta demanda

---

#### 7. **tagenda_aux** - Servicios de Citas

```sql
CREATE TABLE tagenda_aux (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_agenda INTEGER NOT NULL,        -- FK → tagenda
  id_producto_servicio INTEGER,      -- FK → tproductos
  cantidad REAL DEFAULT 1,
  costo REAL DEFAULT 0
);
```

**Relación**:
- Una cita puede tener múltiples servicios
- Permite calcular duración total: SUM(tproductos.n_duracion)

---

#### 8-15. Tablas Auxiliares

- **tpermisos**: Roles y permisos
- **tempresas**: Sucursales
- **tempresas_base**: Empresas principales
- **tconfig_gral_aux1**: Horarios especiales (sábados, domingos)
- **tagenda_lnk_fecha**: Optimización de consultas por fecha
- **tinventario**: Control de inventario
- **trecordatorios**: Recordatorios enviados
- **tcontrol_asistencia**: Control de asistencia de personal

---

### Relaciones Clave

```
tempresas_base (id)
    ↓
tempresas (id_empresa_base, handel)
    ↓
tconfig_gral (handel)
tusuarios (handel) ────┐
tclientes (handel) ────┤
tproductos (handel) ───┤
    ↓                  ↓
tagenda (handel, id_cliente, id_personal)
    ↓
tagenda_aux (id_agenda) → tproductos (id)
```

---

## 🧮 ALGORITMO DE MAPEO DE AGENDA

### Concepto del Mapa

La agenda se representa como una **matriz bidimensional**:

```
         Col 0     Col 1     Col 2     Col 3 (aux)
Fila 0  [Terapeuta1][Terapeuta2][Terapeuta3][Extra]
09:00   [  vacio  ][  '123'  ][  vacio  ][vacio]
09:30   [  vacio  ][   'X'   ][  '456'  ][vacio]
10:00   [  '789'  ][   'X'   ][   'X'   ][vacio]
10:30   [   'X'   ][  vacio  ][   'X'   ][vacio]
11:00   [  vacio  ][  vacio  ][  vacio  ]['900']
```

**Leyenda**:
- `vacio` (`''`): Espacio libre
- `'123'`: ID de cita que inicia aquí
- `'X'`: Continuación de cita (ocupa varios slots)
- `'i'`: Día inhábil (cerrado)
- `'d'`: Columna deshabilitada

---

### Algoritmo MapaAgenda() - Detallado

```typescript
MapaAgenda(updateData: boolean = true): Reserva[] {
  // 1. INICIALIZACIÓN
  readConfigAgenda();                    // Lee config
  readReservas();                         // Lee citas
  let arrCitas = getInfoReservas();

  // 2. CORRECCIÓN DE DATOS
  // - Si un terapeuta ya no existe, reasignar
  // - Si una hora no existe, aproximar a la más cercana
  correcParamAg(arrTerapeutas, arrCitas, validHora);

  // 3. CREAR MATRIZ VACÍA
  for (columna = 0; columna <= numColumnas + ColTest; columna++) {
    arrMapa[columna] = [];
    for (fila = 0; fila <= numFilas; fila++) {
      arrMapa[columna][fila] = '';     // Todo vacío
    }
  }

  // 4. FASE 1: MAPEAR CITAS NORMALES
  arrCitas.forEach(cita => {
    if (cita.status === 'Cobrado' || 'Confirmado' || 'Reservado') {
      // Buscar columna del terapeuta
      columna = IdentificaColumna(cita.id_personal);
      fila = IdentificaFila(cita.hora);

      // Verificar si hay espacio
      if (isDisponible(fila, columna, cita.duracion)) {
        // Marcar celda inicial con ID
        arrMapa[columna][fila] = String(cita.id_agenda);

        // Marcar continuación con 'X'
        for (let y = fila + 1; y < fila + cita.duracion; y++) {
          arrMapa[columna][y] = 'X';
        }

        cita.seteado = true;
      }
    }
  });

  // 5. FASE 2: MAPEAR EN COLUMNAS AUXILIARES
  arrCitas.forEach(cita => {
    if (!cita.seteado && (cita.status === 'Cobrado' || ...)) {
      // Buscar primera columna auxiliar con espacio
      columna = numTerapeutas;
      while (!isDisponible(fila, columna, cita.duracion)) {
        columna++;
      }

      // Marcar en columna auxiliar
      arrMapa[columna][fila] = String(cita.id_agenda);
      for (let y = fila + 1; y < fila + cita.duracion; y++) {
        arrMapa[columna][y] = 'X';
      }
    }
  });

  // 6. FASE 3: MAPEAR BLOQUEOS
  arrCitas.forEach(cita => {
    if (cita.status === 'FueraTiempo') {
      columna = IdentificaColumna(cita.id_personal);
      fila = IdentificaFila(cita.hora);

      for (let y = fila; y < fila + cita.duracion; y++) {
        if (arrMapa[columna][y] === '') {
          arrMapa[columna][y] = String(cita.id_agenda);
        }
      }
    }
  });

  // 7. FASE 4: AJUSTAR CANCELADAS
  arrCitas.forEach(cita => {
    if (cita.status === 'Cancelado') {
      // Solo ajustar columna, no mapear
      cita.columna_ag = IdentificaColumna(cita.id_personal);
    }
  });

  // 8. FASE 5: BLOQUEAR DÍA INHÁBIL
  if (!disponibilidad.dia_habil) {
    for (columna = 0; columna <= numColumnas; columna++) {
      for (fila = 0; fila <= numFilas; fila++) {
        if (arrMapa[columna][fila] === '') {
          arrMapa[columna][fila] = 'i';  // Inhábil
        }
      }
    }
  }

  // 9. FASE 6: APLICAR RESTRICCIONES
  if (dispony_cols.length > 0) {
    for (columna = 0; columna <= numColumnas; columna++) {
      if (!dispony_cols.includes(columna)) {
        for (fila = 0; fila <= numFilas; fila++) {
          if (arrMapa[columna][fila] === '') {
            arrMapa[columna][fila] = 'd';  // Deshabilitado
          }
        }
      }
    }
  }

  return arrCitas;
}
```

---

### Casos Especiales

#### 1. **Cita que empieza antes del horario de apertura**

```typescript
// Cita: 08:00, duración 4 slots (2 horas)
// Agenda abre a 09:00
// Solución: Solo mapear desde 09:00 con duración reducida

if (cita.hora < hora_inicio) {
  const dif = calcular_diferencia(cita.hora, hora_inicio);
  duracion_restante = cita.duracion - dif;
  fila_inicial = 0; // Primera fila visible
}
```

#### 2. **Terapeuta ya no existe en el sistema**

```typescript
// Si id_personal = 999 ya no está activo
// Solución: Mover a columna auxiliar

if (!arrTerapeutas.includes(cita.id_personal)) {
  cita.id_personal_ag = '';  // Limpiar
  // Se mapeará en FASE 2 (columnas auxiliares)
}
```

#### 3. **Hora no existe en los slots**

```typescript
// Cita: 09:17, pero solo existen 09:00, 09:30, 10:00
// Solución 1 (validHora=true): Agregar "09:17" dinámicamente
// Solución 2 (validHora=false): Aproximar a "09:00"

if (!listHorarios.includes(cita.hora)) {
  if (validHora) {
    listHorarios.push(cita.hora);
    listHorarios.sort();  // Reordenar
  } else {
    // Buscar hora más cercana anterior
    cita.hora_ag = encontrarHoraAnterior(cita.hora);
    cita.notas_ag += ` (Original: ${cita.hora})`;
  }
}
```

---

## 🚀 PROPUESTA DE INTEGRACIÓN

### Opción 1: Migración Completa (Recomendada)

**Ventajas**:
✅ Código completo y probado
✅ Lógica de negocio 100% funcional
✅ Documentación exhaustiva
✅ 80+ métodos listos para usar

**Cambios Necesarios**:
1. Migrar de `sql.js` a `Capacitor SQLite`
2. Adaptar `executeQuery()` y `executeCommand()`
3. Cambiar `localStorage` por persistencia de Capacitor
4. Integrar con sistema de sincronización

**Esfuerzo Estimado**: 2-3 días

---

### Opción 2: Adaptación Parcial

**Qué Reutilizar**:
- ✅ Interfaces (agenda.interfaces.ts)
- ✅ Lógica de MapaAgenda()
- ✅ Métodos de cálculo (IdentificaFila, IdentificaColumna, etc.)
- ✅ Esquemas SQL

**Qué Reescribir**:
- ❌ Capa de base de datos
- ❌ Persistencia

**Esfuerzo Estimado**: 3-4 días

---

### Opción 3: Inspiración (No Recomendada)

Solo usar como referencia y reescribir todo.

**Esfuerzo Estimado**: 2-3 semanas

---

## 📐 PLAN DE IMPLEMENTACIÓN

### FASE 1: Preparación de Base de Datos (Día 1)

#### 1.1 Crear DatabaseService con Capacitor SQLite

**Archivo**: `src/app/core/services/database.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private dbName: string = 'agenda.db';

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initDatabase(): Promise<void> {
    try {
      // Crear/abrir base de datos
      this.db = await this.sqlite.createConnection(
        this.dbName,
        false,  // No encriptada
        'no-encryption',
        1       // Versión
      );

      await this.db.open();

      // Crear tablas
      await this.createTables();

      console.log('Base de datos inicializada');
    } catch (error) {
      console.error('Error inicializando BD:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const tables = [
      // tagenda
      `CREATE TABLE IF NOT EXISTS tagenda (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER NOT NULL,
        id_empresa_base INTEGER,
        id_cliente INTEGER,
        id_personal INTEGER,
        fecha TEXT,
        hora TEXT,
        status TEXT DEFAULT 'Reservado',
        espacios_duracion INTEGER DEFAULT 1,
        spacio INTEGER DEFAULT 0,
        notas TEXT,
        notas2 TEXT,
        ban_cita INTEGER DEFAULT 0,
        ban_liquid_credito INTEGER DEFAULT 0,
        id_caja INTEGER DEFAULT 0,
        folio INTEGER DEFAULT 0,
        lnk_fecha INTEGER,
        efectivo REAL DEFAULT 0,
        tarjeta REAL DEFAULT 0,
        transferencia REAL DEFAULT 0,
        deposito REAL DEFAULT 0,
        puntos REAL DEFAULT 0,
        credito REAL DEFAULT 0,
        apartado REAL DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        uuid_local TEXT,
        version INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted INTEGER DEFAULT 0
      )`,

      // tclientes
      `CREATE TABLE IF NOT EXISTS tclientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER NOT NULL,
        nombrecto TEXT,
        nombre TEXT,
        apaterno TEXT,
        amaterno TEXT,
        tel1 TEXT,
        tel2 TEXT,
        email1 TEXT,
        codPaisTel1 TEXT DEFAULT '+52',
        medio_promo TEXT,
        sync_status TEXT DEFAULT 'synced',
        uuid_local TEXT,
        version INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted INTEGER DEFAULT 0
      )`,

      // ... (resto de tablas)
    ];

    for (const sql of tables) {
      await this.db!.execute(sql);
    }

    // Crear índices
    await this.createIndexes();
  }

  private async createIndexes(): Promise<void> {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_tagenda_fecha ON tagenda(fecha)',
      'CREATE INDEX IF NOT EXISTS idx_tagenda_handel_fecha ON tagenda(handel, fecha)',
      'CREATE INDEX IF NOT EXISTS idx_tagenda_status ON tagenda(status)',
      'CREATE INDEX IF NOT EXISTS idx_tagenda_sync ON tagenda(sync_status)',
      'CREATE INDEX IF NOT EXISTS idx_tclientes_handel ON tclientes(handel)'
    ];

    for (const sql of indexes) {
      await this.db!.execute(sql);
    }
  }

  async executeQuery(query: string, params: any[] = []): Promise<any[]> {
    try {
      const result = await this.db!.query(query, params);
      return result.values || [];
    } catch (error) {
      console.error('Error en query:', error);
      return [];
    }
  }

  async executeCommand(query: string, params: any[] = []): Promise<boolean> {
    try {
      await this.db!.run(query, params);
      return true;
    } catch (error) {
      console.error('Error en command:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.sqlite.closeConnection(this.dbName);
      this.db = null;
    }
  }
}
```

#### 1.2 Adaptar AgendaService para usar DatabaseService

**Archivo**: `src/app/core/services/agenda.service.ts`

**Cambios**:

```typescript
@Injectable({ providedIn: 'root' })
export class AgendaService {
  // ❌ ELIMINAR
  // private db: Database | null = null;
  // private SQL: SqlJsStatic | null = null;

  // ✅ AGREGAR
  constructor(private dbService: DatabaseService) {}

  async initDatabase(): Promise<void> {
    // ✅ Simplificar
    await this.dbService.initDatabase();
  }

  // ✅ ADAPTAR métodos de consulta
  private executeQuery(query: string, params: any[] = []): Promise<any[]> {
    return this.dbService.executeQuery(query, params);
  }

  private executeCommand(query: string, params: any[] = []): Promise<boolean> {
    return this.dbService.executeCommand(query, params);
  }

  // ❌ ELIMINAR
  // private saveDatabase(): void {
  //   localStorage.setItem('agendaDB', ...);
  // }
}
```

**Impacto**:
- Todos los métodos SQL funcionarán igual
- Solo cambiar la capa de acceso a datos

---

### FASE 2: Integración en la App (Día 2)

#### 2.1 Inicializar en AppComponent

**Archivo**: `src/app/app.component.ts`

```typescript
export class AppComponent implements OnInit {
  constructor(
    private databaseService: DatabaseService,
    private agendaService: AgendaService
  ) {}

  async ngOnInit() {
    // 1. Inicializar base de datos
    await this.databaseService.initDatabase();

    // 2. Cargar tema
    const darkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark', darkMode);

    console.log('App inicializada');
  }
}
```

#### 2.2 Actualizar AgendaMainPage

**Archivo**: `src/app/features/agenda/pages/agenda-main/agenda-main.page.ts`

**Cambios**:

```typescript
export class AgendaMainPage implements OnInit {
  // ✅ Datos reales desde BD
  horarios: HorarioAgenda[] = [];
  terapeutas: Terapeuta[] = [];
  mapa: string[][] = [];
  citas: Reserva[] = [];

  selectedDate: Date = new Date();

  constructor(private agendaService: AgendaService) {}

  async ngOnInit() {
    await this.cargarAgenda();
  }

  async cargarAgenda() {
    // 1. Configurar servicio
    this.agendaService.setHandel(117);  // ID de sucursal
    this.agendaService.setEmpresaBase(44);
    this.agendaService.setFechaAg(this.formatDate(this.selectedDate));

    // 2. Leer configuración
    const tieneConfig = await this.agendaService.readConfigAgenda();
    if (!tieneConfig) {
      console.error('No hay configuración de agenda');
      return;
    }

    // 3. Generar mapa
    this.citas = await this.agendaService.MapaAgenda(false);

    // 4. Obtener datos para UI
    this.horarios = this.agendaService.getInfoHorarios(true) as HorarioAgenda[];
    this.terapeutas = this.agendaService.getInfoColsTerapeutas();
    this.mapa = this.agendaService.getArrMapa();

    console.log('Agenda cargada:', {
      horarios: this.horarios.length,
      terapeutas: this.terapeutas.length,
      citas: this.citas.length
    });
  }

  getCeldaClass(columna: number, fila: number): string {
    const valor = this.mapa[columna]?.[fila] || '';

    if (valor === '') return 'libre';
    if (valor === 'X') return 'ocupado';
    if (valor === 'i') return 'inhabil';
    if (valor === 'd') return 'deshabilitado';
    if (!isNaN(parseInt(valor))) return 'reservado';

    return 'libre';
  }

  getCitaInfo(columna: number, fila: number): Reserva | null {
    const valor = this.mapa[columna]?.[fila];
    const citaId = parseInt(valor);

    if (!isNaN(citaId)) {
      return this.citas.find(c => c.id_agenda === citaId) || null;
    }

    return null;
  }

  onCeldaClick(columna: number, fila: number) {
    const citaInfo = this.getCitaInfo(columna, fila);

    if (citaInfo) {
      // Mostrar modal con detalles de cita
      this.mostrarDetalleCita(citaInfo);
    } else {
      // Abrir modal para crear nueva cita
      const terapeuta = this.terapeutas[columna];
      const horario = this.horarios[fila];
      this.crearNuevaCita(terapeuta, horario);
    }
  }

  async onDateChange(fecha: Date) {
    this.selectedDate = fecha;
    await this.cargarAgenda();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
```

#### 2.3 Actualizar HTML de Agenda

**Archivo**: `src/app/features/agenda/pages/agenda-main/agenda-main.page.html`

```html
<ion-content>
  <!-- Timeline de agenda -->
  <div class="agenda-grid">
    <!-- Encabezado con terapeutas -->
    <div class="header-row">
      <div class="hour-header"></div>
      <div class="therapist-header" *ngFor="let terapeuta of terapeutas">
        {{ terapeuta.alias }}
      </div>
    </div>

    <!-- Filas de horarios -->
    <div class="time-row" *ngFor="let horario of horarios; let fila = index">
      <!-- Columna de hora -->
      <div class="hour-label">
        {{ horario.regular }}
      </div>

      <!-- Celdas de citas -->
      <div
        class="cell"
        *ngFor="let terapeuta of terapeutas; let columna = index"
        [ngClass]="getCeldaClass(columna, fila)"
        (click)="onCeldaClick(columna, fila)">

        <!-- Mostrar info de cita si existe -->
        <div *ngIf="getCitaInfo(columna, fila) as cita" class="cita-info">
          <div class="cliente-name">{{ cita.cliente }}</div>
          <div class="servicio">{{ cita.servicios_agenda }}</div>
        </div>
      </div>
    </div>
  </div>
</ion-content>
```

---

### FASE 3: Poblar Base de Datos Inicial (Día 2-3)

#### 3.1 Crear Script de Seed Data

**Archivo**: `src/app/core/services/seed-data.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class SeedDataService {
  constructor(private dbService: DatabaseService) {}

  async insertarDatosPrueba(): Promise<void> {
    // 1. Insertar empresa base
    await this.dbService.executeCommand(`
      INSERT INTO tempresas_base (id, nombre_empresa, activa)
      VALUES (44, 'SyServ', 'SI')
    `);

    // 2. Insertar sucursal
    await this.dbService.executeCommand(`
      INSERT INTO tempresas (handel, id_empresa_base, nombreSucursal_Sel, activa)
      VALUES (117, 44, 'Sucursal Principal', 'Si')
    `);

    // 3. Insertar configuración de agenda
    await this.dbService.executeCommand(`
      INSERT INTO tconfig_gral (
        handel, id_empresa_base, puesto_servicio,
        hora_inicio, hora_fin, minutos_incremento,
        color_libre, color_reservada, color_confirmada,
        color_cancelada, color_cobrado,
        vizNombreTerapeuta
      ) VALUES (
        117, 44, 'Terapeuta',
        9, 19, 30,
        '#ffffff', '#FFF3CD', '#D4EDDA',
        '#F8D7DA', '#CCE5FF',
        'SI'
      )
    `);

    // 4. Insertar permisos
    await this.dbService.executeCommand(`
      INSERT INTO tpermisos (id, handel, nombre)
      VALUES
        (402, 117, 'Terapeuta'),
        (401, 117, 'Recepcionista'),
        (400, 117, 'Administrador')
    `);

    // 5. Insertar terapeutas
    const terapeutas = [
      { id: 739, nombre: 'ANGELICA', apaterno: 'VAZQUEZ', alias: 'Angie', orden: 1 },
      { id: 2273, nombre: 'MONICA', apaterno: 'VIELMA', alias: 'monica', orden: 2 },
      { id: 4924, nombre: 'GLORIA', apaterno: 'FAUSTO', alias: 'gloriag', orden: 3 }
    ];

    for (const t of terapeutas) {
      await this.dbService.executeCommand(`
        INSERT INTO tusuarios (
          id, handel, nombre, apaterno, nombrecto,
          alias, activo, id_permiso, orden
        ) VALUES (
          ?, 117, ?, ?, ?,
          ?, 'Si', 402, ?
        )
      `, [t.id, t.nombre, t.apaterno, `${t.nombre} ${t.apaterno}`, t.alias, t.orden]);
    }

    // 6. Insertar servicios
    const servicios = [
      { id: 1, nombre: 'Corte de Cabello', codigo: 'CORTE', n_duracion: 2 },
      { id: 2, nombre: 'Tinte', codigo: 'TINTE', n_duracion: 4 },
      { id: 3, nombre: 'Manicure', codigo: 'MANIC', n_duracion: 2 },
      { id: 4, nombre: 'Pedicure', codigo: 'PEDIC', n_duracion: 2 },
      { id: 5, nombre: 'Masaje', codigo: 'MASAJ', n_duracion: 4 }
    ];

    for (const s of servicios) {
      await this.dbService.executeCommand(`
        INSERT INTO tproductos (
          id, handel, nombre, codigo, tipo, n_duracion
        ) VALUES (?, 117, ?, ?, 'Servicio', ?)
      `, [s.id, s.nombre, s.codigo, s.n_duracion]);
    }

    // 7. Insertar clientes de ejemplo
    const clientes = [
      { id: 1, nombrecto: 'Juan Pérez', tel1: '5551234567' },
      { id: 2, nombrecto: 'María García', tel1: '5559876543' },
      { id: 3, nombrecto: 'Carlos López', tel1: '5555555555' },
      { id: 4, nombrecto: 'Ana Martínez', tel1: '5554443333' },
      { id: 5, nombrecto: 'Pedro Sánchez', tel1: '5552221111' }
    ];

    for (const c of clientes) {
      await this.dbService.executeCommand(`
        INSERT INTO tclientes (id, handel, nombrecto, tel1)
        VALUES (?, 117, ?, ?)
      `, [c.id, c.nombrecto, c.tel1]);
    }

    // 8. Insertar citas de ejemplo
    await this.insertarCitasEjemplo();

    console.log('Datos de prueba insertados');
  }

  private async insertarCitasEjemplo(): Promise<void> {
    const hoy = new Date();
    const fecha = hoy.toISOString().split('T')[0];

    // Insertar lnk_fecha
    await this.dbService.executeCommand(`
      INSERT INTO tagenda_lnk_fecha (fecha) VALUES (?)
    `, [fecha]);

    const lnkResult = await this.dbService.executeQuery(`
      SELECT id FROM tagenda_lnk_fecha WHERE fecha = ?
    `, [fecha]);
    const lnk_fecha = lnkResult[0].id;

    // Citas de ejemplo
    const citas = [
      { id_cliente: 1, id_personal: 739, hora: '09:30', duracion: 2, status: 'Confirmado', spacio: 0 },
      { id_cliente: 2, id_personal: 2273, hora: '10:00', duracion: 4, status: 'Reservado', spacio: 1 },
      { id_cliente: 3, id_personal: 4924, hora: '11:00', duracion: 2, status: 'Cobrado', spacio: 2 },
      { id_cliente: 4, id_personal: 739, hora: '14:00', duracion: 2, status: 'Confirmado', spacio: 0 },
      { id_cliente: 5, id_personal: 2273, hora: '15:30', duracion: 4, status: 'Reservado', spacio: 1 }
    ];

    for (const cita of citas) {
      const result = await this.dbService.executeCommand(`
        INSERT INTO tagenda (
          handel, id_empresa_base, id_cliente, id_personal,
          fecha, hora, status, espacios_duracion, spacio, lnk_fecha
        ) VALUES (117, 44, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        cita.id_cliente, cita.id_personal, fecha, cita.hora,
        cita.status, cita.duracion, cita.spacio, lnk_fecha
      ]);

      // Obtener ID de la cita
      const citaResult = await this.dbService.executeQuery(`
        SELECT last_insert_rowid() as id
      `);
      const id_agenda = citaResult[0].id;

      // Insertar servicio asociado
      await this.dbService.executeCommand(`
        INSERT INTO tagenda_aux (id_agenda, id_producto_servicio, cantidad)
        VALUES (?, 1, 1)
      `, [id_agenda]);
    }
  }
}
```

#### 3.2 Llamar Seed al Iniciar App

**Archivo**: `src/app/app.component.ts`

```typescript
async ngOnInit() {
  await this.databaseService.initDatabase();

  // Verificar si es primera vez
  const hasData = await this.checkIfHasData();
  if (!hasData) {
    console.log('Insertando datos de prueba...');
    await this.seedDataService.insertarDatosPrueba();
  }

  // Cargar tema
  const darkMode = localStorage.getItem('darkMode') === 'true';
  document.body.classList.toggle('dark', darkMode);
}

private async checkIfHasData(): Promise<boolean> {
  const result = await this.databaseService.executeQuery(`
    SELECT COUNT(*) as count FROM tconfig_gral
  `);
  return result[0]?.count > 0;
}
```

---

### FASE 4: Testing y Ajustes (Día 3)

#### 4.1 Casos de Prueba

1. **Inicialización**
   - ✅ Base de datos se crea correctamente
   - ✅ Tablas están presentes
   - ✅ Datos de seed se insertan

2. **Lectura de Configuración**
   - ✅ `readConfigAgenda()` retorna datos
   - ✅ Terapeutas se cargan
   - ✅ Horarios se generan

3. **Mapeo de Agenda**
   - ✅ Mapa se genera sin errores
   - ✅ Citas aparecen en celdas correctas
   - ✅ Continuaciones ('X') se marcan

4. **UI de Agenda**
   - ✅ Horarios se muestran
   - ✅ Terapeutas aparecen en encabezado
   - ✅ Celdas tienen colores correctos
   - ✅ Click en celda funciona

---

## 🔄 AJUSTES DINÁMICOS NECESARIOS

### 1. Campos Adicionales para Sincronización

Agregar a **todas las tablas**:

```sql
ALTER TABLE tagenda ADD COLUMN sync_status TEXT DEFAULT 'synced';
ALTER TABLE tagenda ADD COLUMN uuid_local TEXT;
ALTER TABLE tagenda ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE tagenda ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tagenda ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tagenda ADD COLUMN deleted INTEGER DEFAULT 0;
```

**Propósito**:
- `sync_status`: 'pending' | 'synced' | 'conflict'
- `uuid_local`: UUID v4 generado localmente
- `version`: Control de versiones para conflictos
- `created_at`, `updated_at`: Timestamps
- `deleted`: Soft delete

---

### 2. Tabla Outbox para Cola de Sincronización

```sql
CREATE TABLE outbox (
  op_id TEXT PRIMARY KEY,              -- UUID de operación
  type TEXT NOT NULL,                  -- 'CREATE_APPOINTMENT' | 'UPDATE_APPOINTMENT' | 'CANCEL_APPOINTMENT'
  company_id INTEGER NOT NULL,
  entity TEXT NOT NULL,                -- 'tagenda' | 'tclientes'
  entity_id INTEGER,                   -- ID local de la entidad
  payload TEXT NOT NULL,               -- JSON del registro completo
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  attempts INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',       -- 'pending' | 'processing' | 'completed' | 'failed'
  last_error TEXT,
  last_attempt TEXT
);
```

---

### 3. Tabla Sync State

```sql
CREATE TABLE sync_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  resource TEXT NOT NULL,              -- 'catalogs' | 'agenda' | 'clientes'
  last_full_sync TEXT,                 -- Timestamp última sync completa
  last_delta_sync TEXT,                -- Timestamp última sync incremental
  last_window_from TEXT,               -- Ventana de fechas
  last_window_to TEXT,
  UNIQUE(company_id, resource)
);
```

---

### 4. Ajustes a AgendaService

#### 4.1 Generar UUID Local al Crear Cita

```typescript
async crearCitaOffline(citaData: any): Promise<number> {
  const uuid_local = this.generateUUID();

  const query = `
    INSERT INTO tagenda (
      uuid_local, handel, id_cliente, id_personal,
      fecha, hora, status, espacios_duracion,
      sync_status, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 1)
  `;

  await this.dbService.executeCommand(query, [
    uuid_local,
    citaData.handel,
    citaData.id_cliente,
    citaData.id_personal,
    citaData.fecha,
    citaData.hora,
    'Reservado',
    citaData.espacios_duracion
  ]);

  // Obtener ID local
  const result = await this.dbService.executeQuery(`
    SELECT last_insert_rowid() as id
  `);
  const id_local = result[0].id;

  // Agregar a outbox
  await this.addToOutbox('CREATE_APPOINTMENT', 'tagenda', id_local, citaData);

  return id_local;
}

private generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

private async addToOutbox(type: string, entity: string, entity_id: number, payload: any): Promise<void> {
  const op_id = this.generateUUID();

  await this.dbService.executeCommand(`
    INSERT INTO outbox (op_id, type, company_id, entity, entity_id, payload)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [op_id, type, this.handel, entity, entity_id, JSON.stringify(payload)]);
}
```

---

### 5. Configuración Multi-Tenant Dinámica

#### 5.1 Leer Sucursal del Usuario Logueado

```typescript
// En AuthService
interface User {
  id: number;
  email: string;
  name: string;
  companyId: number;    // Empresa base
  handel: number;       // Sucursal
  token: string;
}

// Al hacer login
async login(email: string, password: string): Promise<LoginResponse> {
  // ... llamada a API
  const user = {
    id: response.user.id,
    email: response.user.email,
    name: response.user.name,
    companyId: response.user.id_empresa_base,
    handel: response.user.handel,
    token: response.access_token
  };

  // Configurar AgendaService automáticamente
  this.agendaService.setHandel(user.handel);
  this.agendaService.setEmpresaBase(user.companyId);

  return { success: true, user };
}
```

---

## ✅ RESUMEN DE CAMBIOS

### Archivos a Crear

1. ✅ `src/app/core/services/database.service.ts` (300 líneas)
2. ✅ `src/app/core/services/seed-data.service.ts` (200 líneas)
3. ✅ `src/app/core/services/agenda.service.ts` (copiar desde algoritmo-syserv, adaptar)
4. ✅ `src/app/core/interfaces/agenda.interfaces.ts` (copiar desde algoritmo-syserv)

### Archivos a Modificar

1. ✅ `src/app/app.component.ts` - Inicializar BD
2. ✅ `src/app/features/agenda/pages/agenda-main/agenda-main.page.ts` - Usar datos reales
3. ✅ `src/app/features/agenda/pages/agenda-main/agenda-main.page.html` - Renderizar mapa
4. ✅ `src/app/core/services/auth.service.ts` - Configurar multi-tenant

### Esquemas SQL a Adaptar

- ✅ 15 tablas CREATE TABLE
- ✅ 3 tablas adicionales (outbox, sync_state, configuración)
- ✅ 10 índices para performance

### Líneas de Código Estimadas

- DatabaseService: ~300 líneas
- SeedDataService: ~200 líneas
- AgendaService (adaptado): ~2,200 líneas
- Interfaces: ~250 líneas
- Modificaciones en páginas: ~150 líneas
- **Total**: ~3,100 líneas

---

## 🚦 PRÓXIMOS PASOS

1. ✅ **Revisar y aprobar este análisis**
2. ✅ **Iniciar FASE 1**: Crear DatabaseService
3. ✅ **FASE 2**: Adaptar AgendaService
4. ✅ **FASE 3**: Integrar en AgendaMainPage
5. ✅ **FASE 4**: Poblar datos de prueba
6. ✅ **FASE 5**: Testing y ajustes

---

**Fin del Análisis** | Documento Completo | Listo para Implementación
