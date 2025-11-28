# 📊 COMPARACIÓN: Sistema SyServ Original vs Implementación Actual

**Fecha**: 2025-11-21
**Propósito**: Análisis de compatibilidad para sincronización con servidor

---

## ⚠️ PROBLEMAS CRÍTICOS DE INCOMPATIBILIDAD

### 🔴 **PROBLEMA 1: Estructura de Tabla Principal**

#### Sistema Original (tagenda)
```sql
CREATE TABLE tagenda (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,
  id_empresa_base INTEGER,
  id_cliente INTEGER,
  id_personal INTEGER,
  fecha TEXT,                        -- YYYY-MM-DD
  hora TEXT,                         -- HH:MM
  status TEXT,                       -- 'Cobrado'|'Confirmado'|'Reservado'|'Cancelado'|'FueraTiempo'
  espacios_duracion INTEGER DEFAULT 1, -- ⚠️ CAMPO CRÍTICO
  spacio INTEGER DEFAULT 0,          -- ⚠️ COLUMNA EN AGENDA
  notas TEXT,
  notas2 TEXT,
  ban_cita INTEGER DEFAULT 0,
  ban_liquid_credito INTEGER DEFAULT 0,
  id_caja INTEGER DEFAULT 0,
  folio INTEGER DEFAULT 0,
  lnk_fecha INTEGER,                 -- ⚠️ OPTIMIZACIÓN

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

#### Implementación Actual (citas)
```sql
CREATE TABLE citas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL DEFAULT 1,
  id_empresa_base INTEGER NOT NULL DEFAULT 1,
  id_cliente INTEGER,
  id_personal INTEGER,
  id_servicio INTEGER,              -- ❌ NO EXISTE EN ORIGINAL
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  duracion INTEGER,                 -- ❌ DIFERENTE: debe ser "espacios_duracion"
  status TEXT DEFAULT 'Reservado',
  notas TEXT,
  activo INTEGER DEFAULT 1,         -- ❌ SOFT DELETE (no en original)
  created_at TEXT,                  -- ❌ NO EXISTE EN ORIGINAL
  updated_at TEXT                   -- ❌ NO EXISTE EN ORIGINAL
);
```

### 🚨 **CAMPOS FALTANTES CRÍTICOS**

| Campo Original | Actual | Impacto |
|----------------|--------|---------|
| `espacios_duracion` | `duracion` | 🔴 **CRÍTICO** - Nombre diferente |
| `spacio` | ❌ NO EXISTE | 🔴 **CRÍTICO** - Mapeo de columna |
| `notas2` | ❌ NO EXISTE | 🟡 Menor |
| `ban_cita` | ❌ NO EXISTE | 🟡 Menor |
| `ban_liquid_credito` | ❌ NO EXISTE | 🟡 Menor |
| `id_caja` | ❌ NO EXISTE | 🟡 Menor |
| `folio` | ❌ NO EXISTE | 🟡 Menor |
| `lnk_fecha` | ❌ NO EXISTE | 🔴 **CRÍTICO** - Optimización |
| `efectivo, tarjeta, etc.` | ❌ NO EXISTE | 🟡 Menor (pagos) |

### 🚨 **CAMPOS EXTRA QUE NO DEBEN ESTAR**

| Campo Actual | En Original | Problema |
|--------------|-------------|----------|
| `id_servicio` | ❌ NO | Debe ir en `tagenda_aux` |
| `activo` | ❌ NO | Soft delete (puede causar conflictos) |
| `created_at` | ❌ NO | Timestamp no sincronizado |
| `updated_at` | ❌ NO | Timestamp no sincronizado |

---

## 🔴 **PROBLEMA 2: Tabla de Servicios Faltante**

### Sistema Original: tagenda_aux
```sql
CREATE TABLE tagenda_aux (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_agenda INTEGER NOT NULL,        -- FK → tagenda.id
  id_producto_servicio INTEGER,      -- FK → tproductos.id
  cantidad REAL DEFAULT 1,
  costo REAL DEFAULT 0
);
```

**Relación**:
- Una cita en `tagenda` puede tener MÚLTIPLES servicios en `tagenda_aux`
- Se hace JOIN para obtener servicios concatenados con GROUP_CONCAT

### Implementación Actual
```sql
-- ❌ NO EXISTE TABLA tagenda_aux
-- ❌ El servicio está directamente en tabla "citas" (INCORRECTO)
```

**Impacto**: 🔴 **CRÍTICO**
- No se pueden guardar múltiples servicios por cita
- Al sincronizar, el servidor no entenderá la estructura
- Los datos se perderán o causarán errores

---

## 🔴 **PROBLEMA 3: Campo "espacios_duracion" vs "duracion"**

### Sistema Original
- **Campo**: `espacios_duracion`
- **Unidad**: Número de SLOTS (1 slot = 30 minutos en config)
- **Ejemplo**:
  - `espacios_duracion = 2` → 1 hora (2 × 30 min)
  - `espacios_duracion = 4` → 2 horas (4 × 30 min)

### Implementación Actual
- **Campo**: `duracion`
- **Unidad**: ⚠️ **MINUTOS DIRECTOS** (30, 60, 90...)
- **Problema**:
  - Guardamos `30` minutos directamente
  - El servidor espera `1` (1 slot)
  - Al sincronizar: **INCOMPATIBILIDAD TOTAL**

### Solución Requerida
```typescript
// Al guardar en SQLite
const minutos_incremento = 30; // Desde config_agenda
const espacios_duracion = Math.ceil(duracion_minutos / minutos_incremento);

// Ejemplo: duracion_minutos = 60
// espacios_duracion = 60 / 30 = 2 ✅
```

---

## 🔴 **PROBLEMA 4: Campo "spacio" (Columna en Agenda)**

### Sistema Original
```sql
spacio INTEGER DEFAULT 0  -- Número de columna (0, 1, 2, 3...)
```

**Uso**:
```typescript
// MapaAgenda() asigna la columna donde se renderiza la cita
cita.spacio = 0; // Primera columna (Terapeuta 1)
cita.spacio = 1; // Segunda columna (Terapeuta 2)
cita.spacio = 3; // Columna auxiliar

// Algoritmo:
columna = cita.spacio;
fila = IdentificaFila(cita.hora);
arrMapa[columna][fila] = String(cita.id);
```

### Implementación Actual
- ❌ **NO EXISTE CAMPO `spacio`**
- No se guarda la columna de renderizado
- Al sincronizar, el servidor no sabrá dónde ubicar la cita

### Impacto
- Citas sincronizadas aparecerán "flotando"
- El algoritmo `MapaAgenda()` fallará
- Pérdida de posicionamiento visual

---

## 🔴 **PROBLEMA 5: Tabla de Optimización "tagenda_lnk_fecha"**

### Sistema Original
```sql
CREATE TABLE tagenda_lnk_fecha (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT UNIQUE NOT NULL
);

-- Relación:
-- tagenda.lnk_fecha → tagenda_lnk_fecha.id
```

**Propósito**:
- Optimización de consultas por fecha
- Reduce escaneos completos de tabla
- Permite índices más eficientes

### Implementación Actual
- ❌ **NO EXISTE**
- Todas las citas tienen `lnk_fecha = NULL`
- Al sincronizar: **FOREIGN KEY CONSTRAINT FAILED**

---

## 🟡 **PROBLEMA 6: Tabla "tconfig_gral" vs "config_agenda"**

### Sistema Original
```sql
CREATE TABLE tconfig_gral (
  handel INTEGER UNIQUE NOT NULL,
  puesto_servicio TEXT,
  hora_inicio INTEGER DEFAULT 9,
  hora_fin INTEGER DEFAULT 18,
  minutos_incremento INTEGER DEFAULT 30,
  -- ... (50+ campos más)
);
```

### Implementación Actual
```sql
CREATE TABLE config_agenda (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL DEFAULT 1,
  puesto_servicio TEXT DEFAULT 'Terapeuta',
  hora_inicio INTEGER DEFAULT 9,
  hora_fin INTEGER DEFAULT 20,
  minutos_incremento INTEGER DEFAULT 30,
  -- ... (algunos campos)
);
```

**Diferencias**:
- ✅ Nombres de campos compatibles
- ⚠️ Valores default diferentes (hora_fin: 18 vs 20)
- ⚠️ Pueden faltar campos opcionales
- ⚠️ Nombre de tabla diferente

**Impacto**: 🟡 **MODERADO** (puede funcionar si se mapea correctamente)

---

## 🟢 **COMPATIBILIDAD CORRECTA**

### Tablas Compatibles

#### 1. **clientes** ≈ **tclientes** ✅
```sql
-- Implementación Actual
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY,
  handel INTEGER,
  nombre TEXT,
  apaterno TEXT,
  amaterno TEXT,
  tel1 TEXT,
  email1 TEXT,
  -- ...
);
```
- ✅ Estructura compatible
- ✅ Nombres de campos coinciden
- ⚠️ Falta `nombrecto` (nombre completo concatenado)

#### 2. **personal** ≈ **tusuarios** ✅
```sql
-- Implementación Actual
CREATE TABLE personal (
  id INTEGER PRIMARY KEY,
  handel INTEGER,
  alias TEXT,
  nombre TEXT,
  apellidos TEXT,
  activo INTEGER,
  orden INTEGER,
  -- ...
);
```
- ✅ Estructura compatible
- ⚠️ Campo `activo` es INTEGER, original es TEXT ('Si'/'No')
- ⚠️ Falta campo `nombrecto`

#### 3. **productos** ≈ **tproductos** ✅
```sql
-- Implementación Actual
CREATE TABLE productos (
  id INTEGER PRIMARY KEY,
  handel INTEGER,
  codigo TEXT,
  nombre TEXT,
  tipo TEXT DEFAULT 'Servicio',
  n_duracion INTEGER,
  precio REAL,
  -- ...
);
```
- ✅ **PERFECTAMENTE COMPATIBLE**
- ✅ `n_duracion` en número de slots ✅

---

## 📋 **CHECKLIST DE COMPATIBILIDAD**

### Tabla Principal de Citas

| Requisito | Estado | Acción |
|-----------|--------|--------|
| Nombre de tabla: `tagenda` | ❌ Usa `citas` | 🔴 Renombrar o mapear |
| Campo `espacios_duracion` | ❌ Usa `duracion` | 🔴 Renombrar |
| Campo `spacio` | ❌ NO EXISTE | 🔴 Agregar |
| Campo `notas2` | ❌ NO EXISTE | 🟡 Agregar |
| Campo `ban_cita` | ❌ NO EXISTE | 🟡 Agregar |
| Campo `lnk_fecha` | ❌ NO EXISTE | 🔴 Agregar |
| Campos de pago | ❌ NO EXISTEN | 🟡 Agregar |
| Campo `id_servicio` | ❌ **DEBE ELIMINARSE** | 🔴 Quitar |

### Tabla de Servicios por Cita

| Requisito | Estado | Acción |
|-----------|--------|--------|
| Tabla `tagenda_aux` existe | ❌ NO EXISTE | 🔴 **CREAR** |
| Relación 1:N (cita → servicios) | ❌ 1:1 | 🔴 Cambiar lógica |

### Optimizaciones

| Requisito | Estado | Acción |
|-----------|--------|--------|
| Tabla `tagenda_lnk_fecha` | ❌ NO EXISTE | 🔴 Crear |
| Índices por fecha | ✅ SÍ | ✅ OK |

---

## 🔧 **ACCIONES CORRECTIVAS REQUERIDAS**

### 1. **URGENTE: Modificar Estructura de "citas"**

```sql
-- OPCIÓN A: Renombrar y agregar campos
ALTER TABLE citas RENAME TO tagenda;
ALTER TABLE tagenda RENAME COLUMN duracion TO espacios_duracion;
ALTER TABLE tagenda ADD COLUMN spacio INTEGER DEFAULT 0;
ALTER TABLE tagenda ADD COLUMN notas2 TEXT;
ALTER TABLE tagenda ADD COLUMN ban_cita INTEGER DEFAULT 0;
ALTER TABLE tagenda ADD COLUMN ban_liquid_credito INTEGER DEFAULT 0;
ALTER TABLE tagenda ADD COLUMN lnk_fecha INTEGER;
ALTER TABLE tagenda ADD COLUMN efectivo REAL DEFAULT 0;
ALTER TABLE tagenda ADD COLUMN tarjeta REAL DEFAULT 0;
ALTER TABLE tagenda DROP COLUMN id_servicio;  -- ⚠️ Mover a tagenda_aux
```

### 2. **URGENTE: Crear Tabla tagenda_aux**

```sql
CREATE TABLE tagenda_aux (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_agenda INTEGER NOT NULL,
  id_producto_servicio INTEGER,
  cantidad REAL DEFAULT 1,
  costo REAL DEFAULT 0,
  FOREIGN KEY (id_agenda) REFERENCES tagenda(id),
  FOREIGN KEY (id_producto_servicio) REFERENCES productos(id)
);

CREATE INDEX idx_tagenda_aux_id_agenda ON tagenda_aux(id_agenda);
```

### 3. **URGENTE: Modificar Lógica de Guardado**

```typescript
// ANTES (INCORRECTO)
await this.databaseService.addCita({
  id_cliente: 1,
  id_personal: 2,
  id_servicio: 3,  // ❌ NO DEBE ESTAR AQUÍ
  fecha: '2025-11-21',
  hora: '10:00',
  duracion: 60,    // ❌ Debe ser espacios_duracion
  status: 'Reservado'
});

// DESPUÉS (CORRECTO)
// 1. Calcular espacios_duracion
const minutos_incremento = 30;
const espacios_duracion = Math.ceil(duracion_minutos / minutos_incremento);

// 2. Obtener/crear lnk_fecha
const lnk_fecha = await this.getOrCreateLnkFecha(fecha);

// 3. Determinar spacio (columna)
const spacio = await this.calcularSpacio(id_personal, fecha, hora);

// 4. Insertar en tagenda (SIN id_servicio)
const id_agenda = await this.db.run(`
  INSERT INTO tagenda (
    handel, id_empresa_base, id_cliente, id_personal,
    fecha, hora, status, espacios_duracion, spacio, lnk_fecha
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
  handel, id_empresa_base, id_cliente, id_personal,
  fecha, hora, status, espacios_duracion, spacio, lnk_fecha
]);

// 5. Insertar servicios en tagenda_aux
for (const servicio of servicios) {
  await this.db.run(`
    INSERT INTO tagenda_aux (id_agenda, id_producto_servicio, cantidad, costo)
    VALUES (?, ?, ?, ?)
  `, [id_agenda, servicio.id, servicio.cantidad, servicio.precio]);
}
```

### 4. **URGENTE: Crear Tabla tagenda_lnk_fecha**

```sql
CREATE TABLE tagenda_lnk_fecha (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT UNIQUE NOT NULL
);

CREATE INDEX idx_lnk_fecha_fecha ON tagenda_lnk_fecha(fecha);
```

```typescript
async getOrCreateLnkFecha(fecha: string): Promise<number> {
  // Buscar existente
  const result = await this.db.query(
    'SELECT id FROM tagenda_lnk_fecha WHERE fecha = ?',
    [fecha]
  );

  if (result.values?.length > 0) {
    return result.values[0].id;
  }

  // Crear nuevo
  await this.db.run(
    'INSERT INTO tagenda_lnk_fecha (fecha) VALUES (?)',
    [fecha]
  );

  const inserted = await this.db.query(
    'SELECT last_insert_rowid() as id'
  );

  return inserted.values[0].id;
}
```

### 5. **IMPORTANTE: Calcular Campo "spacio"**

```typescript
async calcularSpacio(
  id_personal: number,
  fecha: string,
  hora: string
): Promise<number> {
  // 1. Obtener configuración
  const config = await this.getConfigAgenda();

  // 2. Obtener lista de terapeutas
  const terapeutas = await this.getAgendaTerapeutas();

  // 3. Encontrar índice del terapeuta
  const indice = terapeutas.findIndex(t => t.id_personal === id_personal);

  if (indice >= 0) {
    return indice; // Columna regular (0, 1, 2...)
  }

  // 4. Si no está en la lista, asignar columna auxiliar
  const numColumnas = terapeutas.length;

  // Buscar primera columna auxiliar disponible
  let spacio = numColumnas;
  const fila = await this.IdentificaFila(hora);
  const espacios_duracion = 2; // Ejemplo

  while (!await this.isDisponible(fila, spacio, espacios_duracion, fecha)) {
    spacio++;
  }

  return spacio;
}
```

---

## 🎯 **CONCLUSIONES**

### ❌ **LA IMPLEMENTACIÓN ACTUAL NO ES COMPATIBLE**

**Razones**:
1. 🔴 Tabla `citas` tiene estructura completamente diferente a `tagenda`
2. 🔴 NO existe tabla `tagenda_aux` para múltiples servicios
3. 🔴 Campo `duracion` en minutos, debe ser `espacios_duracion` en slots
4. 🔴 Falta campo `spacio` para posicionamiento en agenda
5. 🔴 Falta tabla `tagenda_lnk_fecha` para optimización

### ✅ **SOLUCIONES DISPONIBLES**

#### Opción 1: **Migración Completa** (Recomendado)
- Renombrar y modificar tabla `citas` → `tagenda`
- Crear tabla `tagenda_aux`
- Crear tabla `tagenda_lnk_fecha`
- Actualizar toda la lógica de guardado
- **Tiempo estimado**: 1 día

#### Opción 2: **Capa de Mapeo** (Temporal)
- Mantener estructura actual
- Crear servicio de transformación al sincronizar
- Mapear `citas` → `tagenda` + `tagenda_aux`
- **Problema**: Duplicación de lógica
- **Tiempo estimado**: 2 días

#### Opción 3: **Reescritura** (Más seguro)
- Empezar de cero con estructura correcta
- Usar el código de `algoritmo-syserv` como base
- Implementar exactamente igual al servidor
- **Tiempo estimado**: 3-4 días

---

## 📝 **RECOMENDACIÓN FINAL**

### ✅ **IMPLEMENTAR OPCIÓN 1: Migración Completa**

**Justificación**:
1. Es la única forma de garantizar compatibilidad 100%
2. Evita bugs y pérdida de datos en sincronización
3. Permite usar el algoritmo `MapaAgenda()` sin modificaciones
4. Estructura probada en producción (sistema web original)

**Pasos**:
1. ✅ Crear script de migración de esquema
2. ✅ Actualizar métodos de guardado/lectura
3. ✅ Migrar datos existentes (si los hay)
4. ✅ Testing exhaustivo
5. ✅ Documentar cambios

---

**Autor**: Análisis basado en ANALISIS_ALGORITMO_SYSERV.md
**Última actualización**: 2025-11-21
