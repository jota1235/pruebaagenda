import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

/**
 * DatabaseService - SQLite v7.x Compatible
 *
 * Servicio para gestionar SQLite usando @capacitor-community/sqlite v7.x
 * Compatible con la API correcta de la versión 7
 *
 * Características:
 * - BehaviorSubject para dbReady
 * - Solo funciona en plataformas nativas (Android/iOS)
 * - Inicialización en app.component.ts después de platform.ready()
 * - Manejo de errores robusto
 */
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite!: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private dbName = 'agendaDB';
  private isNative = Capacitor.isNativePlatform();

  // BehaviorSubject para notificar cuando la BD está lista
  public dbReady = new BehaviorSubject<boolean>(false);

  constructor() {
    // Inicializar SQLiteConnection
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  /**
   * Inicializa la base de datos SQLite
   * Debe llamarse desde app.component.ts después de platform.ready()
   */
  async init(): Promise<void> {
    console.log('🔧 [DatabaseService] Iniciando SQLite...');
    console.log(`📱 Plataforma: ${Capacitor.getPlatform()}`);
    console.log(`🏠 Es nativa: ${this.isNative}`);

    // Solo funciona en plataformas nativas
    if (!this.isNative) {
      console.log('⚠️ SQLite solo funciona en Android/iOS. Plataforma actual: web');
      console.log('💡 Usando localStorage como fallback');
      this.dbReady.next(false);
      return;
    }

    try {
      // 1. Verificar consistencia de conexiones
      console.log('🔍 Verificando consistencia de conexiones...');
      const consistency = await this.sqlite.checkConnectionsConsistency();
      console.log('✅ Consistencia verificada:', consistency.result);

      // 2. Verificar si la conexión ya existe
      console.log(`🔍 Verificando si existe conexión "${this.dbName}"...`);
      const isConn = (await this.sqlite.isConnection(this.dbName, false)).result;

      if (isConn) {
        console.log('📦 Conexión existente encontrada, recuperando...');
        this.db = await this.sqlite.retrieveConnection(this.dbName, false);
      } else {
        console.log('🆕 Creando nueva conexión...');
        // createConnection retorna la conexión directamente
        this.db = await this.sqlite.createConnection(
          this.dbName,
          false, // encrypted
          'no-encryption', // mode
          1, // version
          false // readonly
        );
      }
      console.log('✅ Conexión obtenida:', this.db ? 'OK' : 'ERROR');

      // 3. Abrir la base de datos
      console.log('🔓 Abriendo base de datos...');
      await this.db.open();
      console.log('✅ Base de datos abierta');

      // 4. Crear esquema (tablas)
      console.log('📋 Creando esquema...');
      await this.createSchema();
      console.log('✅ Esquema creado');

      // 5. Sembrar datos si es necesario
      console.log('🌱 Verificando datos de prueba...');
      await this.seedIfNeeded();
      console.log('✅ Datos verificados');

      // 6. Marcar como lista
      this.dbReady.next(true);
      console.log('🎉 [DatabaseService] SQLite completamente inicializado y listo');

    } catch (error: any) {
      console.error('❌ [DatabaseService] Error CRÍTICO inicializando SQLite:', error);
      console.error('Tipo:', typeof error);
      console.error('Mensaje:', error?.message);
      console.error('Stack:', error?.stack);
      this.dbReady.next(false);
      throw error;
    }
  }

  /**
   * Crea el esquema completo de la base de datos
   */
  private async createSchema(): Promise<void> {
    const schema = `
      -- ==================== CLIENTES ====================
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER NOT NULL DEFAULT 1,
        id_empresa_base INTEGER NOT NULL DEFAULT 1,
        nombre TEXT NOT NULL,
        apaterno TEXT,
        amaterno TEXT,
        tel1 TEXT,
        email1 TEXT,
        activo INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- ==================== PERSONAL ====================
      CREATE TABLE IF NOT EXISTS personal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER NOT NULL DEFAULT 1,
        id_empresa_base INTEGER NOT NULL DEFAULT 1,
        alias TEXT,
        nombre TEXT NOT NULL,
        apellidos TEXT,
        activo INTEGER DEFAULT 1,
        orden INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- ==================== PRODUCTOS/SERVICIOS ====================
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER NOT NULL DEFAULT 1,
        id_empresa_base INTEGER NOT NULL DEFAULT 1,
        codigo TEXT,
        nombre TEXT NOT NULL,
        tipo TEXT DEFAULT 'Servicio',
        n_duracion INTEGER,
        precio REAL,
        activo INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- ==================== CONFIGURACIÓN DE AGENDA ====================
      CREATE TABLE IF NOT EXISTS config_agenda (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER NOT NULL DEFAULT 1,
        id_empresa_base INTEGER NOT NULL DEFAULT 1,
        puesto_servicio TEXT DEFAULT 'Terapeuta',
        hora_inicio INTEGER DEFAULT 9,
        minutos_incremento INTEGER DEFAULT 30,
        hora_fin INTEGER DEFAULT 20,
        color_libre TEXT DEFAULT '#90EE90',
        color_reservada TEXT DEFAULT '#FFD700',
        color_confirmada TEXT DEFAULT '#87CEEB',
        color_cancelada TEXT DEFAULT '#FF6B6B',
        color_cobrado TEXT DEFAULT '#98FB98',
        color_fuera_tiempo TEXT DEFAULT '#D3D3D3',
        most_disponibilidad INTEGER DEFAULT 1,
        rango_manual INTEGER DEFAULT 0,
        rango_hora INTEGER DEFAULT 1,
        viz_nombre_terapeuta INTEGER DEFAULT 1,
        num_columnas INTEGER DEFAULT 4,
        cant_cols_fijas INTEGER DEFAULT 0,
        col_aux INTEGER DEFAULT 0,
        horario_sabado TEXT DEFAULT '09:00-18:00',
        horario_domingo TEXT DEFAULT '10:00-15:00',
        formato_hora TEXT DEFAULT '12',
        str_dias TEXT DEFAULT 'L,M,Mi,J,V,S,D',
        dias_ctespr TEXT DEFAULT '365',
        nventa_ctespr TEXT DEFAULT '-1',
        disponibilidad_hora_inicio INTEGER DEFAULT 9,
        disponibilidad_hora_fin INTEGER DEFAULT 20,
        disponibilidad_dia_habil INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- ==================== TERAPEUTAS/PERSONAL DE AGENDA ====================
      CREATE TABLE IF NOT EXISTS agenda_terapeutas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER NOT NULL DEFAULT 1,
        id_empresa_base INTEGER NOT NULL DEFAULT 1,
        id_personal INTEGER,
        alias TEXT,
        nombre TEXT,
        orden INTEGER DEFAULT 0,
        activo INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_personal) REFERENCES personal(id)
      );

      -- ==================== CITAS (LEGACY - SERÁ MIGRADO) ====================
      CREATE TABLE IF NOT EXISTS citas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER NOT NULL DEFAULT 1,
        id_empresa_base INTEGER NOT NULL DEFAULT 1,
        id_cliente INTEGER,
        id_personal INTEGER,
        id_servicio INTEGER,
        fecha TEXT NOT NULL,
        hora TEXT NOT NULL,
        duracion INTEGER,
        status TEXT DEFAULT 'Reservado',
        notas TEXT,
        activo INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_cliente) REFERENCES clientes(id),
        FOREIGN KEY (id_personal) REFERENCES personal(id),
        FOREIGN KEY (id_servicio) REFERENCES productos(id)
      );

      -- ==================== TAGENDA_LNK_FECHA (COMPATIBLE SYSERV) ====================
      CREATE TABLE IF NOT EXISTS tagenda_lnk_fecha (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER NOT NULL,
        id_empresa_base INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        activo INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(handel, id_empresa_base, fecha)
      );

      -- ==================== TAGENDA (COMPATIBLE SYSERV) ====================
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
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_cliente) REFERENCES clientes(id),
        FOREIGN KEY (id_personal) REFERENCES personal(id),
        FOREIGN KEY (lnk_fecha) REFERENCES tagenda_lnk_fecha(id)
      );

      -- ==================== TAGENDA_AUX (COMPATIBLE SYSERV) ====================
      CREATE TABLE IF NOT EXISTS tagenda_aux (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_agenda INTEGER NOT NULL,
        id_producto_servicio INTEGER NOT NULL,
        cantidad REAL DEFAULT 1,
        costo REAL DEFAULT 0,
        activo INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_agenda) REFERENCES tagenda(id),
        FOREIGN KEY (id_producto_servicio) REFERENCES productos(id)
      );

      -- ==================== ÍNDICES PARA PERFORMANCE ====================
      CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo, handel, id_empresa_base);
      CREATE INDEX IF NOT EXISTS idx_personal_activo ON personal(activo, handel, id_empresa_base);
      CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo, tipo, handel, id_empresa_base);
      CREATE INDEX IF NOT EXISTS idx_config_agenda_handel ON config_agenda(handel, id_empresa_base);
      CREATE INDEX IF NOT EXISTS idx_agenda_terapeutas ON agenda_terapeutas(handel, id_empresa_base, activo);

      -- Índices CITAS (legacy)
      CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha, handel, id_empresa_base);
      CREATE INDEX IF NOT EXISTS idx_citas_personal ON citas(id_personal, fecha);
      CREATE INDEX IF NOT EXISTS idx_citas_activo ON citas(activo);

      -- Índices TAGENDA_LNK_FECHA
      CREATE INDEX IF NOT EXISTS idx_lnk_fecha_fecha ON tagenda_lnk_fecha(fecha);
      CREATE INDEX IF NOT EXISTS idx_lnk_fecha_handel ON tagenda_lnk_fecha(handel, id_empresa_base);

      -- Índices TAGENDA
      CREATE INDEX IF NOT EXISTS idx_tagenda_fecha ON tagenda(fecha);
      CREATE INDEX IF NOT EXISTS idx_tagenda_personal ON tagenda(id_personal);
      CREATE INDEX IF NOT EXISTS idx_tagenda_cliente ON tagenda(id_cliente);
      CREATE INDEX IF NOT EXISTS idx_tagenda_activo ON tagenda(activo);
      CREATE INDEX IF NOT EXISTS idx_tagenda_lnk_fecha ON tagenda(lnk_fecha);
      CREATE INDEX IF NOT EXISTS idx_tagenda_fecha_personal ON tagenda(fecha, id_personal);

      -- Índices TAGENDA_AUX
      CREATE INDEX IF NOT EXISTS idx_tagenda_aux_agenda ON tagenda_aux(id_agenda);
      CREATE INDEX IF NOT EXISTS idx_tagenda_aux_servicio ON tagenda_aux(id_producto_servicio);
      CREATE INDEX IF NOT EXISTS idx_tagenda_aux_activo ON tagenda_aux(activo);
    `;

    await this.db.execute(schema);
  }

  /**
   * Siembra datos de prueba si la base de datos está vacía
   */
  private async seedIfNeeded(): Promise<void> {
    // Verificar si ya hay clientes
    const result = await this.db.query('SELECT COUNT(*) as total FROM clientes');
    const total = result.values?.[0]?.total || 0;

    if (total === 0) {
      console.log('📦 Base de datos vacía, sembrando datos de prueba...');

      const seedData = `
        -- CLIENTES DE PRUEBA
        INSERT INTO clientes (handel, id_empresa_base, nombre, apaterno, amaterno, tel1, email1, activo) VALUES
        (1, 1, 'Juan', 'Pérez', 'García', '555-0101', 'juan.perez@example.com', 1),
        (1, 1, 'María', 'González', 'López', '555-0102', 'maria.gonzalez@example.com', 1),
        (1, 1, 'Carlos', 'Martínez', 'Rodríguez', '555-0103', 'carlos.martinez@example.com', 1),
        (1, 1, 'Ana', 'Hernández', 'Díaz', '555-0104', 'ana.hernandez@example.com', 1),
        (1, 1, 'Pedro', 'Sánchez', 'Flores', '555-0105', 'pedro.sanchez@example.com', 1);

        -- PERSONAL DE PRUEBA
        INSERT INTO personal (handel, id_empresa_base, alias, nombre, apellidos, activo, orden) VALUES
        (1, 1, 'dr_rodriguez', 'Dr. Rodríguez', 'García', 1, 1),
        (1, 1, 'dra_fernandez', 'Dra. Fernández', 'López', 1, 2),
        (1, 1, 'lic_gonzalez', 'Lic. González', 'Martínez', 1, 3),
        (1, 1, 'lic_torres', 'Lic. Torres', 'Sánchez', 1, 4);

        -- SERVICIOS DE PRUEBA
        INSERT INTO productos (handel, id_empresa_base, codigo, nombre, tipo, n_duracion, precio, activo) VALUES
        (1, 1, 'SRV001', 'Masaje Relajante', 'Servicio', 2, 500, 1),
        (1, 1, 'SRV002', 'Masaje Terapéutico', 'Servicio', 3, 750, 1),
        (1, 1, 'SRV003', 'Acupuntura', 'Servicio', 1, 600, 1),
        (1, 1, 'SRV004', 'Reflexología', 'Servicio', 2, 550, 1),
        (1, 1, 'SRV005', 'Aromaterapia', 'Servicio', 1, 350, 1),
        (1, 1, 'SRV006', 'Tratamiento Facial', 'Servicio', 2, 650, 1);

        -- CONFIGURACIÓN DE AGENDA
        INSERT INTO config_agenda (
          handel, id_empresa_base, puesto_servicio, hora_inicio, minutos_incremento,
          hora_fin, color_libre, color_reservada, color_confirmada, color_cancelada,
          color_cobrado, color_fuera_tiempo, most_disponibilidad, rango_manual,
          rango_hora, viz_nombre_terapeuta, num_columnas, horario_sabado,
          horario_domingo, formato_hora, str_dias, disponibilidad_hora_inicio,
          disponibilidad_hora_fin, disponibilidad_dia_habil
        ) VALUES (
          1, 1, 'Terapeuta', 9, 30, 20,
          '#90EE90', '#FFD700', '#87CEEB', '#FF6B6B', '#98FB98', '#D3D3D3',
          1, 0, 1, 1, 4,
          '09:00-18:00', '10:00-15:00', '12', 'L,M,Mi,J,V,S,D',
          9, 20, 1
        );

        -- TERAPEUTAS DE AGENDA (vinculados al personal)
        INSERT INTO agenda_terapeutas (handel, id_empresa_base, id_personal, alias, nombre, orden, activo)
        SELECT 1, 1, id, alias, nombre || ' ' || apellidos, orden, 1
        FROM personal WHERE activo = 1;
      `;

      await this.db.execute(seedData);
      console.log('✅ Datos de prueba sembrados correctamente');
      console.log('   - 5 clientes');
      console.log('   - 4 personal');
      console.log('   - 6 servicios');
      console.log('   - 1 configuración de agenda');
      console.log('   - 4 terapeutas de agenda');
    } else {
      console.log(`ℹ️ Base de datos ya contiene ${total} clientes`);
    }
  }

  /**
   * Helper para esperar a que la BD esté lista antes de hacer queries
   */
  async waitForDB(): Promise<void> {
    if (!this.dbReady.value) {
      console.log('⏳ Esperando a que la BD esté lista...');
      await this.dbReady.pipe(filter(ready => ready), take(1)).toPromise();
      console.log('✅ BD lista');
    }
  }

  /**
   * Verifica si la BD está lista
   */
  isReady(): boolean {
    return this.dbReady.value;
  }

  /**
   * Obtiene la conexión de la BD
   * Lanza error si la BD no está lista
   */
  getDB(): SQLiteDBConnection {
    if (!this.dbReady.value || !this.db) {
      throw new Error('Base de datos no está inicializada. Llama a init() primero.');
    }
    return this.db;
  }

  // ==================== MÉTODOS DE CONSULTA: CLIENTES ====================

  async getClientes(): Promise<any[]> {
    await this.waitForDB();
    const result = await this.db.query(
      'SELECT * FROM clientes WHERE activo = 1 ORDER BY nombre'
    );
    return result.values || [];
  }

  async getClienteById(id: number): Promise<any | null> {
    await this.waitForDB();
    const result = await this.db.query(
      'SELECT * FROM clientes WHERE id = ? AND activo = 1',
      [id]
    );
    return result.values?.[0] || null;
  }

  async addCliente(data: any): Promise<number> {
    await this.waitForDB();
    const sql = `
      INSERT INTO clientes (handel, id_empresa_base, nombre, apaterno, amaterno, tel1, email1, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;
    const result = await this.db.run(sql, [
      data.handel || 1,
      data.id_empresa_base || 1,
      data.nombre,
      data.apaterno || '',
      data.amaterno || '',
      data.tel1 || '',
      data.email1 || ''
    ]);
    return result.changes?.lastId || -1;
  }

  async updateCliente(id: number, data: any): Promise<boolean> {
    await this.waitForDB();
    const sql = `
      UPDATE clientes
      SET nombre = ?, apaterno = ?, amaterno = ?, tel1 = ?, email1 = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await this.db.run(sql, [
      data.nombre,
      data.apaterno || '',
      data.amaterno || '',
      data.tel1 || '',
      data.email1 || '',
      id
    ]);
    return (result.changes?.changes || 0) > 0;
  }

  async deleteCliente(id: number): Promise<boolean> {
    await this.waitForDB();
    const sql = 'UPDATE clientes SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await this.db.run(sql, [id]);
    return (result.changes?.changes || 0) > 0;
  }

  // ==================== MÉTODOS DE CONSULTA: PERSONAL ====================

  async getPersonal(): Promise<any[]> {
    await this.waitForDB();
    const result = await this.db.query(
      'SELECT * FROM personal WHERE activo = 1 ORDER BY orden, nombre'
    );
    return result.values || [];
  }

  async getPersonalById(id: number): Promise<any | null> {
    await this.waitForDB();
    const result = await this.db.query(
      'SELECT * FROM personal WHERE id = ? AND activo = 1',
      [id]
    );
    return result.values?.[0] || null;
  }

  async addPersonal(data: any): Promise<number> {
    await this.waitForDB();
    const sql = `
      INSERT INTO personal (handel, id_empresa_base, alias, nombre, apellidos, activo, orden)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `;
    const result = await this.db.run(sql, [
      data.handel || 1,
      data.id_empresa_base || 1,
      data.alias || '',
      data.nombre,
      data.apellidos || '',
      data.orden || 0
    ]);
    return result.changes?.lastId || -1;
  }

  async updatePersonal(id: number, data: any): Promise<boolean> {
    await this.waitForDB();
    const sql = `
      UPDATE personal
      SET alias = ?, nombre = ?, apellidos = ?, orden = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await this.db.run(sql, [
      data.alias || '',
      data.nombre,
      data.apellidos || '',
      data.orden || 0,
      id
    ]);
    return (result.changes?.changes || 0) > 0;
  }

  async deletePersonal(id: number): Promise<boolean> {
    await this.waitForDB();
    const sql = 'UPDATE personal SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await this.db.run(sql, [id]);
    return (result.changes?.changes || 0) > 0;
  }

  // ==================== MÉTODOS DE CONSULTA: SERVICIOS ====================

  async getServicios(): Promise<any[]> {
    await this.waitForDB();
    const result = await this.db.query(
      'SELECT * FROM productos WHERE activo = 1 AND tipo = "Servicio" ORDER BY nombre'
    );
    return result.values || [];
  }

  async getServicioById(id: number): Promise<any | null> {
    await this.waitForDB();
    const result = await this.db.query(
      'SELECT * FROM productos WHERE id = ? AND activo = 1',
      [id]
    );
    return result.values?.[0] || null;
  }

  async addServicio(data: any): Promise<number> {
    await this.waitForDB();
    const sql = `
      INSERT INTO productos (handel, id_empresa_base, codigo, nombre, tipo, n_duracion, precio, activo)
      VALUES (?, ?, ?, ?, 'Servicio', ?, ?, 1)
    `;
    const result = await this.db.run(sql, [
      data.handel || 1,
      data.id_empresa_base || 1,
      data.codigo || '',
      data.nombre,
      data.n_duracion || 1,
      data.precio || 0
    ]);
    return result.changes?.lastId || -1;
  }

  async updateServicio(id: number, data: any): Promise<boolean> {
    await this.waitForDB();
    const sql = `
      UPDATE productos
      SET codigo = ?, nombre = ?, n_duracion = ?, precio = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await this.db.run(sql, [
      data.codigo || '',
      data.nombre,
      data.n_duracion || 1,
      data.precio || 0,
      id
    ]);
    return (result.changes?.changes || 0) > 0;
  }

  async deleteServicio(id: number): Promise<boolean> {
    await this.waitForDB();
    const sql = 'UPDATE productos SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await this.db.run(sql, [id]);
    return (result.changes?.changes || 0) > 0;
  }

  // ==================== MÉTODOS DE CONSULTA: CITAS ====================

  async getCitas(fecha?: string): Promise<any[]> {
    await this.waitForDB();

    // JOIN con clientes, personal y productos para obtener información completa
    let sql = `
      SELECT
        citas.*,
        clientes.nombre as cliente_nombre,
        clientes.apaterno as cliente_apaterno,
        clientes.amaterno as cliente_amaterno,
        clientes.tel1 as cliente_tel1,
        clientes.email1 as cliente_email1,
        personal.alias as personal_alias,
        personal.nombre as personal_nombre,
        personal.apellidos as personal_apellidos,
        productos.nombre as servicio_nombre,
        productos.codigo as servicio_codigo,
        productos.precio as servicio_precio
      FROM citas
      LEFT JOIN clientes ON citas.id_cliente = clientes.id
      LEFT JOIN personal ON citas.id_personal = personal.id
      LEFT JOIN productos ON citas.id_servicio = productos.id
      WHERE citas.activo = 1
    `;
    const params: any[] = [];

    if (fecha) {
      sql += ' AND citas.fecha = ?';
      params.push(fecha);
    }

    sql += ' ORDER BY citas.fecha, citas.hora';

    const result = await this.db.query(sql, params);
    return result.values || [];
  }

  async getCitaById(id: number): Promise<any | null> {
    await this.waitForDB();
    const result = await this.db.query(
      'SELECT * FROM citas WHERE id = ?',
      [id]
    );
    return result.values?.[0] || null;
  }

  async addCita(data: any): Promise<number> {
    await this.waitForDB();
    const sql = `
      INSERT INTO citas (handel, id_empresa_base, id_cliente, id_personal, id_servicio, fecha, hora, duracion, status, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await this.db.run(sql, [
      data.handel || 1,
      data.id_empresa_base || 1,
      data.id_cliente,
      data.id_personal,
      data.id_servicio,
      data.fecha,
      data.hora,
      data.duracion || 30,
      data.status || 'Reservado',
      data.notas || ''
    ]);
    return result.changes?.lastId || -1;
  }

  async updateCita(id: number, data: any): Promise<boolean> {
    await this.waitForDB();
    const sql = `
      UPDATE citas
      SET id_cliente = ?, id_personal = ?, id_servicio = ?, fecha = ?, hora = ?,
          duracion = ?, status = ?, notas = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await this.db.run(sql, [
      data.id_cliente,
      data.id_personal,
      data.id_servicio,
      data.fecha,
      data.hora,
      data.duracion || 30,
      data.status || 'Reservado',
      data.notas || '',
      id
    ]);
    return (result.changes?.changes || 0) > 0;
  }

  async deleteCita(id: number): Promise<boolean> {
    await this.waitForDB();
    // Soft delete: marcar como inactivo en lugar de eliminar
    const sql = 'UPDATE citas SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await this.db.run(sql, [id]);
    return (result.changes?.changes || 0) > 0;
  }

  // ==================== MÉTODOS DE CONSULTA: CONFIG_AGENDA ====================

  async getConfigAgenda(handel: number = 1, idEmpresa: number = 1): Promise<any | null> {
    await this.waitForDB();
    const result = await this.db.query(
      'SELECT * FROM config_agenda WHERE handel = ? AND id_empresa_base = ? LIMIT 1',
      [handel, idEmpresa]
    );
    return result.values?.[0] || null;
  }

  async saveConfigAgenda(data: any): Promise<number> {
    await this.waitForDB();

    // Verificar si ya existe una configuración
    const existing = await this.getConfigAgenda(data.handel || 1, data.id_empresa_base || 1);

    if (existing) {
      // Actualizar existente
      const sql = `
        UPDATE config_agenda SET
          puesto_servicio = ?,
          hora_inicio = ?,
          minutos_incremento = ?,
          hora_fin = ?,
          color_libre = ?,
          color_reservada = ?,
          color_confirmada = ?,
          color_cancelada = ?,
          color_cobrado = ?,
          color_fuera_tiempo = ?,
          most_disponibilidad = ?,
          rango_manual = ?,
          rango_hora = ?,
          viz_nombre_terapeuta = ?,
          num_columnas = ?,
          horario_sabado = ?,
          horario_domingo = ?,
          formato_hora = ?,
          str_dias = ?,
          disponibilidad_hora_inicio = ?,
          disponibilidad_hora_fin = ?,
          disponibilidad_dia_habil = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await this.db.run(sql, [
        data.puesto_servicio || 'Terapeuta',
        data.hora_inicio || 9,
        data.minutos_incremento || 30,
        data.hora_fin || 20,
        data.color_libre || '#90EE90',
        data.color_reservada || '#FFD700',
        data.color_confirmada || '#87CEEB',
        data.color_cancelada || '#FF6B6B',
        data.color_cobrado || '#98FB98',
        data.color_fuera_tiempo || '#D3D3D3',
        data.most_disponibilidad ? 1 : 0,
        data.rangoManual ? 1 : 0,
        data.rangoHora ? 1 : 0,
        data.vizNombreTerapeuta ? 1 : 0,
        data.num_columnas || 4,
        data.config_horario?.horario_sabado || '09:00-18:00',
        data.config_horario?.horario_domingo || '10:00-15:00',
        data.config_horario?.formato_hora || '12',
        data.config_horario?.str_dias || 'L,M,Mi,J,V,S,D',
        data.disponibilidad?.hora_inicio || 9,
        data.disponibilidad?.hora_fin || 20,
        data.disponibilidad?.dia_habil ? 1 : 0,
        existing.id
      ]);

      return existing.id;
    } else {
      // Insertar nuevo
      const sql = `
        INSERT INTO config_agenda (
          handel, id_empresa_base, puesto_servicio, hora_inicio, minutos_incremento,
          hora_fin, color_libre, color_reservada, color_confirmada, color_cancelada,
          color_cobrado, color_fuera_tiempo, most_disponibilidad, rango_manual,
          rango_hora, viz_nombre_terapeuta, num_columnas, horario_sabado,
          horario_domingo, formato_hora, str_dias, disponibilidad_hora_inicio,
          disponibilidad_hora_fin, disponibilidad_dia_habil
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await this.db.run(sql, [
        data.handel || 1,
        data.id_empresa_base || 1,
        data.puesto_servicio || 'Terapeuta',
        data.hora_inicio || 9,
        data.minutos_incremento || 30,
        data.hora_fin || 20,
        data.color_libre || '#90EE90',
        data.color_reservada || '#FFD700',
        data.color_confirmada || '#87CEEB',
        data.color_cancelada || '#FF6B6B',
        data.color_cobrado || '#98FB98',
        data.color_fuera_tiempo || '#D3D3D3',
        data.most_disponibilidad ? 1 : 0,
        data.rangoManual ? 1 : 0,
        data.rangoHora ? 1 : 0,
        data.vizNombreTerapeuta ? 1 : 0,
        data.num_columnas || 4,
        data.config_horario?.horario_sabado || '09:00-18:00',
        data.config_horario?.horario_domingo || '10:00-15:00',
        data.config_horario?.formato_hora || '12',
        data.config_horario?.str_dias || 'L,M,Mi,J,V,S,D',
        data.disponibilidad?.hora_inicio || 9,
        data.disponibilidad?.hora_fin || 20,
        data.disponibilidad?.dia_habil ? 1 : 0
      ]);

      return result.changes?.lastId || -1;
    }
  }

  // ==================== MÉTODOS DE CONSULTA: AGENDA_TERAPEUTAS ====================

  async getAgendaTerapeutas(handel: number = 1, idEmpresa: number = 1): Promise<any[]> {
    await this.waitForDB();
    const result = await this.db.query(
      'SELECT * FROM agenda_terapeutas WHERE handel = ? AND id_empresa_base = ? AND activo = 1 ORDER BY orden',
      [handel, idEmpresa]
    );
    return result.values || [];
  }

  async addAgendaTerapeuta(data: any): Promise<number> {
    await this.waitForDB();
    const sql = `
      INSERT INTO agenda_terapeutas (handel, id_empresa_base, id_personal, alias, nombre, orden, activo)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `;
    const result = await this.db.run(sql, [
      data.handel || 1,
      data.id_empresa_base || 1,
      data.id_personal || data.id,
      data.alias || '',
      data.nombre || '',
      data.orden || 0
    ]);
    return result.changes?.lastId || -1;
  }

  async clearAgendaTerapeutas(handel: number = 1, idEmpresa: number = 1): Promise<void> {
    await this.waitForDB();
    await this.db.run(
      'DELETE FROM agenda_terapeutas WHERE handel = ? AND id_empresa_base = ?',
      [handel, idEmpresa]
    );
  }

  // ==================== MÉTODOS AUXILIARES PARA TAGENDA ====================

  /**
   * Obtiene o crea un registro en tagenda_lnk_fecha
   * @param handel - ID de sucursal
   * @param id_empresa_base - ID de empresa
   * @param fecha - Fecha en formato YYYY-MM-DD
   * @returns ID del registro en tagenda_lnk_fecha
   */
  async getOrCreateLnkFecha(
    handel: number,
    id_empresa_base: number,
    fecha: string
  ): Promise<number> {
    await this.waitForDB();

    // Buscar existente
    const result = await this.db.query(`
      SELECT id FROM tagenda_lnk_fecha
      WHERE handel = ? AND id_empresa_base = ? AND fecha = ? AND activo = 1
    `, [handel, id_empresa_base, fecha]);

    if (result.values && result.values.length > 0) {
      return result.values[0].id;
    }

    // Crear nuevo
    const insertResult = await this.db.run(`
      INSERT INTO tagenda_lnk_fecha (handel, id_empresa_base, fecha, activo)
      VALUES (?, ?, ?, 1)
    `, [handel, id_empresa_base, fecha]);

    return insertResult.changes?.lastId || 0;
  }

  /**
   * Calcula el spacio (columna) para una nueva cita
   *
   * El spacio representa la columna en la matriz de agenda donde se debe
   * colocar la cita. Se calcula basándose en el orden del personal activo.
   *
   * En el modo vizNombreTerapeuta (cada terapeuta tiene su columna):
   *   - spacio = posición del terapeuta en la lista de personal activo ordenado
   *   - Ejemplo: Si hay 3 terapeutas activos [739, 2273, 4924]
   *     - Terapeuta 739 → spacio = 0 (primera columna)
   *     - Terapeuta 2273 → spacio = 1 (segunda columna)
   *     - Terapeuta 4924 → spacio = 2 (tercera columna)
   *
   * Este valor es usado por MapaAgenda() para:
   *   1. Ubicar la cita en la matriz arrMapa[columna][fila]
   *   2. Verificar conflictos con isDisponible()
   *   3. Renderizar visualmente la agenda
   *
   * @param id_personal - ID del personal que atenderá
   * @param fecha - Fecha de la cita (YYYY-MM-DD)
   * @param hora - Hora de la cita (HH:MM)
   * @param espacios_duracion - Duración en slots
   * @returns Índice de columna (0, 1, 2, ...)
   */
  async calcularSpacio(
    id_personal: number,
    fecha: string,
    hora: string,
    espacios_duracion: number
  ): Promise<number> {
    await this.waitForDB();

    // Calcular índice basado en orden del personal activo
    // Este es el algoritmo correcto que MapaAgenda() espera:
    // El spacio es la posición del terapeuta en la lista ordenada de personal activo
    const result = await this.db.query(`
      SELECT COUNT(*) as idx
      FROM personal p1
      WHERE p1.activo = 1
        AND p1.orden < (SELECT p2.orden FROM personal p2 WHERE p2.id = ?)
    `, [id_personal]);

    const spacio = result.values?.[0]?.idx || 0;

    console.log(`📍 calcularSpacio() → id_personal: ${id_personal}, spacio: ${spacio}`);

    return spacio;
  }

  /**
   * Convierte minutos a espacios_duracion (slots)
   * @param duracion_minutos - Duración en minutos
   * @param minutos_incremento - Minutos por slot (default 30)
   * @returns Número de slots
   */
  minutosToEspacios(duracion_minutos: number, minutos_incremento: number = 30): number {
    return Math.ceil(duracion_minutos / minutos_incremento);
  }

  /**
   * Convierte espacios_duracion (slots) a minutos
   * @param espacios_duracion - Número de slots
   * @param minutos_incremento - Minutos por slot (default 30)
   * @returns Duración en minutos
   */
  espaciosToMinutos(espacios_duracion: number, minutos_incremento: number = 30): number {
    return espacios_duracion * minutos_incremento;
  }

  // ==================== MÉTODOS CRUD PARA TAGENDA (COMPATIBLE SYSERV) ====================

  /**
   * Verifica si hay conflictos de horario para una nueva cita
   * @param id_personal - ID del personal
   * @param fecha - Fecha de la cita (YYYY-MM-DD)
   * @param hora - Hora de inicio (HH:MM)
   * @param duracion_minutos - Duración en minutos
   * @param id_cita_excluir - ID de cita a excluir (para edición)
   * @returns true si hay conflicto, false si está libre
   */
  async verificarConflictoHorario(
    id_personal: number,
    fecha: string,
    hora: string,
    duracion_minutos: number,
    id_cita_excluir?: number
  ): Promise<{ hayConflicto: boolean; citasConflicto: any[] }> {
    await this.waitForDB();

    // Calcular hora de fin de la nueva cita
    const [horaInicio, minutoInicio] = hora.split(':').map(Number);
    const minutosDesdeMedianoche = horaInicio * 60 + minutoInicio;
    const minutosFinales = minutosDesdeMedianoche + duracion_minutos;

    const horaFin = Math.floor(minutosFinales / 60);
    const minutoFin = minutosFinales % 60;
    const horaFinStr = `${horaFin.toString().padStart(2, '0')}:${minutoFin.toString().padStart(2, '0')}`;

    console.log(`🔍 Verificando conflictos para: Personal ${id_personal}, Fecha ${fecha}, ${hora} - ${horaFinStr}`);

    // Buscar citas del mismo personal en la misma fecha que se solapen
    const query = `
      SELECT
        t.id,
        t.hora,
        t.espacios_duracion,
        t.status,
        c.nombre || ' ' || COALESCE(c.apaterno, '') as cliente
      FROM tagenda t
      LEFT JOIN clientes c ON t.id_cliente = c.id
      WHERE t.activo = 1
        AND t.id_personal = ?
        AND t.fecha = ?
        AND t.status IN ('Reservado', 'Confirmado', 'Cobrado')
        ${id_cita_excluir ? 'AND t.id != ?' : ''}
    `;

    const params = id_cita_excluir
      ? [id_personal, fecha, id_cita_excluir]
      : [id_personal, fecha];

    const result = await this.db.query(query, params);
    const citasExistentes = result.values || [];

    const citasConflicto: any[] = [];

    // Verificar solapamiento con cada cita existente
    for (const cita of citasExistentes) {
      const [horaExistente, minutoExistente] = cita.hora.split(':').map(Number);
      const minutosInicioExistente = horaExistente * 60 + minutoExistente;
      const duracionExistente = cita.espacios_duracion * 30; // slots a minutos
      const minutosFinExistente = minutosInicioExistente + duracionExistente;

      // Verificar solapamiento:
      // Hay conflicto si:
      // - La nueva cita empieza durante una cita existente, O
      // - La nueva cita termina durante una cita existente, O
      // - La nueva cita engloba completamente una cita existente
      const hayConflicto = (
        (minutosDesdeMedianoche >= minutosInicioExistente && minutosDesdeMedianoche < minutosFinExistente) || // Empieza durante
        (minutosFinales > minutosInicioExistente && minutosFinales <= minutosFinExistente) || // Termina durante
        (minutosDesdeMedianoche <= minutosInicioExistente && minutosFinales >= minutosFinExistente) // Engloba
      );

      if (hayConflicto) {
        const horaFinExistente = Math.floor(minutosFinExistente / 60);
        const minutoFinExistente = minutosFinExistente % 60;

        citasConflicto.push({
          ...cita,
          hora_fin: `${horaFinExistente.toString().padStart(2, '0')}:${minutoFinExistente.toString().padStart(2, '0')}`,
          duracion_minutos: duracionExistente
        });

        console.log(`⚠️ CONFLICTO: Cita existente ${cita.id} (${cita.hora} - ${citasConflicto[citasConflicto.length - 1].hora_fin})`);
      }
    }

    if (citasConflicto.length > 0) {
      console.log(`❌ ${citasConflicto.length} conflicto(s) de horario detectado(s)`);
    } else {
      console.log(`✅ No hay conflictos de horario`);
    }

    return {
      hayConflicto: citasConflicto.length > 0,
      citasConflicto
    };
  }

  /**
   * Agrega una cita en el nuevo formato compatible con syserv
   * @param citaData - Datos de la cita
   * @returns ID de la cita creada en tagenda
   */
  async addCitaTagenda(citaData: {
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
    notas2?: string;
  }): Promise<number> {
    await this.waitForDB();

    console.log('💾 Guardando cita en tagenda (compatible syserv)...', citaData);

    try {
      // 1. VALIDAR CONFLICTOS DE HORARIO
      const conflictoCheck = await this.verificarConflictoHorario(
        citaData.id_personal,
        citaData.fecha,
        citaData.hora,
        citaData.duracion_minutos
      );

      if (conflictoCheck.hayConflicto) {
        const citaConflicto = conflictoCheck.citasConflicto[0];
        const errorMsg = `Ya existe una cita para este personal en ese horario:\n${citaConflicto.cliente} - ${citaConflicto.hora} a ${citaConflicto.hora_fin}`;
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
      }

      // 2. Obtener configuración de incremento
      const config = await this.getConfigAgenda(citaData.handel, citaData.id_empresa_base);
      const minutos_incremento = config?.minutos_incremento || 30;

      // 3. Calcular espacios_duracion
      const espacios_duracion = this.minutosToEspacios(
        citaData.duracion_minutos,
        minutos_incremento
      );

      console.log(`📊 Duración: ${citaData.duracion_minutos} min = ${espacios_duracion} slots (${minutos_incremento} min/slot)`);

      // 4. Obtener o crear lnk_fecha
      const lnk_fecha_id = await this.getOrCreateLnkFecha(
        citaData.handel,
        citaData.id_empresa_base,
        citaData.fecha
      );

      console.log(`🔗 lnk_fecha_id: ${lnk_fecha_id}`);

      // 4. Calcular spacio (columna en matriz)
      const spacio = await this.calcularSpacio(
        citaData.id_personal,
        citaData.fecha,
        citaData.hora,
        espacios_duracion
      );

      console.log(`📍 spacio (columna): ${spacio}`);

      // 5. Insertar en tagenda
      const insertResult = await this.db.run(`
        INSERT INTO tagenda (
          handel, id_empresa_base, id_cliente, id_personal,
          fecha, hora, espacios_duracion, spacio,
          status, notas, notas2, ban_cita, lnk_fecha, activo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1)
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
        citaData.notas2 || '',
        lnk_fecha_id
      ]);

      const tagenda_id = insertResult.changes?.lastId;

      if (!tagenda_id) {
        throw new Error('Error al insertar cita en tagenda');
      }

      console.log(`✅ Cita insertada en tagenda con ID: ${tagenda_id}`);

      // 6. Insertar servicios en tagenda_aux
      for (const servicio of citaData.servicios) {
        await this.db.run(`
          INSERT INTO tagenda_aux (
            id_agenda, id_producto_servicio, cantidad, costo, activo
          ) VALUES (?, ?, ?, ?, 1)
        `, [
          tagenda_id,
          servicio.id_servicio,
          servicio.cantidad,
          servicio.costo
        ]);

        console.log(`  ✅ Servicio agregado: id_servicio=${servicio.id_servicio}, cantidad=${servicio.cantidad}`);
      }

      console.log(`✅ Cita completa guardada: tagenda_id=${tagenda_id}, servicios=${citaData.servicios.length}`);

      return tagenda_id;

    } catch (error) {
      console.error('❌ Error en addCitaTagenda:', error);
      throw error;
    }
  }

  /**
   * Obtiene citas del nuevo formato tagenda con JOIN completo
   * @param fecha - Fecha en formato YYYY-MM-DD (opcional)
   * @returns Array de citas con información completa
   */
  async getCitasTagenda(fecha?: string): Promise<any[]> {
    await this.waitForDB();

    let sql = `
      SELECT
        t.id,
        t.handel,
        t.id_empresa_base,
        t.id_cliente,
        c.nombre as cliente_nombre,
        c.apaterno as cliente_apaterno,
        c.amaterno as cliente_amaterno,
        c.tel1 as cliente_tel1,
        t.id_personal,
        p.nombre as personal_nombre,
        p.alias as personal_alias,
        t.fecha,
        t.hora,
        t.espacios_duracion,
        t.spacio,
        t.status,
        t.notas,
        t.notas2,
        t.ban_cita,
        t.lnk_fecha,
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
      WHERE t.activo = 1
    `;
    const params: any[] = [];

    if (fecha) {
      sql += ' AND t.fecha = ?';
      params.push(fecha);
    }

    sql += ' GROUP BY t.id ORDER BY t.fecha, t.hora, t.spacio';

    const result = await this.db.query(sql, params);
    return result.values || [];
  }

  /**
   * Obtiene los servicios de una cita específica
   * @param id_agenda - ID de la cita en tagenda
   * @returns Array de servicios con detalles
   */
  async getServiciosDeCita(id_agenda: number): Promise<any[]> {
    await this.waitForDB();

    const result = await this.db.query(`
      SELECT
        ta.id,
        ta.id_agenda,
        ta.id_producto_servicio,
        pr.nombre as servicio_nombre,
        pr.codigo as servicio_codigo,
        pr.n_duracion as servicio_duracion,
        pr.precio as servicio_precio,
        ta.cantidad,
        ta.costo,
        (ta.cantidad * ta.costo) as subtotal
      FROM tagenda_aux ta
      LEFT JOIN productos pr ON ta.id_producto_servicio = pr.id
      WHERE ta.id_agenda = ? AND ta.activo = 1
    `, [id_agenda]);

    return result.values || [];
  }

  /**
   * Actualiza una cita existente con validación de conflictos
   * @param id - ID de la cita a actualizar
   * @param citaData - Nuevos datos de la cita
   * @returns true si se actualizó correctamente
   */
  async updateCitaTagenda(id: number, citaData: {
    handel: number;
    id_empresa_base: number;
    id_cliente: number;
    id_personal: number;
    fecha: string;
    hora: string;
    duracion_minutos: number;
    servicios: Array<{
      id_servicio: number;
      cantidad: number;
      costo: number;
    }>;
    status?: string;
    notas?: string;
    notas2?: string;
  }): Promise<boolean> {
    await this.waitForDB();

    console.log(`✏️ Actualizando cita ID: ${id}`, citaData);

    try {
      // 1. VALIDAR CONFLICTOS DE HORARIO (excluyendo esta cita)
      const conflictoCheck = await this.verificarConflictoHorario(
        citaData.id_personal,
        citaData.fecha,
        citaData.hora,
        citaData.duracion_minutos,
        id // Excluir esta cita de la validación
      );

      if (conflictoCheck.hayConflicto) {
        const citaConflicto = conflictoCheck.citasConflicto[0];
        const errorMsg = `Ya existe una cita para este personal en ese horario:\n${citaConflicto.cliente} - ${citaConflicto.hora} a ${citaConflicto.hora_fin}`;
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
      }

      // 2. Obtener configuración
      const config = await this.getConfigAgenda(citaData.handel, citaData.id_empresa_base);
      const minutos_incremento = config?.minutos_incremento || 30;

      // 3. Calcular espacios_duracion
      const espacios_duracion = this.minutosToEspacios(
        citaData.duracion_minutos,
        minutos_incremento
      );

      // 4. Recalcular spacio
      const spacio = await this.calcularSpacio(
        citaData.id_personal,
        citaData.fecha,
        citaData.hora,
        espacios_duracion
      );

      // 5. Actualizar tagenda
      const sql = `
        UPDATE tagenda
        SET id_cliente = ?, id_personal = ?, fecha = ?, hora = ?,
            espacios_duracion = ?, spacio = ?, status = ?,
            notas = ?, notas2 = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const result = await this.db.run(sql, [
        citaData.id_cliente,
        citaData.id_personal,
        citaData.fecha,
        citaData.hora,
        espacios_duracion,
        spacio,
        citaData.status || 'Reservado',
        citaData.notas || '',
        citaData.notas2 || '',
        id
      ]);

      // 6. Eliminar servicios antiguos de tagenda_aux
      console.log('🔄 Eliminando servicios antiguos de tagenda_aux...');
      await this.db.run(
        'DELETE FROM tagenda_aux WHERE id_agenda = ?',
        [id]
      );

      // 7. Insertar nuevos servicios
      console.log(`💾 Guardando ${citaData.servicios.length} servicios en tagenda_aux...`);
      for (const servicio of citaData.servicios) {
        await this.db.run(`
          INSERT INTO tagenda_aux (
            id_agenda, id_producto_servicio, cantidad, costo, activo
          ) VALUES (?, ?, ?, ?, 1)
        `, [
          id,
          servicio.id_servicio,
          servicio.cantidad,
          servicio.costo
        ]);
      }

      console.log(`✅ Cita actualizada exitosamente`);
      return (result.changes?.changes || 0) > 0;
    } catch (error: any) {
      console.error('❌ Error actualizando cita:', error);
      throw error;
    }
  }

  /**
   * Elimina una cita en tagenda (soft delete)
   * @param id - ID de la cita
   * @returns true si se eliminó correctamente
   */
  async deleteCitaTagenda(id: number): Promise<boolean> {
    await this.waitForDB();

    // Soft delete en tagenda
    const sql = 'UPDATE tagenda SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const result = await this.db.run(sql, [id]);

    // También marcar como inactivos los servicios asociados
    await this.db.run(
      'UPDATE tagenda_aux SET activo = 0 WHERE id_agenda = ?',
      [id]
    );

    return (result.changes?.changes || 0) > 0;
  }

  /**
   * Busca servicios por nombre (autocompletado)
   * @param query - Texto a buscar
   * @returns Array de servicios que coinciden (con duración en MINUTOS)
   */
  async searchServicios(query: string): Promise<any[]> {
    await this.waitForDB();

    const sql = `
      SELECT
        id,
        nombre,
        (n_duracion * 30) as duracion,
        precio
      FROM productos
      WHERE activo = 1
        AND tipo = 'Servicio'
        AND LOWER(nombre) LIKE LOWER(?)
      ORDER BY nombre
      LIMIT 10
    `;

    const result = await this.db.query(sql, [`%${query}%`]);
    return result.values || [];
  }

  /**
   * 🔧 MIGRACIÓN: Corregir n_duracion incorrectos en productos
   *
   * Problema: Algunos servicios tienen n_duracion guardado en MINUTOS en lugar de ESPACIOS
   * n_duracion debe estar en ESPACIOS (slots de 30 min)
   *
   * Solución: Detectar valores > 10 (probablemente minutos) y convertirlos a espacios
   *
   * @param minutos_incremento - Minutos por slot (default 30)
   * @returns Número de registros corregidos
   */
  async corregirDuracionServicios(minutos_incremento: number = 30): Promise<number> {
    await this.waitForDB();

    console.log('🔧 Iniciando corrección de n_duracion en productos...');

    // 1. Obtener todos los servicios con n_duracion sospechoso (> 10)
    const serviciosIncorrectos = await this.db.query(`
      SELECT id, nombre, n_duracion
      FROM productos
      WHERE activo = 1
        AND tipo = 'Servicio'
        AND n_duracion > 10
    `);

    if (!serviciosIncorrectos.values || serviciosIncorrectos.values.length === 0) {
      console.log('✅ No se encontraron n_duracion incorrectos en productos');
      return 0;
    }

    console.log(`⚠️  Encontrados ${serviciosIncorrectos.values.length} servicios con n_duracion > 10:`);

    let corregidos = 0;

    // 2. Corregir cada servicio
    for (const servicio of serviciosIncorrectos.values) {
      const valorIncorrecto = servicio.n_duracion;
      const valorCorrecto = Math.ceil(valorIncorrecto / minutos_incremento);

      console.log(`   📍 Servicio ID ${servicio.id} "${servicio.nombre}":`);
      console.log(`      ❌ Antes: ${valorIncorrecto} n_duracion (${valorIncorrecto * 30} min si fueran espacios)`);
      console.log(`      ✅ Ahora:  ${valorCorrecto} n_duracion (${valorCorrecto * 30} min)`);

      await this.db.run(`
        UPDATE productos
        SET n_duracion = ?
        WHERE id = ?
      `, [valorCorrecto, servicio.id]);

      corregidos++;
    }

    console.log(`✅ ${corregidos} servicios corregidos exitosamente`);
    return corregidos;
  }

  /**
   * 🔧 MIGRACIÓN: Corregir espacios_duracion incorrectos en tagenda
   *
   * Problema: Algunas citas tienen espacios_duracion guardado en MINUTOS en lugar de ESPACIOS
   * Esto causa que MapaAgenda() marque demasiados slots como continuaciones
   *
   * Solución: Detectar valores > 10 (probablemente minutos) y convertirlos a espacios
   *
   * @param minutos_incremento - Minutos por slot (default 30)
   * @returns Número de registros corregidos
   */
  async corregirEspaciosDuracion(minutos_incremento: number = 30): Promise<number> {
    await this.waitForDB();

    console.log('🔧 Iniciando corrección de espacios_duracion en tagenda...');

    // 1. Obtener todas las citas con espacios_duracion sospechosos (> 10)
    const citasIncorrectas = await this.db.query(`
      SELECT id, espacios_duracion, fecha, hora
      FROM tagenda
      WHERE espacios_duracion > 10
        AND activo = 1
    `);

    if (!citasIncorrectas.values || citasIncorrectas.values.length === 0) {
      console.log('✅ No se encontraron espacios_duracion incorrectos en tagenda');
      return 0;
    }

    console.log(`⚠️  Encontradas ${citasIncorrectas.values.length} citas con espacios_duracion > 10:`);

    let corregidos = 0;

    // 2. Corregir cada cita
    for (const cita of citasIncorrectas.values) {
      const valorIncorrecto = cita.espacios_duracion;
      const valorCorrecto = Math.ceil(valorIncorrecto / minutos_incremento);

      console.log(`   📍 Cita ID ${cita.id} (${cita.fecha} ${cita.hora}):`);
      console.log(`      ❌ Antes: ${valorIncorrecto} espacios (${valorIncorrecto * 30} min)`);
      console.log(`      ✅ Ahora:  ${valorCorrecto} espacios (${valorCorrecto * 30} min)`);

      await this.db.run(`
        UPDATE tagenda
        SET espacios_duracion = ?
        WHERE id = ?
      `, [valorCorrecto, cita.id]);

      corregidos++;
    }

    console.log(`✅ ${corregidos} citas corregidas exitosamente`);
    return corregidos;
  }
}
