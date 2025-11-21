# 🧪 Guía de Testing de SQLite en Android

**Fecha**: 2025-11-20
**Estado**: ✅ Listo para testing en Android

---

## 📋 Resumen de Cambios

Se ha implementado SQLite siguiendo las **mejores prácticas 2025** de `@capacitor-community/sqlite` v7.x.

### ✅ Archivos Actualizados

1. **`database.service.ts`** - Servicio SQLite completo
   - ✅ API v7.x compatible
   - ✅ BehaviorSubject para `dbReady`
   - ✅ Métodos: checkConnectionsConsistency(), isConnection(), createConnection(), retrieveConnection()
   - ✅ 4 tablas: clientes, personal, productos, citas
   - ✅ Seed automático de datos de prueba
   - ✅ Métodos CRUD completos

2. **`app.component.ts`** - Inicialización correcta
   - ✅ Espera `platform.ready()` antes de init
   - ✅ Try SQLite en nativo → fallback a localStorage
   - ✅ Logs detallados para debugging

3. **Test Pages** - Detección dual de fuente
   - ✅ `clientes-test.page.ts`
   - ✅ `personal-test.page.ts`
   - ✅ `servicios-test.page.ts`
   - ✅ Badge muestra fuente: SQLite vs localStorage

4. **`agenda.service.ts`** - Compatible con ambos
   - ✅ Usa localStorage actualmente
   - ✅ Preparado para migración a SQLite

---

## 🚀 Cómo Probar

### 1. Abrir en Android Studio

```bash
npx cap open android
```

### 2. Compilar APK Debug

En Android Studio:
- Build > Clean Project
- Build > Rebuild Project
- Run > Run 'app' en dispositivo/emulador

### 3. Verificar Logs en Logcat

Busca estos mensajes en Logcat (filtro: `app.component` o `database`):

#### ✅ Si SQLite se inicializa correctamente:
```
🚀 [AppComponent] Iniciando aplicación...
✅ Plataforma lista: android
📱 Plataforma nativa detectada, intentando inicializar SQLite...
🔧 [DatabaseService] Iniciando SQLite...
📱 Plataforma: android
🏠 Es nativa: true
🔍 Verificando consistencia de conexiones...
✅ Consistencia verificada: true
🔍 Verificando si existe conexión "agendaDB"...
🆕 Creando nueva conexión...
✅ Conexión obtenida: OK
🔓 Abriendo base de datos...
✅ Base de datos abierta
📋 Creando esquema...
✅ Esquema creado
🌱 Verificando datos de prueba...
✅ SQLite inicializado correctamente
🎉 [AppComponent] Aplicación completamente inicializada
```

#### ⚠️ Si SQLite falla (fallback a localStorage):
```
🚀 [AppComponent] Iniciando aplicación...
✅ Plataforma lista: android
📱 Plataforma nativa detectada, intentando inicializar SQLite...
❌ Error inicializando SQLite, usando localStorage como fallback: [error]
📦 Inicializando localStorage...
```

### 4. Verificar en las Páginas de Test

Navega en la app Android a:
- **Menú Principal** → Botón "Test Clientes"
- **Menú Principal** → Botón "Test Personal"
- **Menú Principal** → Botón "Test Servicios"

Verás un **badge de color** en la parte superior:

| Badge | Color | Significado |
|-------|-------|-------------|
| SQLite | 🟢 Verde | ✅ SQLite funciona correctamente |
| localStorage | 🟡 Amarillo | ⚠️ SQLite falló, usando fallback |
| Error | 🔴 Rojo | ❌ Error cargando datos |

### 5. Verificar Datos

Si SQLite funciona, deberías ver:
- **5 clientes** (Juan Pérez, María González, etc.)
- **4 personal** (Dr. Rodríguez, Dra. Fernández, etc.)
- **6 servicios** (Masaje Relajante, Acupuntura, etc.)

---

## 📊 Estructura de la Base de Datos

### Tablas Creadas

```sql
-- CLIENTES
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER DEFAULT 1,
  id_empresa_base INTEGER DEFAULT 1,
  nombre TEXT NOT NULL,
  apaterno TEXT,
  amaterno TEXT,
  tel1 TEXT,
  email1 TEXT,
  activo INTEGER DEFAULT 1,
  created_at TEXT,
  updated_at TEXT
);

-- PERSONAL
CREATE TABLE personal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER DEFAULT 1,
  id_empresa_base INTEGER DEFAULT 1,
  alias TEXT,
  nombre TEXT NOT NULL,
  apellidos TEXT,
  activo INTEGER DEFAULT 1,
  orden INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

-- PRODUCTOS/SERVICIOS
CREATE TABLE productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER DEFAULT 1,
  id_empresa_base INTEGER DEFAULT 1,
  codigo TEXT,
  nombre TEXT NOT NULL,
  tipo TEXT DEFAULT 'Servicio',
  n_duracion INTEGER,
  precio REAL,
  activo INTEGER DEFAULT 1,
  created_at TEXT,
  updated_at TEXT
);

-- CITAS
CREATE TABLE citas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER DEFAULT 1,
  id_empresa_base INTEGER DEFAULT 1,
  id_cliente INTEGER,
  id_personal INTEGER,
  id_servicio INTEGER,
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  duracion INTEGER,
  status TEXT DEFAULT 'Reservado',
  notas TEXT,
  activo INTEGER DEFAULT 1,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id),
  FOREIGN KEY (id_personal) REFERENCES personal(id),
  FOREIGN KEY (id_servicio) REFERENCES productos(id)
);
```

### Índices para Performance

```sql
CREATE INDEX idx_clientes_activo ON clientes(activo, handel, id_empresa_base);
CREATE INDEX idx_personal_activo ON personal(activo, handel, id_empresa_base);
CREATE INDEX idx_productos_activo ON productos(activo, tipo, handel, id_empresa_base);
CREATE INDEX idx_citas_fecha ON citas(fecha, handel, id_empresa_base);
CREATE INDEX idx_citas_personal ON citas(id_personal, fecha);
CREATE INDEX idx_citas_activo ON citas(activo);
```

---

## 🔍 Debugging de Problemas Comunes

### Problema 1: SQLite no se inicializa

**Síntoma**: Badge muestra "localStorage" en lugar de "SQLite"

**Posibles causas**:
1. Plugin no sincronizado correctamente
2. Permisos de Android faltantes
3. Dependencia nativa no instalada

**Solución**:
```bash
# Limpiar y reconstruir
npm install
npx cap sync android
cd android
./gradlew clean
cd ..
npx cap open android
# Build > Clean Project
# Build > Rebuild Project
```

### Problema 2: Error de conexión duplicada

**Síntoma**: `Connection already exists`

**Solución**: El código ya maneja esto con `checkConnectionsConsistency()` y `isConnection()`.
Si aún falla, desinstala la app del dispositivo y vuelve a instalar.

### Problema 3: Tabla no encontrada

**Síntoma**: `no such table: clientes`

**Solución**: El esquema no se creó. Verifica logs que digan:
```
📋 Creando esquema...
✅ Esquema creado
```

Si no aparece, hay un error en `createSchema()`.

### Problema 4: Datos no aparecen

**Síntoma**: Lista vacía aunque SQLite está inicializado

**Solución**: Verifica que el seed se ejecutó:
```
🌱 Verificando datos de prueba...
📦 Base de datos vacía, sembrando datos de prueba...
✅ Datos de prueba sembrados correctamente
```

---

## 🎯 Siguiente Paso: Migrar Agenda a SQLite

Una vez que confirmes que SQLite funciona en las test pages (badge verde "SQLite"), puedes migrar la agenda:

### Cambios Necesarios en `agenda.service.ts`

1. **Actualizar `readConfigAgenda()`**:
```typescript
async readConfigAgenda(fecha: string = ''): Promise<boolean> {
  // Verificar si SQLite está disponible
  if (this.dbService.isReady()) {
    console.log('📱 Usando SQLite para config_agenda');
    // TODO: Implementar query SQL
    const db = this.dbService.getDB();
    const result = await db.query('SELECT * FROM config_agenda WHERE handel = ?', [this.handel]);
    this.vecConfigAgenda = result.values?.[0] || {};
  } else {
    console.log('💾 Usando localStorage para config_agenda');
    // Código actual de localStorage
    this.vecConfigAgenda = this.storage.get<any>('config_agenda', {});
  }
  return true;
}
```

2. **Actualizar `readReservas()`**:
```typescript
async readReservas(fecha: string = ''): Promise<boolean> {
  if (this.dbService.isReady()) {
    console.log('📱 Usando SQLite para reservas');
    const db = this.dbService.getDB();
    const result = await db.query(
      'SELECT * FROM citas WHERE fecha = ? AND activo = 1',
      [fecha]
    );
    this.vecReservas = result.values || [];
  } else {
    console.log('💾 Usando localStorage para reservas');
    // Código actual de localStorage
    this.vecReservas = this.mockAppointments.filter(apt => apt.fecha === fecha);
  }
  return this.vecReservas.length > 0;
}
```

3. **Crear tabla `config_agenda` en `database.service.ts`**:
```sql
CREATE TABLE IF NOT EXISTS config_agenda (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handel INTEGER NOT NULL DEFAULT 1,
  puesto_servicio TEXT,
  hora_inicio INTEGER,
  minutos_incremento INTEGER,
  hora_fin INTEGER,
  -- ... resto de campos
);
```

---

## ✅ Checklist de Verificación

Antes de considerar SQLite listo para producción:

- [ ] ✅ Build compila sin errores
- [ ] ✅ `npx cap sync android` exitoso
- [ ] ✅ APK se instala en dispositivo
- [ ] ✅ Logs muestran "SQLite inicializado correctamente"
- [ ] ✅ Test pages muestran badge "SQLite" verde
- [ ] ✅ 5 clientes visibles en `/test/clientes`
- [ ] ✅ 4 personal visibles en `/test/personal`
- [ ] ✅ 6 servicios visibles en `/test/servicios`
- [ ] ⏳ Migrar agenda a SQLite (siguiente paso)

---

## 📚 Recursos

- [Documentación Oficial @capacitor-community/sqlite](https://github.com/capacitor-community/sqlite)
- [Ionic Angular Usage Guide](https://github.com/capacitor-community/sqlite/blob/master/docs/Ionic-Angular-Usage.md)
- [API Connection Docs](https://github.com/capacitor-community/sqlite/blob/master/docs/APIConnection.md)

---

**Última actualización**: 2025-11-20
**Autor**: Implementación basada en mejores prácticas 2025
