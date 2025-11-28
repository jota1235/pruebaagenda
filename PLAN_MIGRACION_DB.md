# Plan de Migración de Base de Datos - Compatibilidad con syserv

## Objetivo

Migrar la estructura actual de `citas` a una estructura compatible con el sistema syserv original (`tagenda` + `tagenda_aux`) para garantizar sincronización sin pérdida de datos.

## Estado Actual vs Estado Objetivo

### ❌ Estructura Actual (INCOMPATIBLE)

```sql
CREATE TABLE citas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,
  id_empresa_base INTEGER NOT NULL,
  id_cliente INTEGER NOT NULL,
  id_personal INTEGER NOT NULL,
  id_servicio INTEGER NOT NULL,  -- ❌ NO DEBE ESTAR AQUÍ
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  duracion INTEGER NOT NULL,  -- ❌ EN MINUTOS, DEBE SER SLOTS
  status TEXT DEFAULT 'Reservado',
  notas TEXT,
  activo INTEGER DEFAULT 1
);
```

### ✅ Estructura Objetivo (COMPATIBLE SYSERV)

```sql
-- Tabla principal de citas
CREATE TABLE tagenda (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,
  id_empresa_base INTEGER NOT NULL,
  id_cliente INTEGER NOT NULL,
  id_personal INTEGER NOT NULL,
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  espacios_duracion INTEGER DEFAULT 1,  -- ✅ Duración en SLOTS
  spacio INTEGER DEFAULT 0,  -- ✅ Posición en columna
  status TEXT DEFAULT 'Reservado',
  notas TEXT,
  notas2 TEXT,  -- ✅ Notas adicionales
  ban_cita INTEGER DEFAULT 0,  -- ✅ Banner/flag
  lnk_fecha INTEGER,  -- ✅ FK a tagenda_lnk_fecha
  efectivo REAL DEFAULT 0,  -- ✅ Pago efectivo
  tarjeta REAL DEFAULT 0,  -- ✅ Pago tarjeta
  transferencia REAL DEFAULT 0,  -- ✅ Pago transferencia
  credito REAL DEFAULT 0,  -- ✅ Pago a crédito
  activo INTEGER DEFAULT 1,
  FOREIGN KEY (lnk_fecha) REFERENCES tagenda_lnk_fecha(id)
);

-- Tabla de servicios por cita (uno a muchos)
CREATE TABLE tagenda_aux (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_agenda INTEGER NOT NULL,  -- ✅ FK a tagenda
  id_producto_servicio INTEGER NOT NULL,  -- ✅ FK a productos
  cantidad REAL DEFAULT 1,
  costo REAL DEFAULT 0,
  activo INTEGER DEFAULT 1,
  FOREIGN KEY (id_agenda) REFERENCES tagenda(id),
  FOREIGN KEY (id_producto_servicio) REFERENCES productos(id)
);

-- Tabla de optimización por fecha
CREATE TABLE tagenda_lnk_fecha (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL,
  id_empresa_base INTEGER NOT NULL,
  fecha TEXT NOT NULL,
  activo INTEGER DEFAULT 1,
  UNIQUE(handel, id_empresa_base, fecha)
);

-- Índices para rendimiento
CREATE INDEX idx_tagenda_fecha ON tagenda(fecha);
CREATE INDEX idx_tagenda_personal ON tagenda(id_personal);
CREATE INDEX idx_tagenda_cliente ON tagenda(id_cliente);
CREATE INDEX idx_tagenda_activo ON tagenda(activo);
CREATE INDEX idx_tagenda_lnk_fecha ON tagenda(lnk_fecha);
CREATE INDEX idx_tagenda_aux_agenda ON tagenda_aux(id_agenda);
CREATE INDEX idx_tagenda_aux_servicio ON tagenda_aux(id_producto_servicio);
CREATE INDEX idx_lnk_fecha_fecha ON tagenda_lnk_fecha(fecha);
```

## Cambios Críticos

### 1. **Duración: Minutos → Slots**

```typescript
// ❌ ACTUAL (INCORRECTO)
duracion: 60  // 60 minutos

// ✅ CORRECTO
espacios_duracion: 2  // 2 slots de 30 minutos = 60 minutos
```

**Fórmula de conversión:**
```typescript
const minutos_incremento = 30; // Configuración desde BD
const espacios_duracion = Math.ceil(duracion_minutos / minutos_incremento);

// Ejemplo: 60 min / 30 min = 2 slots
// Ejemplo: 45 min / 30 min = 1.5 → ceil = 2 slots
```

### 2. **Servicios: Columna → Tabla Auxiliar**

```typescript
// ❌ ACTUAL (INCORRECTO)
// Una cita por cada servicio en tabla citas
for (const service of addedServices) {
  await db.insert('citas', {
    id_servicio: service.serviceId,  // ❌ Aquí NO
    duracion: service.duration
  });
}

// ✅ CORRECTO
// Una cita con múltiples servicios en tagenda_aux
const citaId = await db.insert('tagenda', {
  espacios_duracion: totalSlots,
  spacio: calculatedColumn,
  // NO id_servicio aquí
});

for (const service of addedServices) {
  await db.insert('tagenda_aux', {
    id_agenda: citaId,  // ✅ FK a la cita principal
    id_producto_servicio: service.serviceId,  // ✅ Aquí SÍ
    cantidad: service.quantity,
    costo: service.price
  });
}
```

### 3. **Campo spacio (Posición en Columna)**

```typescript
// ✅ DEBE CALCULARSE según MapaAgenda()
const spacio = this.calcularSpacio(
  id_personal,
  fecha,
  hora,
  espacios_duracion
);

// spacio = índice de columna en matriz mapa[columna][fila]
// Si personal tiene id=5 y es el tercer terapeuta activo ese día → spacio=2
```

## Plan de Migración Paso a Paso

### Fase 1: Preparación de Base de Datos

#### 1.1. Crear Nuevas Tablas

**Archivo:** `database.service.ts` - Método `createTables()`

```typescript
private async createTables() {
  const db = this.db!;

  // 1. Crear tagenda_lnk_fecha primero (referenciada por tagenda)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tagenda_lnk_fecha (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      handel INTEGER NOT NULL,
      id_empresa_base INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      activo INTEGER DEFAULT 1,
      UNIQUE(handel, id_empresa_base, fecha)
    );
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_lnk_fecha_fecha
    ON tagenda_lnk_fecha(fecha);
  `);

  // 2. Crear tagenda (tabla principal)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tagenda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      handel INTEGER NOT NULL,
      id_empresa_base INTEGER NOT NULL,
      id_cliente INTEGER NOT NULL,
      id_personal INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      espacios_duracion INTEGER DEFAULT 1,
      spacio INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Reservado',
      notas TEXT,
      notas2 TEXT,
      ban_cita INTEGER DEFAULT 0,
      lnk_fecha INTEGER,
      efectivo REAL DEFAULT 0,
      tarjeta REAL DEFAULT 0,
      transferencia REAL DEFAULT 0,
      credito REAL DEFAULT 0,
      activo INTEGER DEFAULT 1,
      FOREIGN KEY (lnk_fecha) REFERENCES tagenda_lnk_fecha(id)
    );
  `);

  // Índices para tagenda
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_tagenda_fecha ON tagenda(fecha);
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_tagenda_personal ON tagenda(id_personal);
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_tagenda_cliente ON tagenda(id_cliente);
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_tagenda_activo ON tagenda(activo);
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_tagenda_lnk_fecha ON tagenda(lnk_fecha);
  `);

  // 3. Crear tagenda_aux (servicios por cita)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tagenda_aux (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_agenda INTEGER NOT NULL,
      id_producto_servicio INTEGER NOT NULL,
      cantidad REAL DEFAULT 1,
      costo REAL DEFAULT 0,
      activo INTEGER DEFAULT 1,
      FOREIGN KEY (id_agenda) REFERENCES tagenda(id),
      FOREIGN KEY (id_producto_servicio) REFERENCES productos(id)
    );
  `);

  // Índices para tagenda_aux
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_tagenda_aux_agenda
    ON tagenda_aux(id_agenda);
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_tagenda_aux_servicio
    ON tagenda_aux(id_producto_servicio);
  `);

  console.log('✅ Tablas tagenda, tagenda_aux, tagenda_lnk_fecha creadas');
}
```

#### 1.2. Migrar Datos Existentes (Si hay datos en tabla `citas`)

```typescript
async migrateCitasToTagenda() {
  await this.waitForDB();

  console.log('🔄 Iniciando migración de citas → tagenda...');

  // 1. Leer todas las citas existentes
  const result = await this.db!.query(`
    SELECT * FROM citas WHERE activo = 1
  `);

  const citasExistentes = result.values || [];

  if (citasExistentes.length === 0) {
    console.log('✅ No hay citas para migrar');
    return;
  }

  console.log(`📋 Migrando ${citasExistentes.length} citas...`);

  // 2. Agrupar citas por fecha+hora+cliente+personal
  // (porque actualmente hay 1 cita por servicio, debemos unirlas)
  const citasAgrupadas = new Map<string, any[]>();

  for (const cita of citasExistentes) {
    const key = `${cita.fecha}_${cita.hora}_${cita.id_cliente}_${cita.id_personal}`;
    if (!citasAgrupadas.has(key)) {
      citasAgrupadas.set(key, []);
    }
    citasAgrupadas.get(key)!.push(cita);
  }

  console.log(`📊 Agrupadas en ${citasAgrupadas.size} citas únicas`);

  // 3. Configuración de incremento (desde BD o default)
  const minutos_incremento = 30; // TODO: Obtener de tconfig

  // 4. Insertar en nuevo esquema
  for (const [key, grupo] of citasAgrupadas) {
    const citaPrincipal = grupo[0];

    // 4.1. Calcular duración total en slots
    const duracion_total_minutos = grupo.reduce(
      (sum, c) => sum + (c.duracion || 0),
      0
    );
    const espacios_duracion = Math.ceil(
      duracion_total_minutos / minutos_incremento
    );

    // 4.2. Obtener o crear lnk_fecha
    let lnk_fecha_id = await this.getOrCreateLnkFecha(
      citaPrincipal.handel,
      citaPrincipal.id_empresa_base,
      citaPrincipal.fecha
    );

    // 4.3. Calcular spacio (columna)
    const spacio = await this.calcularSpacio(
      citaPrincipal.id_personal,
      citaPrincipal.fecha,
      citaPrincipal.hora,
      espacios_duracion
    );

    // 4.4. Insertar en tagenda
    const insertResult = await this.db!.query(`
      INSERT INTO tagenda (
        handel, id_empresa_base, id_cliente, id_personal,
        fecha, hora, espacios_duracion, spacio,
        status, notas, ban_cita, lnk_fecha, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1)
    `, [
      citaPrincipal.handel,
      citaPrincipal.id_empresa_base,
      citaPrincipal.id_cliente,
      citaPrincipal.id_personal,
      citaPrincipal.fecha,
      citaPrincipal.hora,
      espacios_duracion,
      spacio,
      citaPrincipal.status || 'Reservado',
      citaPrincipal.notas || '',
      lnk_fecha_id
    ]);

    const tagenda_id = insertResult.changes?.lastId;

    // 4.5. Insertar servicios en tagenda_aux
    for (const cita of grupo) {
      const servicio = await this.getServicioById(cita.id_servicio);

      await this.db!.query(`
        INSERT INTO tagenda_aux (
          id_agenda, id_producto_servicio, cantidad, costo, activo
        ) VALUES (?, ?, 1, ?, 1)
      `, [
        tagenda_id,
        cita.id_servicio,
        servicio?.precio || 0
      ]);
    }

    console.log(`✅ Cita migrada: tagenda_id=${tagenda_id}, servicios=${grupo.length}`);
  }

  // 5. Desactivar citas antiguas (soft delete)
  await this.db!.query(`UPDATE citas SET activo = 0`);

  console.log('✅ Migración completada');
}

private async getOrCreateLnkFecha(
  handel: number,
  id_empresa_base: number,
  fecha: string
): Promise<number> {
  // Buscar existente
  const result = await this.db!.query(`
    SELECT id FROM tagenda_lnk_fecha
    WHERE handel = ? AND id_empresa_base = ? AND fecha = ?
  `, [handel, id_empresa_base, fecha]);

  if (result.values && result.values.length > 0) {
    return result.values[0].id;
  }

  // Crear nuevo
  const insertResult = await this.db!.query(`
    INSERT INTO tagenda_lnk_fecha (handel, id_empresa_base, fecha, activo)
    VALUES (?, ?, ?, 1)
  `, [handel, id_empresa_base, fecha]);

  return insertResult.changes?.lastId || 0;
}

private async calcularSpacio(
  id_personal: number,
  fecha: string,
  hora: string,
  espacios_duracion: number
): Promise<number> {
  // TODO: Implementar lógica completa de MapaAgenda()
  // Por ahora, retornar índice simple del personal

  const result = await this.db!.query(`
    SELECT COUNT(DISTINCT id_personal) as idx
    FROM tagenda
    WHERE fecha = ? AND id_personal < ? AND activo = 1
  `, [fecha, id_personal]);

  return result.values?.[0]?.idx || 0;
}
```

### Fase 2: Actualizar Métodos CRUD

#### 2.1. Nuevo Método `addCita()` Compatible

```typescript
async addCita(citaData: {
  handel: number;
  id_empresa_base: number;
  id_cliente: number;
  id_personal: number;
  fecha: string;  // YYYY-MM-DD
  hora: string;   // HH:MM
  duracion_minutos: number;  // Total en minutos
  servicios: Array<{
    id_servicio: number;
    cantidad: number;
    costo: number;
  }>;
  status?: string;
  notas?: string;
}): Promise<number> {
  await this.waitForDB();

  console.log('💾 Guardando cita en tagenda...', citaData);

  // 1. Obtener configuración de incremento
  const minutos_incremento = 30; // TODO: Leer de tconfig

  // 2. Calcular espacios_duracion
  const espacios_duracion = Math.ceil(
    citaData.duracion_minutos / minutos_incremento
  );

  // 3. Obtener o crear lnk_fecha
  const lnk_fecha_id = await this.getOrCreateLnkFecha(
    citaData.handel,
    citaData.id_empresa_base,
    citaData.fecha
  );

  // 4. Calcular spacio (columna en matriz)
  const spacio = await this.calcularSpacio(
    citaData.id_personal,
    citaData.fecha,
    citaData.hora,
    espacios_duracion
  );

  // 5. Insertar en tagenda
  const insertResult = await this.db!.query(`
    INSERT INTO tagenda (
      handel, id_empresa_base, id_cliente, id_personal,
      fecha, hora, espacios_duracion, spacio,
      status, notas, ban_cita, lnk_fecha, activo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1)
  `, [
    citaData.handel,
    citaData.id_empresa_base,
    citaData.id_cliente,
    citaData.id_personal,
    citaData.fecha,
    citaData.hora,
    espacios_duracion,
    spacio,
    citaData.status || 'Reservado',
    citaData.notas || '',
    lnk_fecha_id
  ]);

  const tagenda_id = insertResult.changes?.lastId;

  if (!tagenda_id) {
    throw new Error('Error al insertar cita en tagenda');
  }

  // 6. Insertar servicios en tagenda_aux
  for (const servicio of citaData.servicios) {
    await this.db!.query(`
      INSERT INTO tagenda_aux (
        id_agenda, id_producto_servicio, cantidad, costo, activo
      ) VALUES (?, ?, ?, ?, 1)
    `, [
      tagenda_id,
      servicio.id_servicio,
      servicio.cantidad,
      servicio.costo
    ]);
  }

  console.log(`✅ Cita guardada: tagenda_id=${tagenda_id}, servicios=${citaData.servicios.length}`);

  return tagenda_id;
}
```

#### 2.2. Nuevo Método `getCitas()` con JOIN

```typescript
async getCitas(fecha: string): Promise<any[]> {
  await this.waitForDB();

  const result = await this.db!.query(`
    SELECT
      t.id,
      t.handel,
      t.id_empresa_base,
      t.id_cliente,
      c.nombre as cliente_nombre,
      t.id_personal,
      p.nombre as personal_nombre,
      t.fecha,
      t.hora,
      t.espacios_duracion,
      t.spacio,
      t.status,
      t.notas,
      t.notas2,
      t.ban_cita,
      t.efectivo,
      t.tarjeta,
      t.transferencia,
      t.credito,
      -- Calcular duración en minutos para compatibilidad con UI
      (t.espacios_duracion * 30) as duracion_minutos,
      -- Servicios concatenados (para vista rápida)
      GROUP_CONCAT(pr.nombre, ', ') as servicios_nombres,
      -- Total de servicios
      COUNT(ta.id) as total_servicios,
      -- Costo total
      SUM(ta.costo * ta.cantidad) as costo_total
    FROM tagenda t
    LEFT JOIN clientes c ON t.id_cliente = c.id
    LEFT JOIN personal p ON t.id_personal = p.id
    LEFT JOIN tagenda_aux ta ON t.id = ta.id_agenda AND ta.activo = 1
    LEFT JOIN productos pr ON ta.id_producto_servicio = pr.id
    WHERE t.fecha = ? AND t.activo = 1
    GROUP BY t.id
    ORDER BY t.hora, t.spacio
  `, [fecha]);

  return result.values || [];
}
```

#### 2.3. Método para Obtener Servicios de una Cita

```typescript
async getServiciosDeCita(id_agenda: number): Promise<any[]> {
  await this.waitForDB();

  const result = await this.db!.query(`
    SELECT
      ta.id,
      ta.id_agenda,
      ta.id_producto_servicio,
      pr.nombre as servicio_nombre,
      pr.duracion as servicio_duracion,
      ta.cantidad,
      ta.costo,
      (ta.cantidad * ta.costo) as subtotal
    FROM tagenda_aux ta
    LEFT JOIN productos pr ON ta.id_producto_servicio = pr.id
    WHERE ta.id_agenda = ? AND ta.activo = 1
  `, [id_agenda]);

  return result.values || [];
}
```

### Fase 3: Actualizar Componente appointment-form

#### 3.1. Cambiar Lógica de saveAppointment()

**Archivo:** `appointment-form.component.ts`

```typescript
async saveAppointment() {
  if (!this.isFormValid()) {
    console.log('Formulario inválido');
    return;
  }

  try {
    if (this.databaseService.isReady()) {
      console.log('📱 Guardando en SQLite (tagenda)...');

      // Calcular duración total en minutos
      const duracion_total_minutos = this.addedServices.reduce(
        (sum, s) => sum + (s.duration * s.quantity),
        0
      );

      // Preparar array de servicios
      const servicios = this.addedServices.map(s => ({
        id_servicio: s.serviceId,
        cantidad: s.quantity,
        costo: s.price || 0
      }));

      // Guardar UNA SOLA cita con múltiples servicios
      const citaId = await this.databaseService.addCita({
        handel: 1,
        id_empresa_base: 1,
        id_cliente: this.selectedClient!.id!,
        id_personal: this.selectedStaffId!,
        fecha: this.formatDateForSQL(this.date),
        hora: this.formatTimeForSQL(this.date),
        duracion_minutos: duracion_total_minutos,
        servicios: servicios,
        status: 'Reservado',
        notas: ''
      });

      console.log(`✅ Cita guardada en tagenda con ID: ${citaId}`);
      console.log(`   - Servicios: ${servicios.length}`);
      console.log(`   - Duración total: ${duracion_total_minutos} min`);

      const formData: AppointmentFormData = {
        date: this.date,
        time: this.selectedDateTime,
        clientId: this.selectedClient!.id,
        clientName: this.selectedClient!.name,
        staffId: this.selectedStaffId!,
        services: this.addedServices,
        isPromo: this.isPromo
      };

      this.modalController.dismiss(formData, 'confirm');

    } else {
      console.log('💾 SQLite no disponible');
      // TODO: Fallback a localStorage
    }

  } catch (error) {
    console.error('❌ Error guardando cita:', error);
  }
}
```

### Fase 4: Testing y Validación

#### 4.1. Checklist de Pruebas

**Después de implementar la migración, verificar:**

- [ ] **Creación de tablas**
  - [ ] `tagenda` existe con todos los campos
  - [ ] `tagenda_aux` existe con FKs correctas
  - [ ] `tagenda_lnk_fecha` existe con UNIQUE constraint
  - [ ] Todos los índices fueron creados

- [ ] **Migración de datos existentes**
  - [ ] Citas antiguas agrupadas correctamente
  - [ ] `espacios_duracion` calculado bien (30 min → 1 slot, 60 min → 2 slots)
  - [ ] `spacio` asignado correctamente
  - [ ] Servicios múltiples en `tagenda_aux`
  - [ ] Tabla `citas` antigua marcada como `activo=0`

- [ ] **Nuevas citas**
  - [ ] Se crea 1 registro en `tagenda`
  - [ ] Se crean N registros en `tagenda_aux` (uno por servicio)
  - [ ] `espacios_duracion` se calcula correctamente
  - [ ] `lnk_fecha` se crea o recupera correctamente
  - [ ] `spacio` se calcula según MapaAgenda()

- [ ] **Lectura de citas**
  - [ ] JOIN trae nombre cliente, nombre personal
  - [ ] JOIN trae todos los servicios de la cita
  - [ ] `duracion_minutos` calculado correctamente para UI
  - [ ] Costo total suma todos los servicios

- [ ] **Compatibilidad con syserv**
  - [ ] Estructura idéntica a syserv original
  - [ ] Nombres de campos exactos
  - [ ] Tipos de datos compatibles
  - [ ] Listo para sincronización sin transformaciones

#### 4.2. Query de Validación

```sql
-- Verificar que todo esté bien
SELECT
  'tagenda' as tabla,
  COUNT(*) as registros,
  SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos
FROM tagenda

UNION ALL

SELECT
  'tagenda_aux',
  COUNT(*),
  SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END)
FROM tagenda_aux

UNION ALL

SELECT
  'tagenda_lnk_fecha',
  COUNT(*),
  SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END)
FROM tagenda_lnk_fecha;

-- Verificar que no haya citas huérfanas
SELECT
  ta.id,
  ta.id_agenda,
  'Sin cita padre' as problema
FROM tagenda_aux ta
LEFT JOIN tagenda t ON ta.id_agenda = t.id
WHERE t.id IS NULL AND ta.activo = 1;

-- Verificar que espacios_duracion sea > 0
SELECT
  id,
  espacios_duracion,
  'Duración inválida' as problema
FROM tagenda
WHERE espacios_duracion <= 0 AND activo = 1;
```

## Cronograma de Implementación

### Orden Recomendado

1. ✅ **Día 1: Crear nuevas tablas**
   - Implementar `createTables()` con tagenda, tagenda_aux, tagenda_lnk_fecha
   - Crear todos los índices
   - Testing: Verificar que tablas existan

2. ✅ **Día 2: Implementar métodos auxiliares**
   - `getOrCreateLnkFecha()`
   - `calcularSpacio()` (versión simple primero)
   - `getServicioById()`
   - Testing: Unit tests de cada método

3. ✅ **Día 3: Migración de datos**
   - Implementar `migrateCitasToTagenda()`
   - Ejecutar migración en dispositivo de prueba
   - Validar que datos se transfieran correctamente
   - Testing: Queries de validación

4. ✅ **Día 4: Actualizar CRUD**
   - Nuevo `addCita()` con tagenda + tagenda_aux
   - Nuevo `getCitas()` con JOINs
   - `getServiciosDeCita()`
   - `updateCita()` y `deleteCita()` (soft delete)
   - Testing: Crear, leer, actualizar, eliminar

5. ✅ **Día 5: Actualizar UI**
   - Modificar `appointment-form.component.ts`
   - Probar flujo completo: crear cita → guardar → visualizar
   - Testing: End-to-end en Android

6. ✅ **Día 6: Implementar MapaAgenda() completo**
   - Algoritmo completo de cálculo de spacio
   - Integración con UI de carrusel
   - Testing: Validar posicionamiento

7. ✅ **Día 7: Testing final y documentación**
   - Pruebas exhaustivas en Android
   - Validar compatibilidad con estructura syserv
   - Documentar cambios

## Riesgos y Mitigaciones

### Riesgo 1: Pérdida de Datos Durante Migración
**Mitigación:**
- Hacer backup de `citas` antes de migrar
- No eliminar tabla antigua, solo marcar `activo=0`
- Validar conteos antes y después

### Riesgo 2: Cálculo Incorrecto de `espacios_duracion`
**Mitigación:**
- Tests unitarios con casos de prueba:
  - 30 min → 1 slot
  - 60 min → 2 slots
  - 45 min → 2 slots (ceil)
  - 90 min → 3 slots

### Riesgo 3: `spacio` Mal Calculado
**Mitigación:**
- Implementar versión simple primero (índice secuencial)
- Luego implementar algoritmo completo MapaAgenda()
- Validar visualmente en UI de carrusel

### Riesgo 4: FKs Rotas en `tagenda_aux`
**Mitigación:**
- Insertar en orden: tagenda primero, luego tagenda_aux
- Verificar que `tagenda_id` sea válido antes de insertar aux
- Query de validación para detectar huérfanos

## Checklist Final de Compatibilidad

Antes de declarar la migración completa, verificar:

- [ ] **Estructura de tablas**
  - [ ] Nombres de tablas: `tagenda`, `tagenda_aux`, `tagenda_lnk_fecha`
  - [ ] Nombres de campos idénticos a syserv
  - [ ] Tipos de datos correctos (INTEGER, TEXT, REAL)
  - [ ] Foreign keys configuradas

- [ ] **Lógica de negocio**
  - [ ] Duración en slots, no minutos
  - [ ] Múltiples servicios en tabla auxiliar
  - [ ] Campo `spacio` calculado correctamente
  - [ ] Soft delete en todas las tablas

- [ ] **Datos de prueba**
  - [ ] Crear cita con 1 servicio → 1 tagenda + 1 tagenda_aux
  - [ ] Crear cita con 3 servicios → 1 tagenda + 3 tagenda_aux
  - [ ] Verificar que `espacios_duracion` sea suma correcta

- [ ] **Sincronización**
  - [ ] Estructura 100% compatible con API syserv
  - [ ] Sin transformaciones necesarias al sincronizar
  - [ ] Campos adicionales locales (si hay) no interfieren

## Conclusión

Esta migración es **CRÍTICA** para la sincronización con el servidor syserv. Debe implementarse ANTES de continuar con desarrollo de UI o funcionalidades adicionales.

**Siguiente paso:** Implementar Fase 1 (crear tablas) en `database.service.ts`.
