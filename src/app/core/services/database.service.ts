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

      -- ==================== CITAS ====================
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

      -- ==================== ÍNDICES PARA PERFORMANCE ====================
      CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo, handel, id_empresa_base);
      CREATE INDEX IF NOT EXISTS idx_personal_activo ON personal(activo, handel, id_empresa_base);
      CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo, tipo, handel, id_empresa_base);
      CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha, handel, id_empresa_base);
      CREATE INDEX IF NOT EXISTS idx_citas_personal ON citas(id_personal, fecha);
      CREATE INDEX IF NOT EXISTS idx_citas_activo ON citas(activo);
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
      `;

      await this.db.execute(seedData);
      console.log('✅ Datos de prueba sembrados correctamente');
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
    let sql = 'SELECT * FROM citas WHERE activo = 1';
    const params: any[] = [];

    if (fecha) {
      sql += ' AND fecha = ?';
      params.push(fecha);
    }

    sql += ' ORDER BY fecha, hora';

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
}
