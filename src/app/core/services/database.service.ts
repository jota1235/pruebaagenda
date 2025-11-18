import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

/**
 * DatabaseService
 *
 * Servicio para gestionar la base de datos SQLite local usando Capacitor.
 * Maneja la inicialización, creación de tablas, y ejecución de queries.
 *
 * Características:
 * - Usa Capacitor SQLite para soporte nativo en iOS/Android
 * - Crea 15+ tablas para el sistema de agenda
 * - Soporte multi-tenant (por handel/sucursal)
 * - Campos de sincronización offline-first
 */
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private dbName: string = 'agenda_syserv.db';
  private isInitialized: boolean = false;
  private platform: string;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.platform = Capacitor.getPlatform();
  }

  /**
   * Inicializa la base de datos
   * Crea la conexión y todas las tablas necesarias
   */
  async initDatabase(): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ Base de datos ya inicializada');
      return;
    }

    try {
      console.log(`🔧 Iniciando base de datos en plataforma: ${this.platform}...`);

      // En web, necesitamos inicializar el web store primero
      if (this.platform === 'web') {
        console.log('🌐 Plataforma web detectada, inicializando web store...');
        // Verificar que jeep-sqlite esté disponible
        const jeepEl = document.querySelector('jeep-sqlite');
        if (!jeepEl) {
          throw new Error('Elemento jeep-sqlite no encontrado en el DOM');
        }

        // Inicializar el web store (solo falla si ya está inicializado, lo cual es seguro)
        try {
          await this.sqlite.initWebStore();
          console.log('✅ Web store inicializado correctamente');
        } catch (error: any) {
          // Si ya está inicializado, el error es esperado y lo ignoramos
          if (error.message && error.message.includes('already initialized')) {
            console.log('ℹ️ Web store ya estaba inicializado');
          } else {
            console.error('❌ Error al inicializar web store:', error);
            throw error;
          }
        }
      } else {
        console.log(`📱 Plataforma nativa (${this.platform}) detectada`);
      }

      // Crear/abrir conexión a la base de datos
      console.log(`🔗 Creando conexión a: ${this.dbName}...`);
      this.db = await this.sqlite.createConnection(
        this.dbName,
        false,              // No encriptada
        'no-encryption',
        1,                  // Versión
        false               // No readonly
      );
      console.log('✅ Conexión creada');

      // Abrir base de datos
      console.log('🔓 Abriendo base de datos...');
      await this.db.open();
      console.log('✅ Base de datos abierta');

      // Crear todas las tablas
      console.log('📋 Creando tablas...');
      await this.createTables();
      console.log('✅ Tablas creadas');

      // Crear índices para performance
      console.log('🔍 Creando índices...');
      await this.createIndexes();
      console.log('✅ Índices creados');

      this.isInitialized = true;
      console.log('🎉 Base de datos inicializada exitosamente');

    } catch (error) {
      console.error('❌ Error FATAL al inicializar base de datos:', error);
      console.error('❌ Tipo de error:', typeof error);
      console.error('❌ Error stack:', (error as any)?.stack);
      throw error;
    }
  }

  /**
   * Crea todas las tablas del sistema
   */
  private async createTables(): Promise<void> {
    console.log('Creando tablas...');

    const tables = [
      // ==================== TABLA 1: EMPRESAS BASE ====================
      `CREATE TABLE IF NOT EXISTS tempresas_base (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_empresa TEXT,
        activa TEXT DEFAULT 'SI',
        tiempo_notificacion_1 INTEGER DEFAULT 1440,
        tiempo_notificacion_2 INTEGER DEFAULT 60,
        status_send_1 TEXT DEFAULT 'Confirmado',
        status_send_2 TEXT DEFAULT 'Confirmado',
        send_type_1 TEXT DEFAULT 'SMS',
        send_type_2 TEXT DEFAULT 'SMS',
        dias_ctespr INTEGER DEFAULT 365,
        nventa_ctespr INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // ==================== TABLA 2: EMPRESAS/SUCURSALES ====================
      `CREATE TABLE IF NOT EXISTS tempresas (
        handel INTEGER PRIMARY KEY,
        id_empresa_base INTEGER NOT NULL,
        nombreSucursal_Sel TEXT,
        Telefono TEXT,
        activa TEXT DEFAULT 'Si',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_empresa_base) REFERENCES tempresas_base(id)
      )`,

      // ==================== TABLA 3: PERMISOS/ROLES ====================
      `CREATE TABLE IF NOT EXISTS tpermisos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER NOT NULL,
        nombre TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (handel) REFERENCES tempresas(handel)
      )`,

      // ==================== TABLA 4: USUARIOS/PERSONAL ====================
      `CREATE TABLE IF NOT EXISTS tusuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER NOT NULL,
        alias TEXT,
        nombre TEXT,
        apaterno TEXT,
        amaterno TEXT,
        nombrecto TEXT,
        tel1 TEXT,
        tel2 TEXT,
        email1 TEXT,
        activo TEXT DEFAULT 'Si',
        id_permiso INTEGER,
        orden INTEGER DEFAULT 0,
        color_agenda_fondo TEXT DEFAULT '#848484',
        color_agenda_texto TEXT DEFAULT 'white',
        sync_status TEXT DEFAULT 'synced',
        uuid_local TEXT,
        version INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted INTEGER DEFAULT 0,
        FOREIGN KEY (handel) REFERENCES tempresas(handel),
        FOREIGN KEY (id_permiso) REFERENCES tpermisos(id)
      )`,

      // ==================== TABLA 5: CLIENTES ====================
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
        deleted INTEGER DEFAULT 0,
        FOREIGN KEY (handel) REFERENCES tempresas(handel)
      )`,

      // ==================== TABLA 6: PRODUCTOS/SERVICIOS ====================
      `CREATE TABLE IF NOT EXISTS tproductos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER NOT NULL,
        nombre TEXT,
        codigo TEXT,
        tipo TEXT DEFAULT 'Servicio',
        u_medida TEXT DEFAULT 'Pieza',
        n_duracion INTEGER DEFAULT 1,
        precio REAL DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        uuid_local TEXT,
        version INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted INTEGER DEFAULT 0,
        FOREIGN KEY (handel) REFERENCES tempresas(handel)
      )`,

      // ==================== TABLA 7: CONFIGURACIÓN GENERAL ====================
      `CREATE TABLE IF NOT EXISTS tconfig_gral (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER UNIQUE NOT NULL,
        id_empresa_base INTEGER,
        puesto_servicio TEXT DEFAULT 'Terapeuta',
        hora_inicio INTEGER DEFAULT 9,
        hora_fin INTEGER DEFAULT 18,
        minutos_incremento INTEGER DEFAULT 30,
        color_libre TEXT DEFAULT '#ffffff',
        color_reservada TEXT DEFAULT '#FFF3CD',
        color_confirmada TEXT DEFAULT '#D4EDDA',
        color_cancelada TEXT DEFAULT '#F8D7DA',
        color_cobrado TEXT DEFAULT '#CCE5FF',
        color_fuera_tiempo TEXT DEFAULT '#E9ECEF',
        most_disponibilidad TEXT DEFAULT 'SI',
        rangoManual TEXT DEFAULT 'NO',
        rangoHora TEXT DEFAULT 'SI',
        vizNombreTerapeuta TEXT DEFAULT 'SI',
        Filas TEXT,
        num_columnas INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (handel) REFERENCES tempresas(handel),
        FOREIGN KEY (id_empresa_base) REFERENCES tempresas_base(id)
      )`,

      // ==================== TABLA 8: CONFIGURACIÓN AUXILIAR ====================
      `CREATE TABLE IF NOT EXISTS tconfig_gral_aux1 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER UNIQUE NOT NULL,
        horario_sabado TEXT,
        horario_domingo TEXT,
        formato_hora TEXT DEFAULT 'militar',
        str_dias TEXT DEFAULT '1-2-3-4-5',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (handel) REFERENCES tempresas(handel)
      )`,

      // ==================== TABLA 9: ESPACIOS ADICIONALES ====================
      `CREATE TABLE IF NOT EXISTS tespacios_adicionales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        col_aux INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(handel, fecha),
        FOREIGN KEY (handel) REFERENCES tempresas(handel)
      )`,

      // ==================== TABLA 10: LINK DE FECHAS ====================
      `CREATE TABLE IF NOT EXISTS tagenda_lnk_fecha (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT UNIQUE NOT NULL
      )`,

      // ==================== TABLA 11: AGENDA (PRINCIPAL) ====================
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
        deleted INTEGER DEFAULT 0,
        FOREIGN KEY (handel) REFERENCES tempresas(handel),
        FOREIGN KEY (id_cliente) REFERENCES tclientes(id),
        FOREIGN KEY (id_personal) REFERENCES tusuarios(id),
        FOREIGN KEY (lnk_fecha) REFERENCES tagenda_lnk_fecha(id)
      )`,

      // ==================== TABLA 12: AGENDA AUXILIAR ====================
      `CREATE TABLE IF NOT EXISTS tagenda_aux (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_agenda INTEGER NOT NULL,
        id_producto_servicio INTEGER,
        cantidad REAL DEFAULT 1,
        costo REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_agenda) REFERENCES tagenda(id),
        FOREIGN KEY (id_producto_servicio) REFERENCES tproductos(id)
      )`,

      // ==================== TABLA 13: INVENTARIO ====================
      `CREATE TABLE IF NOT EXISTS tinventario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER NOT NULL,
        id_producto INTEGER,
        id_agenda INTEGER,
        cantidad REAL DEFAULT 0,
        ban_add_manual INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (handel) REFERENCES tempresas(handel),
        FOREIGN KEY (id_producto) REFERENCES tproductos(id),
        FOREIGN KEY (id_agenda) REFERENCES tagenda(id)
      )`,

      // ==================== TABLA 14: RECORDATORIOS ====================
      `CREATE TABLE IF NOT EXISTS trecordatorios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER NOT NULL,
        id_agenda INTEGER,
        tipo TEXT,
        fecha_envio TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (handel) REFERENCES tempresas(handel),
        FOREIGN KEY (id_agenda) REFERENCES tagenda(id)
      )`,

      // ==================== TABLA 15: CONTROL DE ASISTENCIA ====================
      `CREATE TABLE IF NOT EXISTS tcontrol_asistencia (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER NOT NULL,
        id_personal INTEGER,
        fecha_evento TEXT,
        tipo_evento TEXT,
        hora_evento TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (handel) REFERENCES tempresas(handel),
        FOREIGN KEY (id_personal) REFERENCES tusuarios(id)
      )`,

      // ==================== TABLA 16: OUTBOX (SINCRONIZACIÓN) ====================
      `CREATE TABLE IF NOT EXISTS outbox (
        op_id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        company_id INTEGER NOT NULL,
        entity TEXT NOT NULL,
        entity_id INTEGER,
        payload TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        attempts INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        last_error TEXT,
        last_attempt TEXT
      )`,

      // ==================== TABLA 17: SYNC STATE ====================
      `CREATE TABLE IF NOT EXISTS sync_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        resource TEXT NOT NULL,
        last_full_sync TEXT,
        last_delta_sync TEXT,
        last_window_from TEXT,
        last_window_to TEXT,
        UNIQUE(company_id, resource)
      )`
    ];

    // Ejecutar creación de cada tabla
    for (const sql of tables) {
      try {
        await this.db!.execute(sql);
      } catch (error) {
        console.error('Error creando tabla:', error);
        throw error;
      }
    }

    console.log('Tablas creadas exitosamente');
  }

  /**
   * Crea índices para optimizar consultas
   */
  private async createIndexes(): Promise<void> {
    console.log('Creando índices...');

    const indexes = [
      // Índices para tagenda (tabla más consultada)
      'CREATE INDEX IF NOT EXISTS idx_tagenda_fecha ON tagenda(fecha)',
      'CREATE INDEX IF NOT EXISTS idx_tagenda_handel_fecha ON tagenda(handel, fecha)',
      'CREATE INDEX IF NOT EXISTS idx_tagenda_status ON tagenda(status)',
      'CREATE INDEX IF NOT EXISTS idx_tagenda_sync ON tagenda(sync_status)',
      'CREATE INDEX IF NOT EXISTS idx_tagenda_personal ON tagenda(id_personal)',
      'CREATE INDEX IF NOT EXISTS idx_tagenda_cliente ON tagenda(id_cliente)',

      // Índices para tclientes
      'CREATE INDEX IF NOT EXISTS idx_tclientes_handel ON tclientes(handel)',
      'CREATE INDEX IF NOT EXISTS idx_tclientes_sync ON tclientes(sync_status)',

      // Índices para tusuarios
      'CREATE INDEX IF NOT EXISTS idx_tusuarios_handel ON tusuarios(handel)',
      'CREATE INDEX IF NOT EXISTS idx_tusuarios_activo ON tusuarios(activo)',
      'CREATE INDEX IF NOT EXISTS idx_tusuarios_sync ON tusuarios(sync_status)',

      // Índices para tproductos
      'CREATE INDEX IF NOT EXISTS idx_tproductos_handel ON tproductos(handel)',
      'CREATE INDEX IF NOT EXISTS idx_tproductos_tipo ON tproductos(tipo)',
      'CREATE INDEX IF NOT EXISTS idx_tproductos_sync ON tproductos(sync_status)',

      // Índices para outbox
      'CREATE INDEX IF NOT EXISTS idx_outbox_status ON outbox(status)',
      'CREATE INDEX IF NOT EXISTS idx_outbox_created ON outbox(created_at)',

      // Índices para sync_state
      'CREATE INDEX IF NOT EXISTS idx_sync_company_resource ON sync_state(company_id, resource)'
    ];

    for (const sql of indexes) {
      try {
        await this.db!.execute(sql);
      } catch (error) {
        console.warn('Advertencia creando índice:', error);
      }
    }

    console.log('Índices creados exitosamente');
  }

  /**
   * Ejecuta una consulta SELECT y retorna resultados
   */
  async executeQuery(query: string, params: any[] = []): Promise<any[]> {
    if (!this.db) {
      throw new Error('Base de datos no inicializada');
    }

    try {
      const result = await this.db.query(query, params);
      return result.values || [];
    } catch (error) {
      console.error('Error ejecutando query:', query, error);
      throw error;
    }
  }

  /**
   * Ejecuta un comando INSERT/UPDATE/DELETE
   */
  async executeCommand(query: string, params: any[] = []): Promise<boolean> {
    if (!this.db) {
      throw new Error('Base de datos no inicializada');
    }

    try {
      await this.db.run(query, params);
      return true;
    } catch (error) {
      console.error('Error ejecutando comando:', query, error);
      throw error;
    }
  }

  /**
   * Ejecuta múltiples comandos en una transacción
   */
  async executeTransaction(queries: { query: string; params?: any[] }[]): Promise<boolean> {
    if (!this.db) {
      throw new Error('Base de datos no inicializada');
    }

    try {
      await this.db.execute('BEGIN TRANSACTION');

      for (const { query, params = [] } of queries) {
        await this.db.run(query, params);
      }

      await this.db.execute('COMMIT');
      return true;
    } catch (error) {
      await this.db.execute('ROLLBACK');
      console.error('Error en transacción:', error);
      throw error;
    }
  }

  /**
   * Guarda los cambios en el store (solo web)
   * Llama esto después de operaciones importantes en lote
   */
  async saveToStore(): Promise<void> {
    if (this.platform === 'web' && this.db) {
      await this.sqlite.saveToStore(this.dbName);
      console.log('💾 Cambios guardados en web store');
    }
  }

  /**
   * Obtiene el último ID insertado
   */
  async getLastInsertId(): Promise<number> {
    const result = await this.executeQuery('SELECT last_insert_rowid() as id');
    return result[0]?.id || 0;
  }

  /**
   * Limpia toda la base de datos (útil para testing)
   */
  async clearDatabase(): Promise<void> {
    if (!this.db) {
      throw new Error('Base de datos no inicializada');
    }

    try {
      // Lista de tablas en orden inverso por dependencias
      const tables = [
        'trecordatorios',
        'tcontrol_asistencia',
        'tinventario',
        'tagenda_aux',
        'tagenda',
        'tagenda_lnk_fecha',
        'tespacios_adicionales',
        'tconfig_gral_aux1',
        'tconfig_gral',
        'tproductos',
        'tclientes',
        'tusuarios',
        'tpermisos',
        'tempresas',
        'tempresas_base',
        'outbox',
        'sync_state'
      ];

      for (const table of tables) {
        await this.db.execute(`DELETE FROM ${table}`);
      }

      console.log('Base de datos limpiada');
    } catch (error) {
      console.error('Error limpiando base de datos:', error);
      throw error;
    }
  }

  /**
   * Cierra la conexión a la base de datos
   */
  async close(): Promise<void> {
    if (this.db) {
      try {
        await this.sqlite.closeConnection(this.dbName, false);
        this.db = null;
        this.isInitialized = false;
        console.log('Conexión a BD cerrada');
      } catch (error) {
        console.error('Error cerrando conexión:', error);
      }
    }
  }

  /**
   * Verifica si la base de datos está inicializada
   */
  isDbInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Exporta la base de datos (útil para backups)
   */
  async exportDatabase(): Promise<any> {
    if (!this.db) {
      throw new Error('Base de datos no inicializada');
    }

    try {
      const exportResult = await this.db.exportToJson('full');
      return exportResult.export;
    } catch (error) {
      console.error('Error exportando base de datos:', error);
      throw error;
    }
  }

  /**
   * Importa una base de datos desde JSON
   * NOTA: Funcionalidad pendiente de implementación con Capacitor SQLite
   */
  async importDatabase(jsonData: any): Promise<void> {
    console.warn('importDatabase() no implementado aún para Capacitor SQLite');
    // TODO: Implementar importación de datos desde JSON
    // Posible solución: ejecutar múltiples INSERT statements desde el JSON
  }
}
