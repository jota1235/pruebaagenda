import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { StorageService } from './storage.service';
import { Capacitor } from '@capacitor/core';
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
} from '../interfaces/agenda.interfaces';

/**
 * Servicio de Agenda para Ionic + Angular + Capacitor SQLite
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

  public handel: number = 1;  // Debe coincidir con el valor en seed-data.service.ts
  public id_empresa_base: number = 1;  // Debe coincidir con el valor en seed-data.service.ts
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

  // Almacenamiento en memoria para citas mock en web
  private mockAppointments: Reserva[] = [];
  private nextMockId: number = 1;
  private readonly STORAGE_KEY_APPOINTMENTS = 'mock_appointments';
  private readonly STORAGE_KEY_NEXT_ID = 'mock_next_id';

  // ==================== CONSTRUCTOR ====================

  constructor(
    private dbService: DatabaseService,
    private storage: StorageService
  ) {
    // Cargar citas desde localStorage al inicializar
    this.loadMockAppointmentsFromStorage();
  }

  // ==================== INICIALIZACIÓN ====================

  /**
   * Inicializa la base de datos SQLite con Capacitor
   * Nota: La inicialización real se hace en DatabaseService
   */
  async initDatabase(): Promise<void> {
    // La base de datos se inicializa en DatabaseService
    // Este método se mantiene por compatibilidad
    console.log('AgendaService listo');
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
    // Si ya viene en formato YYYY-MM-DD, usarlo directamente
    // Esto evita problemas de zona horaria al parsear la fecha
    if (/^\d{4}-\d{2}-\d{2}$/.test(newFecha)) {
      this.fecha_op = newFecha;
    } else {
      this.fecha_op = this.formatDate(newFecha);
    }
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
  private async executeQuery(query: string, params: any[] = []): Promise<any[]> {
    try {
      return await this.dbService.executeQuery(query, params);
    } catch (error) {
      console.error('Error ejecutando query:', error);
      return [];
    }
  }

  /**
   * Ejecuta un comando SQL (INSERT, UPDATE, DELETE)
   */
  private async executeCommand(query: string, params: any[] = []): Promise<boolean> {
    try {
      return await this.dbService.executeCommand(query, params);
    } catch (error) {
      console.error('Error ejecutando comando:', error);
      return false;
    }
  }

  /**
   * Obtiene un array con la información de los terapeutas
   */
  async ReadColsTerapeutas(): Promise<boolean> {
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

    const results = await this.executeQuery(query, [this.handel]);

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
  async infoRegAgenda(id_agenda: number): Promise<InfoRegAgenda> {
    this.info_reg_agenda = {};

    const query = `SELECT * FROM tagenda WHERE id = ? AND handel = ?`;
    const results = await this.executeQuery(query, [id_agenda, this.handel]);

    if (results.length === 1) {
      this.info_reg_agenda = results[0];
    }

    return this.info_reg_agenda;
  }

  /**
   * Obtiene listado de medios informativos
   */
  async ReadMediosInformativos(): Promise<boolean> {
    this.vecAcumPromo = [];
    this.AcumMedio_promo = '';

    const query = `
      SELECT DISTINCT(medio_promo) as medio_promo
      FROM tclientes
      WHERE handel = ?
      ORDER BY medio_promo
    `;

    const results = await this.executeQuery(query, [this.handel]);

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
  private async readArrTerapeutas(): Promise<void> {
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

    const results = await this.executeQuery(query, params);

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
   * MODIFICADO: Ahora usa localStorage en lugar de SQLite
   */
  async readConfigAgenda(fecha: string = ''): Promise<boolean> {
    if (fecha === '') fecha = this.fecha_op;

    this.vecConfigAgenda = {};

    console.log('📋 readConfigAgenda() usando localStorage');

    // Intentar leer configuración desde localStorage
    const configGuardada = this.storage.get<any>('config_agenda', null);

    if (configGuardada) {
      // Usar configuración guardada
      this.vecConfigAgenda = configGuardada;
      console.log('✅ Configuración cargada desde localStorage');
    } else {
      // Usar configuración por defecto
      console.log('📦 Usando configuración por defecto');
      this.vecConfigAgenda = {
        puesto_servicio: 'Terapeuta',
        hora_inicio: 9,
        minutos_incremento: 30,
        hora_fin: 20,
        color_libre: '#90EE90',
        color_reservada: '#FFD700',
        color_confirmada: '#87CEEB',
        color_cancelada: '#FF6B6B',
        color_cobrado: '#98FB98',
        color_fuera_tiempo: '#D3D3D3',
        most_disponibilidad: true,
        rangoManual: false,
        rangoHora: true,
        vizNombreTerapeuta: true,
        Filas: '',
        num_columnas: 4,
        cantColsFijas: 0,
        col_aux: 0,
        config_horario: {
          horario_sabado: '09:00-18:00',
          horario_domingo: '10:00-15:00',
          formato_hora: '12',
          str_dias: 'L,M,Mi,J,V,S,D'
        },
        dias_ctespr: '365',
        nventa_ctespr: '-1',
        arrTerapeutas: [
          { id: 1, alias: 'DR', nombre: 'Dr. Rodríguez' },
          { id: 2, alias: 'DF', nombre: 'Dra. Fernández' },
          { id: 3, alias: 'LG', nombre: 'Lic. González' },
          { id: 4, alias: 'LT', nombre: 'Lic. Torres' }
        ],
        arrLisTerapeutas: [1, 2, 3, 4],
        aliasTerapeutas: ['DR', 'DF', 'LG', 'LT'],
        disponibilidad: {
          hora_inicio: 9,
          hora_fin: 20,
          dia_habil: true
        }
      };

      // Guardar configuración por defecto para futuros usos
      this.storage.set('config_agenda', this.vecConfigAgenda);
    }

    this.setMinutosIncremento(this.vecConfigAgenda.minutos_incremento);
    this.poscColumns = '1|2|3|4|';

    // Lee matriz de horarios en la agenda
    this.readHorariosAgenda(
      this.vecConfigAgenda.disponibilidad.hora_inicio,
      this.vecConfigAgenda.disponibilidad.hora_fin
    );

    return true;

    /* CÓDIGO SQLite COMENTADO - Mantener para futura depuración
    const platform = Capacitor.getPlatform();

    // En móvil, usar SQLite real
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

    const results = await this.executeQuery(query, [fecha, this.handel]);

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
      await this.readArrTerapeutas();
    }
    */

    // Lee disponibilidad de la fecha en calendario
    this.disponibilidadDias();

    // Validar que disponibilidad esté inicializada
    if (!this.vecConfigAgenda.disponibilidad) {
      console.error('⚠️ disponibilidad no inicializada, usando valores por defecto');
      this.vecConfigAgenda.disponibilidad = {
        hora_inicio: 9,
        hora_fin: 20,
        dia_habil: true
      };
    }

    // Lee matriz de horarios en la agenda
    this.readHorariosAgenda(
      this.vecConfigAgenda.disponibilidad.hora_inicio,
      this.vecConfigAgenda.disponibilidad.hora_fin
    );

    return Object.keys(this.vecConfigAgenda).length > 0;
  }

  /**
   * Obtiene un array con todas las citas para un día específico
   * MODIFICADO: Ahora usa localStorage en lugar de SQLite
   */
  async readReservas(fecha: string = ''): Promise<boolean> {
    if (fecha === '') fecha = this.fecha_op;

    this.vecReservas = [];
    this.ids_clientes = [];

    console.log('📋 readReservas() usando localStorage para fecha:', fecha);

    // Filtrar citas mock por fecha (this.mockAppointments se carga desde localStorage)
    this.vecReservas = this.mockAppointments.filter(apt => {
      return (apt.fecha || '') === fecha;
    });

    // Extraer ids de clientes
    this.ids_clientes = this.vecReservas.map(r => r.id_cliente);

    console.log(`✅ ${this.vecReservas.length} citas encontradas para ${fecha}`);

    return this.vecReservas.length > 0;

    /* CÓDIGO SQLite COMENTADO - Mantener para futura depuración
    const platform = Capacitor.getPlatform();

    // En móvil, usar SQLite real
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

    const results = await this.executeQuery(query, [fecha, this.handel]);

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
    */
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
  async ActualizaColsAux(n_col_aux: number = 0, fecha: string = ''): Promise<boolean> {
    fecha = fecha !== '' ? fecha : this.fecha_op;

    // Valida cantidad de columnas
    if (n_col_aux < 0) return false;

    const query = `
      INSERT INTO tespacios_adicionales (handel, fecha, col_aux)
      VALUES (?, ?, ?)
      ON CONFLICT(handel, fecha) DO UPDATE SET col_aux = excluded.col_aux
    `;

    const success = await this.executeCommand(query, [this.handel, fecha, n_col_aux]);

    if (success && this.vecConfigAgenda.col_aux !== undefined) {
      this.vecConfigAgenda.col_aux = n_col_aux;
    }

    return success;
  }

  /**
   * Lee cantidad de columnas auxiliares para un día específico
   */
  private async readColsAux(fecha: string): Promise<number> {
    const query = `SELECT col_aux FROM tespacios_adicionales WHERE fecha = ? AND handel = ?`;
    const results = await this.executeQuery(query, [fecha, this.handel]);

    if (results.length === 1) {
      return parseInt(results[0].col_aux) || 0;
    }

    return 0;
  }

  /**
   * Añade cantidad de columnas adicionales
   */
  async addColAux(fecha: string): Promise<boolean> {
    const col_aux = this.vecConfigAgenda.col_aux !== undefined
      ? this.vecConfigAgenda.col_aux
      : await this.readColsAux(fecha);

    // Valida que no exceda el número permitido
    if (col_aux + 1 > this.max_col_aux) return false;

    return await this.ActualizaColsAux(col_aux + 1, fecha);
  }

  /**
   * Quita cantidad de columnas adicionales
   */
  async subColAux(fecha: string): Promise<boolean> {
    const col_aux = this.vecConfigAgenda.col_aux !== undefined
      ? this.vecConfigAgenda.col_aux
      : await this.readColsAux(fecha);

    // Valida que no sea menor a 0
    if (col_aux - 1 < 0) return false;

    return await this.ActualizaColsAux(col_aux - 1, fecha);
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
      const citaColumna = typeof arrCitas[indexArrCitas].columna === 'number'
        ? arrCitas[indexArrCitas].columna
        : -1;
      columna = citaColumna >= this.vecConfigAgenda.arrLisTerapeutas.length
        ? citaColumna
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
  async MapaAgenda(updateData: boolean = true): Promise<Reserva[]> {
    const idsSim: string[] = [];

    // Obtiene configuración general de agenda
    if (!await this.readConfigAgenda()) {
      console.error('Agenda no inicializada');
      return [];
    }

    const conf = this.getInfoConfigAgenda();
    const arrTerapeutas = conf.arrLisTerapeutas || [];

    // Lee todas las reservaciones
    await this.readReservas();
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
      const tmp = this.getMaxColAg() - (conf.arrLisTerapeutas?.length || 0);
      if (conf.col_aux !== tmp) {
        await this.ActualizaColsAux(tmp);
      }

      // Columnas de citas
      for (const dat of arrCitas) {
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
          await this.UpDatAgenda(dat.id_agenda, mod);
        }
      }
    }

    return arrCitas;
  }

  /**
   * Actualiza un dato en la agenda
   */
  private async UpDatAgenda(id_agenda: number, aux_query: string): Promise<boolean> {
    if (aux_query === '') return false;

    const query = `UPDATE tagenda SET ${aux_query} WHERE handel = ? AND id = ?`;
    return await this.executeCommand(query, [this.handel, id_agenda]);
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
  async CalcEspaciosListServicios(ids_servicios: string = '', defult: number = 0): Promise<number> {
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
      const results = await this.executeQuery(query, [this.handel]);

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

  // ==================== MÉTODOS AUXILIARES PARA UI ====================

  /**
   * Obtiene la lista de pacientes/clientes
   * MODIFICADO: Ahora usa localStorage en lugar de SQLite
   */
  async getPacientes(): Promise<any[]> {
    console.log('📋 getPacientes() usando localStorage');

    // Usar localStorage tanto en web como en Android
    const clientes = this.storage.get<any[]>('clientes', []) ?? [];

    return clientes
      .filter(c => c.handel === this.handel && c.id_empresa_base === this.id_empresa_base && c.activo === 1)
      .map(c => ({
        id: c.id,
        nombre: `${c.nombre} ${c.apaterno || ''} ${c.amaterno || ''}`.trim(),
        telefono: c.tel1 || '',
        email: c.email1 || '',
        activo: 'SI'
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    /* CÓDIGO SQLite COMENTADO - Mantener para futura depuración
    const platform = Capacitor.getPlatform();

    // En web, devolver datos mock para desarrollo
    if (platform === 'web') {
      return [
        { id: 1, nombre: 'Juan Pérez', telefono: '555-0101', email: 'juan@example.com', activo: 'SI' },
        { id: 2, nombre: 'María García', telefono: '555-0102', email: 'maria@example.com', activo: 'SI' },
        { id: 3, nombre: 'Carlos López', telefono: '555-0103', email: 'carlos@example.com', activo: 'SI' },
        { id: 4, nombre: 'Ana Martínez', telefono: '555-0104', email: 'ana@example.com', activo: 'SI' },
        { id: 5, nombre: 'Pedro Sánchez', telefono: '555-0105', email: 'pedro@example.com', activo: 'SI' }
      ];
    }

    // En móvil, usar SQLite real
    const query = `
      SELECT id, nombre, telefono, email, activo
      FROM tpacientes
      WHERE handel = ? AND id_empresa_base = ? AND activo = 'SI'
      ORDER BY nombre ASC
    `;

    return await this.executeQuery(query, [this.handel, this.id_empresa_base]);
    */
  }

  /**
   * Obtiene la lista de personal de agenda
   * MODIFICADO: Ahora usa localStorage en lugar de SQLite
   */
  async getPersonalAgenda(): Promise<any[]> {
    console.log('👥 getPersonalAgenda() usando localStorage');

    // Usar localStorage tanto en web como en Android
    const personal = this.storage.get<any[]>('personal', []) ?? [];

    return personal
      .filter(p => p.handel === this.handel && p.id_empresa_base === this.id_empresa_base && p.activo === 1)
      .map(p => ({
        id: p.id,
        nombre: p.apellidos ? `${p.nombre} ${p.apellidos}` : p.nombre,
        activo: 'SI'
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    /* CÓDIGO SQLite COMENTADO - Mantener para futura depuración
    const platform = Capacitor.getPlatform();

    // En web, devolver datos mock para desarrollo
    if (platform === 'web') {
      return [
        { id: 1, nombre: 'Dr. Rodríguez', activo: 'SI' },
        { id: 2, nombre: 'Dra. Fernández', activo: 'SI' },
        { id: 3, nombre: 'Lic. González', activo: 'SI' },
        { id: 4, nombre: 'Lic. Torres', activo: 'SI' }
      ];
    }

    // En móvil, usar SQLite real
    const query = `
      SELECT id, nombre, activo
      FROM tpersonal_ag
      WHERE handel = ? AND id_empresa_base = ? AND activo = 'SI'
      ORDER BY nombre ASC
    `;

    return await this.executeQuery(query, [this.handel, this.id_empresa_base]);
    */
  }

  /**
   * Obtiene la lista de servicios
   * MODIFICADO: Ahora usa localStorage en lugar de SQLite
   */
  async getServicios(): Promise<any[]> {
    console.log('🛠️ getServicios() usando localStorage');

    // Usar localStorage tanto en web como en Android
    const productos = this.storage.get<any[]>('productos', []) ?? [];

    return productos
      .filter(p => p.handel === this.handel && p.id_empresa_base === this.id_empresa_base && p.tipo === 'Servicio' && p.activo === 1)
      .map(p => ({
        id: p.id,
        codigo: p.codigo || '',
        nombre: p.nombre,
        duracion: (p.n_duracion || 0) * 30, // Convertir a minutos
        precio: p.precio || 0,
        activo: 'SI'
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));

    /* CÓDIGO SQLite COMENTADO - Mantener para futura depuración
    const platform = Capacitor.getPlatform();

    // En web, devolver datos mock para desarrollo
    if (platform === 'web') {
      return [
        { id: 1, codigo: 'SRV001', nombre: 'Masaje Relajante', duracion: 60, precio: 500, activo: 'SI' },
        { id: 2, codigo: 'SRV002', nombre: 'Masaje Terapéutico', duracion: 90, precio: 750, activo: 'SI' },
        { id: 3, codigo: 'SRV003', nombre: 'Acupuntura', duracion: 45, precio: 600, activo: 'SI' },
        { id: 4, codigo: 'SRV004', nombre: 'Reflexología', duracion: 60, precio: 550, activo: 'SI' },
        { id: 5, codigo: 'SRV005', nombre: 'Aromaterapia', duracion: 30, precio: 350, activo: 'SI' },
        { id: 6, codigo: 'SRV006', nombre: 'Tratamiento Facial', duracion: 60, precio: 650, activo: 'SI' }
      ];
    }

    // En móvil, usar SQLite real
    const query = `
      SELECT id, codigo, nombre, duracion, precio, activo
      FROM tservicios
      WHERE handel = ? AND id_empresa_base = ? AND activo = 'SI'
      ORDER BY nombre ASC
    `;

    return await this.executeQuery(query, [this.handel, this.id_empresa_base]);
    */
  }

  /**
   * Crea una cita en localStorage
   * MODIFICADO: Ahora funciona tanto en web como en Android
   */
  async createMockAppointment(appointmentData: any): Promise<boolean> {
    console.log('💾 createMockAppointment() usando localStorage');
    console.log('Datos de cita:', appointmentData);

    /* CÓDIGO COMENTADO - Platform check ya no es necesario
    const platform = Capacitor.getPlatform();

    if (platform !== 'web') {
      return false;
    }
    */

    // Formatear fecha directamente sin convertir a ISO (evita problemas de zona horaria)
    const year = appointmentData.date.getFullYear();
    const month = String(appointmentData.date.getMonth() + 1).padStart(2, '0');
    const day = String(appointmentData.date.getDate()).padStart(2, '0');
    const fechaFormateada = `${year}-${month}-${day}`;

    // Calcular duración total en slots de 30 minutos
    const totalMinutos = appointmentData.services.reduce((total: number, service: any) => {
      return total + (service.duration * service.quantity);
    }, 0);
    const duracionSlots = Math.ceil(totalMinutos / 30);

    // Obtener información del terapeuta/personal seleccionado
    const personalInfo = this.vecConfigAgenda.arrTerapeutas?.find((t: any) => t.id === appointmentData.staffId);

    // Crear objeto Reserva mock
    const mockReserva: Reserva = {
      id_agenda: this.nextMockId++,
      id_cliente: appointmentData.clientId || 0,
      id_personal: appointmentData.staffId,
      hora: this.extractTime(appointmentData.date),
      hora_ag: this.extractTime(appointmentData.date),
      status: appointmentData.isPromo ? 'Confirmado' : 'Reservado',
      duracion: duracionSlots,
      columna: appointmentData.staffId - 1, // Columna basada en staffId
      columna_ag: appointmentData.staffId - 1,
      id_personal_ag: appointmentData.staffId,
      cliente: appointmentData.clientName,
      tel1: null,
      tel2: null,
      email1: null,
      notas: appointmentData.notes || '',
      notas2: 'Agendada via Web.',
      notas_ag: appointmentData.notes || '',
      ban_cita: 0,
      ban_liquid_credito: 0,
      servicios_agenda: appointmentData.services.map((s: any) => s.serviceName).join(', '),
      seteado: false,
      alias_personal: personalInfo?.alias || '',
      nombre_personal: personalInfo?.nombre || '',
      fecha: fechaFormateada // Formato YYYY-MM-DD
    };

    // Agregar a la lista de citas mock
    this.mockAppointments.push(mockReserva);

    // Guardar en localStorage
    this.saveMockAppointmentsToStorage();

    return true;
  }

  /**
   * Guarda las citas mock en localStorage
   */
  private saveMockAppointmentsToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY_APPOINTMENTS, JSON.stringify(this.mockAppointments));
      localStorage.setItem(this.STORAGE_KEY_NEXT_ID, this.nextMockId.toString());
    } catch (error) {
      console.error('Error guardando citas en localStorage:', error);
    }
  }

  /**
   * Carga las citas mock desde localStorage
   */
  private loadMockAppointmentsFromStorage(): void {
    try {
      const storedAppointments = localStorage.getItem(this.STORAGE_KEY_APPOINTMENTS);
      const storedNextId = localStorage.getItem(this.STORAGE_KEY_NEXT_ID);

      if (storedAppointments) {
        this.mockAppointments = JSON.parse(storedAppointments);
      }

      if (storedNextId) {
        this.nextMockId = parseInt(storedNextId, 10);
      }
    } catch (error) {
      console.error('Error cargando citas desde localStorage:', error);
      this.mockAppointments = [];
      this.nextMockId = 1;
    }
  }

  /**
   * Extrae la hora en formato HH:MM de un objeto Date
   */
  private extractTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // ==================== EXPORTAR/IMPORTAR BASE DE DATOS ====================

  /**
   * Exporta la base de datos como archivo
   * NOTA: Este método debe ser implementado usando Capacitor SQLite
   * cuando se requiera funcionalidad de exportación
   */
  exportDatabase(): Blob | null {
    console.warn('exportDatabase() no implementado para Capacitor SQLite');
    // TODO: Implementar usando this.dbService.exportDatabase() si es necesario
    return null;
  }

  /**
   * Importa una base de datos desde un archivo
   * NOTA: Este método debe ser implementado usando Capacitor SQLite
   * cuando se requiera funcionalidad de importación
   */
  async importDatabase(file: File): Promise<boolean> {
    console.warn('importDatabase() no implementado para Capacitor SQLite');
    // TODO: Implementar usando this.dbService.importDatabase() si es necesario
    return false;
  }

  /**
   * Limpia completamente la base de datos
   * NOTA: Este método debe usar DatabaseService para limpiar
   */
  async clearDatabase(): Promise<void> {
    console.warn('clearDatabase() debe implementarse usando DatabaseService');
    // TODO: Implementar usando this.dbService.clearDatabase()
  }
}
