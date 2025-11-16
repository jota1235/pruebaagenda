import { Injectable } from '@angular/core';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import {
  ConfigAgenda,
  Terapeuta,
  HorarioAgenda,
  Reserva,
  Cliente,
  Producto,
  CitaCobrada,
  CitaPendiente,
  PosicionMapa,
  ConfigColumnas,
  DisponibilidadParams,
  CitaSimulada,
  InfoRegAgenda
} from './agenda.interfaces';

/**
 * Servicio de Agenda para Ionic + Angular + sql.js
 * Traducido desde PHP (.ht-agenda.php)
 *
 * Este servicio maneja toda la lógica de gestión de agenda:
 * - Visualización de horarios y terapeutas
 * - Mapeo de reservas/citas
 * - Cálculo de disponibilidad
 * - Reportes y listados
 * - Control de asistencia
 */
@Injectable({
  providedIn: 'root'
})
export class AgendaService {

  // ==================== PROPIEDADES PRIVADAS ====================

  private db: Database | null = null;
  private SQL: SqlJsStatic | null = null;

  private handel: number = 0;
  private id_empresa_base: number = 0;
  private alcanceSucursal: string = 'suc_act';
  private fecha01: string = this.getToday();
  private fecha02: string = this.getToday();
  private nombreCte: string = '%';
  private alcanceCitas: string = "'Cobrado','Confirmado','Reservado'";
  private type_filtre: string = 'service_list';
  private arr_ccob: CitaCobrada[] = [];
  private alias_atendio: string = '';
  private id_agenda: number = 0;
  private minutos_incremento: number = 30;
  private id_corte: number = 0;
  private order_byp: string = 't1.fecha asc,t1.hora asc';
  private arr_idsxverify: any[] = [];
  private id_caja: number = 0;
  private ids_agenda: string = '';
  private str_idsxverify: string = '';
  private ban_edit: boolean = true;
  private crf: number = 1;
  private list_suc_seg: string = 'all';
  private ban_suc_seg: boolean = false;
  private data_citas_pendientes: CitaPendiente[] = [];
  private poscColumns: string = '';
  private info_cols_terapeutas: Terapeuta[] = [];
  private vecAcumPromo: string[] = [];
  private AcumMedio_promo: string = '[]';
  private vecConfigAgenda: ConfigAgenda | any = {};
  private vecReservas: Reserva[] = [];
  private fecha_op: string = this.getToday();
  private listHorariosAll: HorarioAgenda[] = [];
  private listHorarios: string[] = [];
  public max_col_data: number = -1;
  private arrMapa: string[][] = [[], []];
  private validHora: boolean = true;
  private ColTest: number = 40; // Columnas adicionales para mapa
  private info_reg_agenda: InfoRegAgenda | any = {};
  private arr_clientes_premium: any[] = [];
  private ids_clientes: number[] = [];
  private exclude_id_agenda: number = -1;
  private textHorario: string = '';
  private ids_servicios_calc: string = '';
  private espacios_requeridos: number = -1;
  private id_cliente: number = -1;
  private hora_disponible: string = '';
  private columna_disponible: number = -1;
  private idsFueraTiempo: number[] = [];
  private arr_tmp_idsagenda: number[] = [];
  private ban_cita: number = 0;
  private arrCitas_simuladas: Reserva[] = [];
  private dispony_cols: string[] = [];
  private listCodeCtos: string[] = [];
  private arrColsDisp: ConfigColumnas = {};
  private max_col_aux: number = 10;
  private isControlAsistencia: boolean = false;
  private fecha1_ctrl_asist: string = '';
  private fecha2_ctrl_asist: string = '';
  private reservar_con_antelacion: number = 15;

  // ==================== CONSTRUCTOR ====================

  constructor() {
    this.initDatabase();
  }

  // ==================== INICIALIZACIÓN ====================

  /**
   * Inicializa la base de datos SQLite con sql.js
   */
  async initDatabase(): Promise<void> {
    try {
      this.SQL = await initSqlJs({
        locateFile: file => `assets/sql-wasm.wasm`
      });

      // Crear nueva base de datos o cargar existente
      const savedDb = localStorage.getItem('agendaDB');
      if (savedDb) {
        const uint8Array = new Uint8Array(JSON.parse(savedDb));
        this.db = new this.SQL.Database(uint8Array);
      } else {
        this.db = new this.SQL.Database();
        await this.createTables();
      }
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
    }
  }

  /**
   * Crea las tablas necesarias en SQLite
   */
  private async createTables(): Promise<void> {
    if (!this.db) return;

    const tables = [
      // Tabla de Agenda
      `CREATE TABLE IF NOT EXISTS tagenda (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER,
        id_empresa_base INTEGER,
        id_cliente INTEGER,
        id_personal INTEGER,
        fecha TEXT,
        hora TEXT,
        status TEXT,
        espacios_duracion INTEGER,
        spacio INTEGER,
        notas TEXT,
        notas2 TEXT,
        ban_cita INTEGER DEFAULT 0,
        ban_liquid_credito INTEGER DEFAULT 0,
        id_caja INTEGER DEFAULT 0,
        folio INTEGER DEFAULT 0,
        clav_insumo INTEGER DEFAULT -1,
        efectivo REAL DEFAULT 0,
        tarjeta REAL DEFAULT 0,
        transferencia REAL DEFAULT 0,
        deposito REAL DEFAULT 0,
        puntos REAL DEFAULT 0,
        credito REAL DEFAULT 0,
        apartado REAL DEFAULT 0,
        lnk_fecha INTEGER
      )`,

      // Tabla de Clientes
      `CREATE TABLE IF NOT EXISTS tclientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER,
        nombrecto TEXT,
        nombre TEXT,
        apaterno TEXT,
        amaterno TEXT,
        tel1 TEXT,
        tel2 TEXT,
        email1 TEXT,
        codPaisTel1 TEXT,
        medio_promo TEXT
      )`,

      // Tabla de Usuarios/Terapeutas
      `CREATE TABLE IF NOT EXISTS tusuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER,
        alias TEXT,
        nombre TEXT,
        apaterno TEXT,
        amaterno TEXT,
        nombrecto TEXT,
        activo TEXT DEFAULT 'Si',
        id_permiso INTEGER,
        orden INTEGER DEFAULT 0
      )`,

      // Tabla de Productos/Servicios
      `CREATE TABLE IF NOT EXISTS tproductos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER,
        nombre TEXT,
        codigo TEXT,
        tipo TEXT,
        u_medida TEXT,
        n_duracion INTEGER DEFAULT 1
      )`,

      // Tabla de Configuración General
      `CREATE TABLE IF NOT EXISTS tconfig_gral (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER,
        id_empresa_base INTEGER,
        puesto_servicio TEXT,
        hora_inicio INTEGER DEFAULT 9,
        minutos_incremento INTEGER DEFAULT 30,
        hora_fin INTEGER DEFAULT 18,
        color_libre TEXT DEFAULT '#FFFFFF',
        color_reservada TEXT DEFAULT '#FFA500',
        color_confirmada TEXT DEFAULT '#00FF00',
        color_cancelada TEXT DEFAULT '#FF0000',
        color_cobrado TEXT DEFAULT '#0000FF',
        color_fuera_tiempo TEXT DEFAULT '#808080',
        most_disponibilidad TEXT DEFAULT 'SI',
        rangoManual TEXT DEFAULT 'NO',
        Filas TEXT,
        num_columnas INTEGER DEFAULT 1,
        appliDescuentos INTEGER DEFAULT 0,
        rangoHora TEXT DEFAULT 'SI',
        vizNombreTerapeuta TEXT DEFAULT 'SI',
        vizAnticipo INTEGER DEFAULT 0
      )`,

      // Tabla de Espacios Adicionales
      `CREATE TABLE IF NOT EXISTS tespacios_adicionales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER,
        fecha TEXT,
        col_aux INTEGER DEFAULT 0,
        UNIQUE(handel, fecha)
      )`,

      // Tabla auxiliar de Agenda
      `CREATE TABLE IF NOT EXISTS tagenda_aux (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_agenda INTEGER,
        id_producto_servicio INTEGER,
        cantidad REAL DEFAULT 1,
        costo REAL DEFAULT 0
      )`,

      // Tabla de Permisos
      `CREATE TABLE IF NOT EXISTS tpermisos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER,
        nombre TEXT
      )`,

      // Tabla de Empresas
      `CREATE TABLE IF NOT EXISTS tempresas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER,
        id_empresa_base INTEGER,
        nombreSucursal_Sel TEXT,
        Telefono TEXT,
        activa TEXT DEFAULT 'Si'
      )`,

      // Tabla de Empresas Base
      `CREATE TABLE IF NOT EXISTS tempresas_base (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_empresa TEXT,
        activa TEXT DEFAULT 'SI',
        tiempo_notificacion_1 INTEGER DEFAULT 0,
        tiempo_notificacion_2 INTEGER DEFAULT 0,
        status_send_1 TEXT DEFAULT '-Indistinto-',
        status_send_2 TEXT DEFAULT '-Indistinto-',
        send_type_1 TEXT DEFAULT 'SMS',
        send_type_2 TEXT DEFAULT 'SMS',
        dias_ctespr INTEGER DEFAULT 365,
        nventa_ctespr INTEGER DEFAULT -1
      )`,

      // Tabla de Configuración Auxiliar 1
      `CREATE TABLE IF NOT EXISTS tconfig_gral_aux1 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER,
        horario_sabado TEXT,
        horario_domingo TEXT,
        formato_hora TEXT DEFAULT 'militar',
        str_dias TEXT
      )`,

      // Tabla de Link de Fechas
      `CREATE TABLE IF NOT EXISTS tagenda_lnk_fecha (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT UNIQUE
      )`,

      // Tabla de Inventario
      `CREATE TABLE IF NOT EXISTS tinventario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_producto INTEGER,
        id_agenda INTEGER,
        cantidad REAL DEFAULT 0,
        ban_add_manual INTEGER DEFAULT 0
      )`,

      // Tabla de Recordatorios
      `CREATE TABLE IF NOT EXISTS trecordatorios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER,
        id_agenda INTEGER,
        tipo TEXT,
        fecha_envio TEXT
      )`,

      // Tabla de Control de Asistencia
      `CREATE TABLE IF NOT EXISTS tcontrol_asistencia (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handel INTEGER,
        id_personal INTEGER,
        fecha_evento TEXT
      )`
    ];

    tables.forEach(sql => {
      try {
        this.db!.run(sql);
      } catch (error) {
        console.error('Error creando tabla:', error);
      }
    });

    this.saveDatabase();
  }

  /**
   * Guarda la base de datos en localStorage
   */
  private saveDatabase(): void {
    if (!this.db) return;

    const data = this.db.export();
    const buffer = JSON.stringify(Array.from(data));
    localStorage.setItem('agendaDB', buffer);
  }

  // ==================== MÉTODOS SETTER ====================

  setHandel(newValor: number): void {
    this.handel = newValor;
  }

  setEmpresaBase(newValor: number): void {
    this.id_empresa_base = newValor;
  }

  setMinutosIncremento(newValor: number): void {
    this.minutos_incremento = newValor;
  }

  setOrderBy(newValor: string): void {
    this.order_byp = newValor;
  }

  setAlcanceCitas(newValor: string): void {
    this.alcanceCitas = newValor;
  }

  setIdCaja(newValor: number): void {
    this.id_caja = newValor;
  }

  setEditable(trueOfalse: boolean): void {
    this.ban_edit = trueOfalse;
  }

  setFechaAg(newFecha: string): void {
    this.fecha_op = this.formatDate(newFecha);
  }

  setIdCliente(newValor: number): void {
    this.id_cliente = newValor;
  }

  setMinutosAntelacion(minutos_antelacion: number): void {
    this.reservar_con_antelacion = minutos_antelacion;
  }

  /**
   * Pone como disponibles solo ciertas columnas
   */
  setDisponyCols(arrColsDisp: ConfigColumnas = {}): void {
    this.arrColsDisp = arrColsDisp;
    this.dispony_cols = [];

    for (const key in arrColsDisp) {
      if (key.length > 4 && key.indexOf('col_') !== -1) {
        this.dispony_cols.push(key.split('col_')[1]);
      }
    }
  }

  /**
   * Agrega una cita de forma directa al mapa de reservas
   */
  setArrCita(arrVal: CitaSimulada[] = []): void {
    arrVal.forEach(valor => {
      // Valores por defecto
      if (!valor.id_atiende) {
        valor.id_atiende = '-1';
        valor.alias_atiende = 'System';
        valor.nombre_atiende = 'System';
      }
      if (!valor.notas) valor.notas = '';
      if (!valor.id_cliente) valor.id_cliente = '-1';

      this.arrCitas_simuladas.push({
        id_agenda: parseInt(valor.id_agenda),
        id_cliente: parseInt(valor.id_cliente),
        id_personal: parseInt(valor.id_atiende),
        hora: valor.hora,
        hora_ag: valor.hora,
        status: 'FueraTiempo',
        duracion: valor.espacios_duracion,
        columna: typeof valor.columna === 'string' ? parseInt(valor.columna) : valor.columna,
        columna_ag: typeof valor.columna === 'string' ? parseInt(valor.columna) : valor.columna,
        id_personal_ag: valor.id_atiende,
        cliente: 'PUBLICO EN GENERAL',
        tel1: null,
        tel2: null,
        email1: null,
        notas: valor.notas,
        notas2: '',
        notas_ag: valor.notas,
        ban_cita: 0,
        ban_liquid_credito: 0,
        servicios_agenda: null,
        seteado: false,
        alias_personal: valor.alias_atiende || 'System',
        nombre_personal: valor.nombre_atiende || 'System'
      });
    });
  }

  /**
   * Determina si en el mapeo agregará dinámicamente horarios inexistentes
   */
  setValidHorario(trueOfalse: boolean): void {
    this.validHora = trueOfalse;
  }

  /**
   * Cita que será excluida del mapeo en la agenda
   */
  setExcludeIdAgenda(NewValor: number = -1): void {
    this.exclude_id_agenda = NewValor;
  }

  /**
   * Verifica que esté disponible un horario
   */
  setVerifyDisponibilidad(textHorario: string = ''): void {
    this.textHorario = textHorario;
  }

  /**
   * Establece bandera para indicar si el empleado fue solicitado por el cliente
   */
  setEmpleadoSolicitado(trueOfalse: boolean): void {
    this.ban_cita = trueOfalse ? 1 : 0;
  }

  /**
   * Determina si consulta por 'sucursal' o 'empresa'
   * 'suc_act' = Consulta por sucursal
   * 'all_eb' = Por empresa base
   */
  setSucursal(alcance: string = 'suc_act'): void {
    this.alcanceSucursal = alcance;
  }

  /**
   * Consulta por rango de fecha
   */
  setPeriodo(fecha01: string, fecha02: string): void {
    this.fecha01 = this.formatDate(fecha01);
    this.fecha02 = this.formatDate(fecha02);
  }

  /**
   * Filtra por cliente
   */
  setCliente(nombreCte: string = ''): void {
    this.nombreCte = `%${nombreCte.replace(/ /g, '%')}%`;
  }

  /**
   * Determina si se mostrarán solo registros de agenda
   */
  setTypeFiltre(type: string): void {
    this.type_filtre = type;
  }

  /**
   * Filtra por empleado
   */
  setAliasAtendio(AliasEmpleado: string = ''): void {
    this.alias_atendio = AliasEmpleado.trim();
  }

  /**
   * Consulta una venta en particular
   */
  setIdAgenda(id_agenda: number): void {
    this.id_agenda = id_agenda;
    this.id_corte = 0;
  }

  /**
   * Consulta registros por id de corte
   */
  setIdCorte(id_corte: number): void {
    this.id_agenda = 0;
    this.id_corte = id_corte;
  }

  /**
   * Consulta un listado de IDs de Agenda
   */
  setIdsAgenda(ids_agenda: string): void {
    this.ids_agenda = ids_agenda;
    this.id_corte = 0;
    this.id_agenda = 0;
  }

  /**
   * Condicionante para revisión
   * 1 = Para todas las ventas
   * 2 = Solo ventas con insumos
   */
  setRevision(crf: number): void {
    this.crf = crf;
  }

  /**
   * Si se establece en true, valida que la sucursal actual esté configurada
   */
  setSucSeg(trueOfalse: boolean = false): void {
    this.ban_suc_seg = trueOfalse;
  }

  setListSucSeg(list_suc_seg: string): void {
    this.list_suc_seg = list_suc_seg;
  }

  /**
   * Si entra en juego el control de asistencia
   */
  setIsCtrlAsistencia(fecha01: string, fecha02: string | null = null): void {
    if (!fecha02) fecha02 = fecha01;
    this.fecha1_ctrl_asist = this.formatDate(fecha01) + ' 00:00:00';
    this.fecha2_ctrl_asist = this.formatDate(fecha02) + ' 23:59:59';
    this.isControlAsistencia = true;
  }

  // ==================== MÉTODOS GETTER ====================

  /**
   * Regresa todos los IDs de Agenda que son bloqueos
   */
  getIdsFueraTiempo(): number[] {
    return this.idsFueraTiempo;
  }

  /**
   * Regresa todos los IDs contenidos en una verificación
   */
  getIdsVerify(): string {
    return this.str_idsxverify;
  }

  /**
   * Regresa toda la información de citas pendientes
   */
  getCitasPendientes(): CitaPendiente[] {
    return this.data_citas_pendientes;
  }

  /**
   * Obtiene las claves de las terapeutas en el orden que aparecen
   */
  getPosColums(): string {
    return this.poscColumns;
  }

  /**
   * Obtiene un array con la información de los terapeutas
   */
  getInfoColsTerapeutas(): Terapeuta[] {
    return this.info_cols_terapeutas;
  }

  /**
   * Retorna un listado de medios promocionales
   */
  getListMedioPromo(formato: string = 'array'): string[] | string {
    return formato === 'array' ? this.vecAcumPromo : this.AcumMedio_promo;
  }

  /**
   * Obtiene un array con la configuración de la agenda
   */
  getInfoConfigAgenda(): ConfigAgenda {
    return this.vecConfigAgenda;
  }

  /**
   * Obtiene lista de reservas en un día en especial
   */
  getInfoReservas(): Reserva[] {
    return this.vecReservas;
  }

  /**
   * Obtiene lista de horarios de la agenda
   */
  getInfoHorarios(typeAll: boolean = false): HorarioAgenda[] | string[] {
    return typeAll ? this.listHorariosAll : this.listHorarios;
  }

  /**
   * Obtiene la máxima columna de datos a visualizar
   */
  getMaxColAg(): number {
    const xsof = this.vecConfigAgenda.arrLisTerapeutas.length + this.vecConfigAgenda.col_aux;
    return this.max_col_data + 1 > xsof ? this.max_col_data + 1 : xsof;
  }

  /**
   * Retorna mapa de ocupación en agenda
   */
  getArrMapa(): string[][] {
    return this.arrMapa;
  }

  /**
   * Retorna la fecha seleccionada de la Agenda
   */
  getFechaAg(): string {
    return this.fecha_op;
  }

  // ==================== FUNCIONES UTILITARIAS ====================

  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD
   */
  private getToday(): string {
    const now = new Date();
    return this.formatDate(now.toISOString());
  }

  /**
   * Formatea una fecha a YYYY-MM-DD
   */
  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Acomple cero a la izquierda
   */
  private strNum(num: number): string {
    const numStr = String(num);
    return num <= 9 ? `0${numStr}` : numStr;
  }

  /**
   * Función para ajustar el largo de una cadena
   */
  ajustTex(texto: string, largo: number = 20): string {
    if (texto.length > largo) {
      return texto.substring(0, largo) + '..';
    }
    return texto;
  }

  /**
   * Convierte mes de entero a cadena
   */
  intMesx(mes: string): string {
    const meses: { [key: string]: string } = {
      '01': 'Ene.', '02': 'Feb.', '03': 'Mar.', '04': 'Abr.',
      '05': 'May.', '06': 'Jun.', '07': 'Jul.', '08': 'Ago.',
      '09': 'Sep.', '10': 'Oct.', '11': 'Nov.', '12': 'Dic.'
    };
    return meses[mes] || '';
  }

  // ==================== CÁLCULO DE HORARIOS ====================

  /**
   * Calcula la hora de fin para una cita
   */
  calcHorario(hora_inicio: string, espacios: number, formato: string = 'h:i a'): string {
    if (hora_inicio.length === 5) {
      const [horaStr, minStr] = hora_inicio.split(':');
      let hora = parseInt(horaStr);
      let minuto = parseInt(minStr);

      for (let i = 0; i <= espacios; i++) {
        minuto += this.minutos_incremento;
        if (minuto >= 60) {
          minuto = 0;
          hora++;
        }
      }

      const horaFinal = `${this.strNum(hora)}:${this.strNum(minuto)}`;
      return this.formatHora(horaFinal, formato);
    }
    return '';
  }

  /**
   * Formatea una hora según el formato solicitado
   */
  private formatHora(hora: string, formato: string): string {
    const [h, m] = hora.split(':').map(Number);

    if (formato === 'h:i a') {
      const isPM = h >= 12;
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const period = isPM ? 'pm' : 'am';
      return `${this.strNum(hour12)}:${this.strNum(m)} ${period}`;
    }

    return hora; // militar por defecto
  }

  /**
   * Arroja array con el listado de horarios de acuerdo a la configuración
   */
  readHorariosAgenda(
    hora_inicio: string | number = '',
    hora_fin: string | number = '',
    minutos_incremento: string | number = '',
    sav: boolean = true
  ): string[] | boolean {
    let vecAux: string[] = [];

    if (Object.keys(this.vecConfigAgenda).length > 0) {
      if (hora_inicio === '') hora_inicio = this.vecConfigAgenda.hora_inicio;
      if (hora_fin === '') hora_fin = this.vecConfigAgenda.hora_fin;
      if (minutos_incremento === '') minutos_incremento = this.vecConfigAgenda.minutos_incremento;
    }

    if (sav) {
      this.listHorariosAll = [];
      this.listHorarios = [];
    }

    const hInicio = parseInt(String(hora_inicio));
    const hFin = parseInt(String(hora_fin));
    const mIncremento = parseInt(String(minutos_incremento));

    if (hInicio > 0 && hFin > 0 && hFin > hInicio && mIncremento > 0) {
      let min_aux = 0;
      let hor_aux = hInicio;

      while (hor_aux <= hFin) {
        const hor_text = this.strNum(hor_aux);
        const min_text = this.strNum(min_aux);
        const tit_tex = `${hor_text}:${min_text}`;
        const iniHor = min_text === '00';

        if (sav) {
          this.listHorariosAll.push({
            militar: tit_tex,
            regular: this.formatHora(tit_tex, 'h:i a'),
            mark: iniHor
          });
          this.listHorarios.push(tit_tex);
        } else {
          vecAux.push(tit_tex);
        }

        min_aux += mIncremento;
        if (min_aux >= 60) {
          min_aux = 0;
          hor_aux += 1;
        }
      }
    }

    return sav ? this.listHorarios.length > 0 : vecAux;
  }

  // ==================== MÉTODOS DE BASE DE DATOS ====================

  /**
   * Ejecuta una consulta SQL y retorna los resultados
   */
  private executeQuery(query: string, params: any[] = []): any[] {
    if (!this.db) {
      console.error('Base de datos no inicializada');
      return [];
    }

    try {
      const stmt = this.db.prepare(query);
      stmt.bind(params);

      const results: any[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();

      return results;
    } catch (error) {
      console.error('Error ejecutando query:', error);
      return [];
    }
  }

  /**
   * Ejecuta un comando SQL (INSERT, UPDATE, DELETE)
   */
  private executeCommand(query: string, params: any[] = []): boolean {
    if (!this.db) {
      console.error('Base de datos no inicializada');
      return false;
    }

    try {
      const stmt = this.db.prepare(query);
      stmt.bind(params);
      stmt.step();
      stmt.free();

      this.saveDatabase();
      return true;
    } catch (error) {
      console.error('Error ejecutando comando:', error);
      return false;
    }
  }

  /**
   * Obtiene un array con la información de los terapeutas
   */
  ReadColsTerapeutas(): boolean {
    this.poscColumns = '';
    this.info_cols_terapeutas = [];

    const query = `
      SELECT t1.id, t1.alias, t1.nombrecto as nombre
      FROM tusuarios t1, tpermisos t2, tconfig_gral t3
      WHERE t1.activo = 'Si'
        AND t1.handel = t3.handel
        AND t2.nombre = t3.puesto_servicio
        AND t1.id_permiso = t2.id
        AND t1.handel = t2.handel
        AND t1.handel = ?
      ORDER BY t1.orden ASC, t1.alias ASC
    `;

    const results = this.executeQuery(query, [this.handel]);

    results.forEach((row: any) => {
      this.info_cols_terapeutas.push({
        id: row.id,
        alias: row.alias,
        nombre: row.nombre
      });
      this.poscColumns += row.id + '|';
    });

    return this.info_cols_terapeutas.length > 0;
  }

  /**
   * Obtiene un array con toda la información de un registro de Agenda
   */
  infoRegAgenda(id_agenda: number): InfoRegAgenda {
    this.info_reg_agenda = {};

    const query = `SELECT * FROM tagenda WHERE id = ? AND handel = ?`;
    const results = this.executeQuery(query, [id_agenda, this.handel]);

    if (results.length === 1) {
      this.info_reg_agenda = results[0];
    }

    return this.info_reg_agenda;
  }

  /**
   * Obtiene listado de medios informativos
   */
  ReadMediosInformativos(): boolean {
    this.vecAcumPromo = [];
    this.AcumMedio_promo = '';

    const query = `
      SELECT DISTINCT(medio_promo) as medio_promo
      FROM tclientes
      WHERE handel = ?
      ORDER BY medio_promo
    `;

    const results = this.executeQuery(query, [this.handel]);

    results.forEach((row: any) => {
      if (row.medio_promo && row.medio_promo.trim() !== '') {
        this.vecAcumPromo.push(row.medio_promo);
        this.AcumMedio_promo += this.AcumMedio_promo !== ''
          ? `,"${row.medio_promo}"`
          : `"${row.medio_promo}"`;
      }
    });

    this.AcumMedio_promo = `[${this.AcumMedio_promo}]`;

    return this.vecAcumPromo.length > 0;
  }

  /**
   * Retorna un array con el listado de terapeutas
   */
  private readArrTerapeutas(): void {
    const arrTerapeutas: Terapeuta[] = [];
    const arrLisTerapeutas: number[] = [];
    const arrAliasTerapeutas: string[] = [];
    this.poscColumns = '';

    let query = `
      SELECT
        t1.id,
        t1.alias,
        t1.nombre || ' ' || t1.apaterno AS nombre,
        t1.orden
      FROM
        tusuarios t1
      JOIN
        tpermisos t2 ON t1.id_permiso = t2.id AND t1.handel = t2.handel
      JOIN
        tconfig_gral c2 ON t1.handel = c2.handel
      WHERE
        c2.handel = ?
        AND t1.activo = 'Si'
        AND t2.nombre = c2.puesto_servicio
    `;

    // Si está consultando sobre la agenda para control de asistencia
    if (this.isControlAsistencia) {
      query = `
        SELECT id, alias, nombre
        FROM (
          ${query}
          UNION
          SELECT
            t1.id,
            t1.alias,
            t1.nombre || ' ' || t1.apaterno || '_2' AS nombre,
            100 as orden
          FROM
            tusuarios t1
          JOIN
            tpermisos t2 ON t1.id_permiso = t2.id
          JOIN
            tcontrol_asistencia ca ON t1.id = ca.id_personal
          JOIN
            tconfig_gral c2 ON ca.handel = c2.handel
          WHERE
            ca.handel = ?
            AND t2.nombre = c2.puesto_servicio
            AND ca.fecha_evento BETWEEN ? AND ?
        )
      `;
    }

    query += ' ORDER BY orden ASC, alias ASC';

    const params = this.isControlAsistencia
      ? [this.handel, this.handel, this.fecha1_ctrl_asist, this.fecha2_ctrl_asist]
      : [this.handel];

    const results = this.executeQuery(query, params);

    results.forEach((row: any) => {
      arrTerapeutas.push({
        id: row.id,
        alias: row.alias,
        nombre: row.nombre
      });
      arrLisTerapeutas.push(row.id);
      arrAliasTerapeutas.push(row.alias);
      this.poscColumns += row.id + '|';
    });

    this.vecConfigAgenda.arrTerapeutas = arrTerapeutas;
    this.vecConfigAgenda.num_columnas = arrTerapeutas.length;
    this.vecConfigAgenda.arrLisTerapeutas = arrLisTerapeutas;
    this.vecConfigAgenda.aliasTerapeutas = arrAliasTerapeutas;
  }

  /**
   * Obtiene todos los datos de configuración necesarios para visualizar la agenda
   */
  readConfigAgenda(fecha: string = ''): boolean {
    if (fecha === '') fecha = this.fecha_op;

    this.vecConfigAgenda = {};

    const query = `
      SELECT
        c2.puesto_servicio,
        c2.hora_inicio,
        c2.minutos_incremento,
        c2.hora_fin,
        c2.color_libre,
        c2.color_reservada,
        c2.color_confirmada,
        c2.color_cancelada,
        c2.color_cobrado,
        c2.color_fuera_tiempo,
        c2.most_disponibilidad,
        c2.rangoManual,
        c2.Filas,
        c2.num_columnas,
        c2.appliDescuentos as cantColsFijas,
        c2.rangoHora,
        c2.vizNombreTerapeuta,
        (SELECT c1.horario_sabado || '/' || c1.horario_domingo || '/' ||
                c1.formato_hora || '/' || c1.str_dias
         FROM tconfig_gral_aux1 c1
         WHERE c1.handel = c2.handel LIMIT 1) as config_horario,
        (SELECT col_aux
         FROM tespacios_adicionales
         WHERE handel = c2.handel AND fecha = ? LIMIT 1) as col_aux,
        (SELECT ebc.dias_ctespr || '/' || ebc.nventa_ctespr
         FROM tempresas_base ebc
         WHERE ebc.id = c2.id_empresa_base) as ajust_gral
      FROM tconfig_gral c2
      WHERE c2.handel = ?
    `;

    const results = this.executeQuery(query, [fecha, this.handel]);

    if (results.length === 1) {
      const row = results[0];
      this.vecConfigAgenda = row;

      // Actualiza valor de minutos de incremento
      this.setMinutosIncremento(this.vecConfigAgenda.minutos_incremento);

      // Corrección de algunos valores
      this.vecConfigAgenda.rangoManual = row.rangoManual === 'SI' || row.rangoManual === '1';
      this.vecConfigAgenda.rangoHora = row.rangoHora === 'SI' || row.rangoHora === '1';
      this.vecConfigAgenda.vizNombreTerapeuta = row.vizNombreTerapeuta === 'SI' || row.vizNombreTerapeuta === '1';
      this.vecConfigAgenda.most_disponibilidad = row.most_disponibilidad === 'SI' || row.most_disponibilidad === '1';
      this.vecConfigAgenda.cantColsFijas = parseInt(row.cantColsFijas) || 0;
      this.vecConfigAgenda.col_aux = parseInt(row.col_aux) || 0;

      // Cantidad de columnas fijas
      if (row.Filas) {
        const exTmp = row.Filas.split('|');
        if (exTmp.length > 1) {
          this.vecConfigAgenda.cantColsFijas = exTmp.length;
        }
      }

      // Vector de horarios
      if (row.config_horario) {
        const vaux = row.config_horario.split('/');
        this.vecConfigAgenda.config_horario = {
          horario_sabado: vaux[0],
          horario_domingo: vaux[1],
          formato_hora: vaux[2],
          str_dias: vaux[3]
        };
      }

      // Ajustes de configuración general
      if (row.ajust_gral) {
        const tmpx = row.ajust_gral.split('/');
        if (tmpx.length > 1) {
          this.vecConfigAgenda.dias_ctespr = tmpx[0] || '365';
          this.vecConfigAgenda.nventa_ctespr = tmpx[1] || '-1';
        }
      }

      // Array de terapeutas
      this.readArrTerapeutas();
    }

    // Lee disponibilidad de la fecha en calendario
    this.disponibilidadDias();

    // Lee matriz de horarios en la agenda
    this.readHorariosAgenda(
      this.vecConfigAgenda.disponibilidad.hora_inicio,
      this.vecConfigAgenda.disponibilidad.hora_fin
    );

    return Object.keys(this.vecConfigAgenda).length > 0;
  }

  /**
   * Obtiene un array con todas las citas para un día específico
   */
  readReservas(fecha: string = ''): boolean {
    if (fecha === '') fecha = this.fecha_op;

    this.vecReservas = [];
    this.ids_clientes = [];

    let auxSq = '';

    // Deja fuera un id de Agenda
    if (this.exclude_id_agenda > 0) {
      auxSq += ` AND t1.id != ${this.exclude_id_agenda}`;
    }

    const query = `
      SELECT
        t1.id as id_agenda,
        t2.id as id_cliente,
        t1.id_personal,
        t1.hora,
        t1.hora as hora_ag,
        t1.status,
        t1.espacios_duracion as duracion,
        t1.spacio as columna,
        t1.spacio as columna_ag,
        t1.id_personal as id_personal_ag,
        t2.nombrecto as cliente,
        t2.tel1,
        t2.tel2,
        t2.email1,
        t1.notas,
        t1.notas2,
        t1.notas as notas_ag,
        t1.ban_cita,
        t1.ban_liquid_credito,
        (SELECT u.alias || '/' || u.nombrecto
         FROM tusuarios u
         WHERE u.id = t1.id_personal) as datos_personal,
        (SELECT GROUP_CONCAT(DISTINCT(tprod.codigo))
         FROM tagenda_aux agAux
         JOIN tproductos tprod ON agAux.id_producto_servicio = tprod.id
         WHERE tprod.tipo = 'Servicio' AND agAux.id_agenda = t1.id) as servicios_agenda
      FROM tagenda t1
      JOIN tclientes t2 ON t1.id_cliente = t2.id
      JOIN tagenda_lnk_fecha lnk ON lnk.fecha = ? AND t1.lnk_fecha = lnk.id
      WHERE t1.handel = ? AND t1.spacio >= 0 ${auxSq}
    `;

    const results = this.executeQuery(query, [fecha, this.handel]);

    results.forEach((row: any) => {
      const reserva: Reserva = {
        id_agenda: row.id_agenda,
        id_cliente: row.id_cliente,
        id_personal: row.id_personal,
        hora: row.hora,
        hora_ag: row.hora_ag,
        status: row.status,
        duracion: parseInt(row.duracion) || 1,
        columna: parseInt(row.columna),
        columna_ag: parseInt(row.columna_ag),
        id_personal_ag: row.id_personal_ag,
        cliente: row.cliente,
        tel1: row.tel1,
        tel2: row.tel2,
        email1: row.email1,
        notas: row.notas,
        notas2: row.notas2,
        notas_ag: row.notas_ag,
        ban_cita: row.ban_cita,
        ban_liquid_credito: row.ban_liquid_credito,
        servicios_agenda: row.servicios_agenda,
        seteado: false,
        alias_personal: '',
        nombre_personal: ''
      };

      // Agrega saldo de línea en agendada via App
      if (reserva.notas2 !== 'Agendada via App.') {
        reserva.notas2 = reserva.notas2.replace(
          /Agendada via App\./g,
          'Agendada via App.<br>'
        );
      }

      // Datos del personal
      if (row.datos_personal) {
        const aPers = row.datos_personal.split('/');
        reserva.alias_personal = aPers[0];
        reserva.nombre_personal = aPers[1];
      }

      // Corrección espacios de duración
      if (reserva.duracion === 0) reserva.duracion = 1;

      this.vecReservas.push(reserva);
      this.ids_clientes.push(reserva.id_cliente);
    });

    return this.vecReservas.length > 0;
  }

  /**
   * Corrige parámetros de agenda (columnas y horarios faltantes)
   */
  private correcParamAg(
    arrTerapeutas: number[],
    arrCitas: Reserva[],
    validHora: boolean = true
  ): void {
    const modif = { id_personal_ag: false, hora: false };

    arrCitas.forEach((cita, key) => {
      // Identificar columna faltante
      if (
        !arrTerapeutas.includes(Number(cita.id_personal_ag)) &&
        cita.id_personal_ag !== '-1'
      ) {
        arrCitas[key].id_personal_ag = '';
        modif.id_personal_ag = true;
      }

      // Identificar horario faltante
      if (!this.listHorarios.includes(cita.hora)) {
        if (validHora) {
          // Agrega horario faltante directamente
          arrCitas[key].duracion = 1;
          this.listHorarios.push(cita.hora);
          modif.hora = true;
        } else {
          // Intenta encontrar el horario más próximo
          const horaDate = new Date(`2000-01-01 ${cita.hora}`);
          let min = horaDate.getMinutes();
          let pros = true;

          while (pros) {
            const hour = horaDate.getHours();
            const tm = `${this.strNum(hour)}:${this.strNum(min)}`;

            if (this.IdentificaFila(tm) === -1) {
              min--;
            } else {
              pros = false;
            }

            if (min < 0) pros = false;
          }

          const hour = horaDate.getHours();
          const tm = `${this.strNum(hour)}:${this.strNum(min)}`;

          if (this.listHorarios.includes(tm)) {
            const aclaracion = ` Cita ${this.formatHora(cita.hora, 'h:i a')} a ${this.calcHorario(cita.hora, arrCitas[key].duracion)}`;
            arrCitas[key].hora_ag = tm;
            arrCitas[key].notas_ag += arrCitas[key].notas_ag !== '' ? ', ' + aclaracion : aclaracion;
            arrCitas[key].duracion = 1;
          }
        }
      }
    });

    // Reorganiza horarios
    if (modif.hora) {
      const tm1: number[] = [];
      const tm2: string[] = [];
      const tm3: HorarioAgenda[] = [];

      // Convierte a timestamp
      this.listHorarios.forEach(value => {
        const [h, m] = value.split(':').map(Number);
        tm1.push(h * 60 + m);
      });

      // Ordena ascendentemente
      tm1.sort((a, b) => a - b);

      // Convierte de vuelta a formato de hora
      tm1.forEach(minutes => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        const horaStr = `${this.strNum(h)}:${this.strNum(m)}`;

        tm2.push(horaStr);
        tm3.push({
          militar: horaStr,
          regular: this.formatHora(horaStr, 'h:i a'),
          mark: m === 0
        });
      });

      this.listHorarios = tm2;
      this.listHorariosAll = tm3;
    }
  }

  /**
   * Retorna el número de columna que ocupa el empleado
   */
  IdentificaColumna(id_personal_ag: number | string, columna_directa: number = -1): number {
    let retu = -1;

    if (this.vecConfigAgenda.vizNombreTerapeuta) {
      this.vecConfigAgenda.arrLisTerapeutas.forEach((value: number, key: number) => {
        if (value === Number(id_personal_ag)) {
          retu = key;
        }
      });
    } else {
      retu = columna_directa;
    }

    return retu;
  }

  /**
   * Retorna el número de fila a la que corresponde el horario
   */
  IdentificaFila(hora_ag: string): number {
    let retu = -1;

    this.listHorarios.forEach((value, key) => {
      if (value === hora_ag) {
        retu = key;
      }
    });

    return retu;
  }

  /**
   * Agrega o actualiza la cantidad de columnas auxiliares
   */
  ActualizaColsAux(n_col_aux: number = 0, fecha: string = ''): boolean {
    fecha = fecha !== '' ? fecha : this.fecha_op;

    // Valida cantidad de columnas
    if (n_col_aux < 0) return false;

    const query = `
      INSERT INTO tespacios_adicionales (handel, fecha, col_aux)
      VALUES (?, ?, ?)
      ON CONFLICT(handel, fecha) DO UPDATE SET col_aux = excluded.col_aux
    `;

    const success = this.executeCommand(query, [this.handel, fecha, n_col_aux]);

    if (success && this.vecConfigAgenda.col_aux !== undefined) {
      this.vecConfigAgenda.col_aux = n_col_aux;
    }

    return success;
  }

  /**
   * Lee cantidad de columnas auxiliares para un día específico
   */
  private readColsAux(fecha: string): number {
    const query = `SELECT col_aux FROM tespacios_adicionales WHERE fecha = ? AND handel = ?`;
    const results = this.executeQuery(query, [fecha, this.handel]);

    if (results.length === 1) {
      return parseInt(results[0].col_aux) || 0;
    }

    return 0;
  }

  /**
   * Añade cantidad de columnas adicionales
   */
  addColAux(fecha: string): boolean {
    const col_aux = this.vecConfigAgenda.col_aux !== undefined
      ? this.vecConfigAgenda.col_aux
      : this.readColsAux(fecha);

    // Valida que no exceda el número permitido
    if (col_aux + 1 > this.max_col_aux) return false;

    return this.ActualizaColsAux(col_aux + 1, fecha);
  }

  /**
   * Quita cantidad de columnas adicionales
   */
  subColAux(fecha: string): boolean {
    const col_aux = this.vecConfigAgenda.col_aux !== undefined
      ? this.vecConfigAgenda.col_aux
      : this.readColsAux(fecha);

    // Valida que no sea menor a 0
    if (col_aux - 1 < 0) return false;

    return this.ActualizaColsAux(col_aux - 1, fecha);
  }

  /**
   * Retorna + si es una fecha actual y - si es pasada
   */
  private cron(fecha: string = ''): string {
    if (fecha === '') fecha = this.fecha_op;

    const fecha1 = new Date();
    const fecha2 = new Date(fecha);

    return fecha1 <= fecha2 ? '+' : '-';
  }

  /**
   * Expresa en formato de hora adecuado según configuración
   */
  horaMilitAm(strHora: string): string {
    let retu = strHora;

    if (
      this.vecConfigAgenda.config_horario &&
      this.vecConfigAgenda.config_horario.formato_hora === 'regular'
    ) {
      retu = this.formatHora(strHora, 'h:i a');
    }

    return retu;
  }

  /**
   * Retorna array con disponibilidad de días
   */
  disponibilidadDias(fecha: string = ''): any {
    if (fecha === '') fecha = this.fecha_op;

    let dia_habil = true;
    let disponibilidad = {
      hora_inicio: 9,
      hora_fin: 10,
      dia_habil: dia_habil
    };

    const dia_actua = new Date(fecha).getDay();

    if (Object.keys(this.vecConfigAgenda).length > 0) {
      let hora_inicio = this.vecConfigAgenda.hora_inicio;
      let hora_fin = this.vecConfigAgenda.hora_fin;

      // Verifica disponibilidad de días
      if (this.vecConfigAgenda.config_horario) {
        const str_dias = this.vecConfigAgenda.config_horario.str_dias;
        const horario_domingo = this.vecConfigAgenda.config_horario.horario_domingo;
        const horario_sabado = this.vecConfigAgenda.config_horario.horario_sabado;

        // De lunes a viernes
        const diasHabiles = str_dias.split('-').map(Number);
        dia_habil = diasHabiles.includes(dia_actua);

        switch (dia_actua) {
          case 0: // Domingo
            if (horario_domingo !== '') {
              const vecTm = horario_domingo.split('-');
              if (vecTm.length === 2) {
                hora_inicio = parseInt(vecTm[0]);
                hora_fin = parseInt(vecTm[1]);
              }
              dia_habil = true;
            } else {
              dia_habil = false;
            }
            break;

          case 6: // Sábado
            if (horario_sabado !== '') {
              const vecTm = horario_sabado.split('-');
              if (vecTm.length === 2) {
                hora_inicio = parseInt(vecTm[0]);
                hora_fin = parseInt(vecTm[1]);
              }
              dia_habil = true;
            } else {
              dia_habil = false;
            }
            break;
        }
      }

      disponibilidad = {
        hora_inicio: hora_inicio,
        hora_fin: hora_fin,
        dia_habil: dia_habil
      };

      this.vecConfigAgenda.disponibilidad = disponibilidad;
    }

    return disponibilidad;
  }

  /**
   * Verifica si una cita es asignable en una posición específica
   */
  private IsCitaAsignable(
    arrMapa: string[][],
    arrCitas: Reserva[],
    indexArrCitas: number,
    col_direct: number = -1
  ): PosicionMapa[] {
    let columna: number;

    if (col_direct === -1 && arrCitas[indexArrCitas].id_personal_ag === '') {
      columna = arrCitas[indexArrCitas].columna >= this.vecConfigAgenda.arrLisTerapeutas.length
        ? arrCitas[indexArrCitas].columna
        : -1;
    } else {
      columna = col_direct === -1
        ? this.IdentificaColumna(
            arrCitas[indexArrCitas].id_personal_ag,
            arrCitas[indexArrCitas].columna_ag
          )
        : col_direct;
    }

    let asignable = false;
    const arrPosMark: PosicionMapa[] = [];
    const fila = this.IdentificaFila(arrCitas[indexArrCitas].hora_ag);

    if (columna >= 0 && fila >= 0) {
      asignable = true;

      for (let y = fila; y <= fila + arrCitas[indexArrCitas].duracion - 1; y++) {
        if (arrMapa[columna] && arrMapa[columna][y] !== undefined) {
          if (arrMapa[columna][y] !== '') {
            asignable = false;
          } else {
            arrPosMark.push({ fila: y, columna: columna });
          }
        }
      }
    }

    return asignable ? arrPosMark : [];
  }

  /**
   * Marca en el mapa una reservación
   */
  private MarkCita(
    arrMapa: string[][],
    arrCitas: Reserva[],
    indexArrCitas: number,
    arrPosMark: PosicionMapa[] = []
  ): boolean {
    let n_seted = 0;

    if (arrPosMark.length > 0) {
      arrPosMark.forEach((valores, indice) => {
        if (
          arrMapa[valores.columna] &&
          arrMapa[valores.columna][valores.fila] !== undefined &&
          arrMapa[valores.columna][valores.fila] === ''
        ) {
          arrMapa[valores.columna][valores.fila] = indice === 0
            ? String(arrCitas[indexArrCitas].id_agenda)
            : 'X';
          arrCitas[indexArrCitas].seteado = true;
          arrCitas[indexArrCitas].columna_ag = valores.columna;

          if (valores.columna > this.max_col_data) {
            this.max_col_data = valores.columna;
          }

          n_seted++;
        }
      });
    }

    return arrPosMark.length === n_seted;
  }

  /**
   * Busca una posición válida en columna auxiliar
   */
  private searchSetAux(
    arrMapa: string[][],
    arrCitas: Reserva[],
    indexArrCitas: number
  ): PosicionMapa[] {
    let arrPosMark: PosicionMapa[] = [];
    let columna = this.vecConfigAgenda.arrLisTerapeutas.length;
    const fila = this.IdentificaFila(arrCitas[indexArrCitas].hora_ag);
    let encontrado = false;

    if (fila >= 0) {
      while (!encontrado) {
        arrPosMark = this.IsCitaAsignable(arrMapa, arrCitas, indexArrCitas, columna);

        if (
          arrPosMark.length > 0 &&
          arrMapa[columna] &&
          arrMapa[columna][fila] !== undefined
        ) {
          encontrado = true;
        }

        columna++;
      }
    }

    return arrPosMark;
  }

  /**
   * Calcula la diferencia entre un horario y la hora de inicio
   */
  private calc_dif_horario(hora_ini: string): number {
    const horaIniNum = parseInt(hora_ini.split(':')[0]);

    // Genera horarios desde el inicio de la cita hasta la primera hora de la agenda
    const listHorarios_tmp = this.readHorariosAgenda(
      horaIniNum,
      this.vecConfigAgenda.disponibilidad.hora_inicio,
      '',
      false
    ) as string[];

    let encontrado = false;
    let cont_spac = 0;

    listHorarios_tmp.forEach(value => {
      if (value === hora_ini) encontrado = true;
      if (encontrado && value === `${this.strNum(this.vecConfigAgenda.disponibilidad.hora_inicio)}:00`) {
        encontrado = false;
      }
      if (encontrado) cont_spac++;
    });

    return cont_spac;
  }

  /**
   * Marca bloqueos en el mapa
   */
  private setMarkBlok(
    arrMapa: string[][],
    arrCitas: Reserva[],
    indexArrCitas: number,
    col_direct: number = -1
  ): boolean {
    let is_mapeado = false;

    if (arrCitas[indexArrCitas].id_personal_ag !== '') {
      let duracion_cita = arrCitas[indexArrCitas].duracion;
      const columna = col_direct === -1
        ? this.IdentificaColumna(arrCitas[indexArrCitas].id_personal_ag)
        : col_direct;

      let fila: number;

      // Verifica si el bloqueo empezó en un horario anterior
      const horaAg = parseInt(arrCitas[indexArrCitas].hora_ag.split(':')[0]);
      if (horaAg < this.vecConfigAgenda.disponibilidad.hora_inicio) {
        const dif = this.calc_dif_horario(arrCitas[indexArrCitas].hora_ag);
        if (dif < duracion_cita) duracion_cita -= dif;
        fila = duracion_cita > 0 ? 0 : -1;
      } else {
        fila = this.IdentificaFila(arrCitas[indexArrCitas].hora_ag);
      }

      if (columna >= 0 && fila >= 0) {
        for (let y = fila; y <= fila + duracion_cita - 1; y++) {
          if (
            arrMapa[columna] &&
            arrMapa[columna][y] !== undefined &&
            arrMapa[columna][y] === ''
          ) {
            arrMapa[columna][y] = String(arrCitas[indexArrCitas].id_agenda);
            arrCitas[indexArrCitas].seteado = true;
            arrCitas[indexArrCitas].columna_ag = columna;
            is_mapeado = true;
          }
        }
      }
    }

    return is_mapeado;
  }

  /**
   * Ajusta columna correcta en base a ID de empleado
   */
  private ajustColumna(
    arrMapa: string[][],
    arrCitas: Reserva[],
    indexArrCitas: number,
    col_direct: number = -1
  ): void {
    const columna = col_direct === -1
      ? this.IdentificaColumna(arrCitas[indexArrCitas].id_personal_ag)
      : col_direct;

    if (columna >= 0) {
      arrCitas[indexArrCitas].columna_ag = columna;
    }
  }

  /**
   * Verifica si es necesario repetir una reserva para todas las columnas
   */
  private caseAllColsAparty(): Reserva[] {
    const colTot = this.readNCols();
    const arr_finaly: Reserva[] = [];

    this.arrCitas_simuladas.forEach(subarreglo => {
      if (subarreglo.columna === 'all' || subarreglo.columna === -1) {
        for (let columna = 0; columna < colTot; columna++) {
          const copia = { ...subarreglo };
          copia.columna = columna;
          copia.columna_ag = columna;
          arr_finaly.push(copia);
        }
      } else {
        arr_finaly.push(subarreglo);
      }
    });

    return arr_finaly;
  }

  /**
   * Genera un mapa de ocupaciones
   */
  MapaAgenda(updateData: boolean = true): Reserva[] {
    const idsSim: string[] = [];

    // Obtiene configuración general de agenda
    if (!this.readConfigAgenda()) {
      console.error('Agenda no inicializada');
      return [];
    }

    const conf = this.getInfoConfigAgenda();
    const arrTerapeutas = conf.arrLisTerapeutas;

    // Lee todas las reservaciones
    this.readReservas();
    let arrCitas = this.getInfoReservas();

    // Agrega citas simuladas
    if (this.arrCitas_simuladas.length > 0) {
      arrCitas = [...arrCitas, ...this.caseAllColsAparty()];

      this.arrCitas_simuladas.forEach(tpy => {
        if (!idsSim.includes(String(tpy.id_agenda))) {
          idsSim.push(String(tpy.id_agenda));
        }
      });
    }

    // Corrección de datos
    this.correcParamAg(arrTerapeutas, arrCitas, this.validHora);

    // Array de horarios
    const arrHorarios = this.getInfoHorarios() as string[];

    // Inicializa mapa de datos
    for (let columna = 0; columna <= arrTerapeutas.length + this.ColTest; columna++) {
      this.arrMapa[columna] = [];
      for (let y = 0; y <= arrHorarios.length; y++) {
        this.arrMapa[columna][y] = '';
      }
    }

    // 1) MAPEAR CITAS CON STATUS 'Reservado, Confirmado, Cobrado'
    arrCitas.forEach((dat, indexArrCitas) => {
      if (
        (dat.status === 'Cobrado' || dat.status === 'Confirmado' || dat.status === 'Reservado') &&
        !dat.seteado &&
        ((conf.vizNombreTerapeuta && dat.id_personal_ag !== '') || !conf.vizNombreTerapeuta)
      ) {
        this.MarkCita(
          this.arrMapa,
          arrCitas,
          indexArrCitas,
          this.IsCitaAsignable(
            this.arrMapa,
            arrCitas,
            indexArrCitas,
            conf.vizNombreTerapeuta ? -1 : dat.columna_ag
          )
        );
      }
    });

    // 2) MAPEAR CITAS EN COLUMNAS AUXILIARES
    arrCitas.forEach((dat, indexArrCitas) => {
      if (
        (dat.status === 'Cobrado' || dat.status === 'Confirmado' || dat.status === 'Reservado') &&
        !dat.seteado
      ) {
        this.MarkCita(
          this.arrMapa,
          arrCitas,
          indexArrCitas,
          this.searchSetAux(this.arrMapa, arrCitas, indexArrCitas)
        );
      }
    });

    // 3) MAPEAR ESPACIOS BLOQUEADOS
    arrCitas.forEach((dat, indexArrCitas) => {
      if (dat.status === 'FueraTiempo' && !dat.seteado) {
        const tomaColumna = idsSim.includes(String(dat.id_agenda)) || !conf.vizNombreTerapeuta
          ? dat.columna_ag
          : -1;

        const isMap = this.setMarkBlok(this.arrMapa, arrCitas, indexArrCitas, tomaColumna);

        if (isMap) {
          this.idsFueraTiempo.push(dat.id_agenda);
        } else {
          arrCitas.splice(indexArrCitas, 1);
        }
      }
    });

    // 4) CORRECCIÓN DE POSICIÓN DE RESERVAS CANCELADAS
    if (conf.vizNombreTerapeuta) {
      arrCitas.forEach((dat, indexArrCitas) => {
        if (dat.status === 'Cancelado') {
          this.ajustColumna(this.arrMapa, arrCitas, indexArrCitas);
        }
      });
    }

    // 5) BLOQUEA TODOS LOS ESPACIOS DISPONIBLES DE DÍA INHÁBIL
    if (!this.vecConfigAgenda.disponibilidad.dia_habil) {
      for (let columna = 0; columna <= arrTerapeutas.length + this.ColTest; columna++) {
        for (let y = 0; y <= arrHorarios.length; y++) {
          if (this.arrMapa[columna][y] === '') {
            this.arrMapa[columna][y] = 'i';
          }
        }
      }
    }

    // 6) SOLO DEJA COLUMNAS DISPONIBLES POR CONFIGURACIÓN
    if (this.dispony_cols.length > 0 && this.is_filas()) {
      for (let columna = 0; columna <= arrTerapeutas.length + this.ColTest; columna++) {
        if (!this.dispony_cols.includes(String(columna))) {
          for (let y = 0; y <= arrHorarios.length; y++) {
            if (this.arrMapa[columna][y] === '') {
              this.arrMapa[columna][y] = 'd';
            }
          }
        }
      }
    }

    // ACTUALIZA DATOS EN LA AGENDA (solo si es fecha futura)
    if (this.cron() === '+' && updateData) {
      // Columnas auxiliares
      const tmp = this.getMaxColAg() - conf.arrLisTerapeutas.length;
      if (conf.col_aux !== tmp) {
        this.ActualizaColsAux(tmp);
      }

      // Columnas de citas
      arrCitas.forEach(dat => {
        let mod = '';

        // Verifica cambio en columna
        if (dat.columna !== dat.columna_ag && dat.columna_ag >= 0) {
          const quer = `spacio = ${dat.columna_ag}`;
          mod += mod !== '' ? ',' + quer : quer;
        }

        // Verifica cambio en comentarios
        if (dat.notas !== dat.notas_ag) {
          const notasClean = dat.notas_ag.replace(/['"]/g, '');
          const quer = `notas = '${notasClean}'`;
          mod += mod !== '' ? ',' + quer : quer;
        }

        // Verifica cambio en hora
        if (dat.hora !== dat.hora_ag) {
          const quer = `hora = '${dat.hora_ag}'`;
          mod += mod !== '' ? ',' + quer : quer;
        }

        // Solo si existen datos nuevos procede actualizar
        if (mod !== '' && dat.status !== 'Cancelado') {
          this.UpDatAgenda(dat.id_agenda, mod);
        }
      });
    }

    return arrCitas;
  }

  /**
   * Actualiza un dato en la agenda
   */
  private UpDatAgenda(id_agenda: number, aux_query: string): boolean {
    if (aux_query === '') return false;

    const query = `UPDATE tagenda SET ${aux_query} WHERE handel = ? AND id = ?`;
    return this.executeCommand(query, [this.handel, id_agenda]);
  }

  /**
   * Determina si existe configuración para columnas fijas
   */
  private is_filas(): boolean {
    return !this.vecConfigAgenda.vizNombreTerapeuta && this.vecConfigAgenda.Filas && this.vecConfigAgenda.Filas.length > 3;
  }

  /**
   * Obtiene el número máximo de columnas
   */
  readNCols(ban_acept_cols_auxiliares: boolean = false): number {
    let colTot: number;

    if (!this.vecConfigAgenda.vizNombreTerapeuta && this.vecConfigAgenda.Filas && this.vecConfigAgenda.Filas.length > 3) {
      const exTmp = this.vecConfigAgenda.Filas.split('|');
      colTot = exTmp.length;
    } else {
      colTot = this.vecConfigAgenda.arrLisTerapeutas.length +
        (ban_acept_cols_auxiliares ? this.vecConfigAgenda.col_aux : 0);
    }

    return colTot;
  }

  /**
   * Calcula los espacios requeridos para una lista de servicios
   */
  CalcEspaciosListServicios(ids_servicios: string = '', defult: number = 0): number {
    let nEspacios = defult;
    let vecInd = '';
    let nItem = 0;
    let correg = 0;
    this.listCodeCtos = [];

    if (ids_servicios !== '') {
      vecInd = ids_servicios.replace(/[^0-9,]/g, '').replace(/\|/g, ',').replace(/\|$/, '');
      this.ids_servicios_calc = vecInd;
    }

    if (vecInd !== '') {
      nEspacios = 0;

      const query = `SELECT n_duracion, codigo FROM tproductos WHERE handel = ? AND id IN (${vecInd})`;
      const results = this.executeQuery(query, [this.handel]);

      results.forEach((row: any) => {
        this.listCodeCtos.push(row.codigo);
        let duracion = parseInt(row.n_duracion);

        if (duracion === 1 && this.minutos_incremento === 10) {
          if (nItem >= 1 && correg % 3 !== 0) {
            duracion = 0;
          }
          correg++;
        }

        nEspacios += duracion;
        nItem++;
      });
    }

    return nEspacios <= 0 ? 1 : nEspacios;
  }

  /**
   * Retorna la primera hora reservable
   */
  hora_inicio_reservas(ban_valida_horario_fecha_actual: boolean = true): string {
    const margen = Math.max(0, this.reservar_con_antelacion);
    const inc = Math.max(5, this.minutos_incremento);

    const horaInicioConf = this.vecConfigAgenda.disponibilidad.hora_inicio;
    const horaFinConf = this.vecConfigAgenda.disponibilidad.hora_fin;

    let h = horaInicioConf;
    let m = 0;

    if (ban_valida_horario_fecha_actual) {
      const ahora = new Date();
      const esHoy = this.fecha_op === this.formatDate(ahora.toISOString());

      if (esHoy) {
        // Candidato A: hora de inicio configurada
        const candA_h = horaInicioConf;
        const candA_m = 0;

        // Candidato B: (ahora + margen) alineado al siguiente slot
        const t = new Date(ahora.getTime() + margen * 60000);
        let hB = t.getHours();
        let mB = t.getMinutes();
        let slot = Math.ceil(mB / inc) * inc;

        if (slot >= 60) {
          hB += Math.floor(slot / 60);
          slot = slot % 60;
        }

        const candB_h = hB;
        const candB_m = slot;

        // Tomar el máximo entre candA y candB
        if (candB_h > candA_h || (candB_h === candA_h && candB_m > candA_m)) {
          h = candB_h;
          m = candB_m;
        } else {
          h = candA_h;
          m = candA_m;
        }
      }
    }

    // Límite superior
    if (horaFinConf !== null && h > horaFinConf) {
      return '';
    }

    // Normaliza límites del día
    if (h >= 24) {
      return '';
    }

    return `${this.strNum(h)}:${this.strNum(m)}`;
  }

  /**
   * Regresa true si una cita se puede asignar en un espacio
   */
  isDisponible(fila_inicial: number = -1, columna: number = -1, espacios: number = 1): boolean {
    let asignable = false;
    const arrHorarios = this.getInfoHorarios() as string[];

    if (
      columna >= 0 &&
      fila_inicial >= 0 &&
      fila_inicial + espacios - 1 < arrHorarios.length
    ) {
      asignable = true;

      for (let y = fila_inicial; y <= fila_inicial + espacios - 1; y++) {
        if (this.arrMapa[columna] && this.arrMapa[columna][y] !== '') {
          asignable = false;
        }
      }
    }

    return asignable;
  }

  /**
   * Compara si una hora está en un rango de horario específico
   */
  isTimeInRange(time: string, startTime: string, endTime: string): boolean {
    // Detecta horario sin servicio
    if (startTime === '-' || endTime === '-') {
      return false;
    }

    const [th, tm] = time.split(':').map(Number);
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);

    const timeMinutes = th * 60 + tm;
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  }

  /**
   * Retorna ID de empleado a partir de la posición de la columna
   */
  ColIdUser(columna: number): number {
    if (
      this.vecConfigAgenda.vizNombreTerapeuta &&
      this.vecConfigAgenda.arrLisTerapeutas[columna] !== undefined
    ) {
      return this.vecConfigAgenda.arrLisTerapeutas[columna];
    }

    return columna;
  }

  /**
   * Solo deja disponibles ciertos horarios para cierta lista de servicios
   */
  isDispColsHrs(colSel: number, ArrHorary: string): boolean {
    let disponibl = true;

    if (Object.keys(this.arrColsDisp).length > 0) {
      const ky = `col_${this.ColIdUser(colSel)}`;

      if (this.arrColsDisp[ky]) {
        const pr1 = this.arrColsDisp[ky].horarios || [];
        if (pr1.length > 0) disponibl = false;

        pr1.forEach(vArr => {
          // Verifica disponibilidad de alguno de los horarios configurados
          if (this.isTimeInRange(ArrHorary, vArr.inicio, vArr.fin)) {
            if (vArr.servicios && this.listCodeCtos.length > 0) {
              // Verifica si los servicios a reservar coinciden
              const interseccion = this.listCodeCtos.filter(code =>
                vArr.servicios?.includes(code)
              );

              if (interseccion.length > 0) {
                disponibl = true;
              }
            } else {
              disponibl = true;
            }
          }
        });
      }
    }

    return disponibl;
  }

  // ==================== EXPORTAR/IMPORTAR BASE DE DATOS ====================

  /**
   * Exporta la base de datos como archivo
   */
  exportDatabase(): Blob | null {
    if (!this.db) return null;

    const data = this.db.export();
    return new Blob([data], { type: 'application/x-sqlite3' });
  }

  /**
   * Importa una base de datos desde un archivo
   */
  async importDatabase(file: File): Promise<boolean> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      if (this.SQL) {
        this.db = new this.SQL.Database(uint8Array);
        this.saveDatabase();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error importando base de datos:', error);
      return false;
    }
  }

  /**
   * Limpia completamente la base de datos
   */
  clearDatabase(): void {
    localStorage.removeItem('agendaDB');
    this.initDatabase();
  }
}
