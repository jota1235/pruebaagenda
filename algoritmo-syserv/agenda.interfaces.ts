/**
 * Interfaces TypeScript para el Servicio de Agenda
 * Traducido desde PHP (.ht-agenda.php) para Ionic + Angular + sql.js
 */

/**
 * Configuración de la Agenda
 */
export interface ConfigAgenda {
  puesto_servicio: string;
  hora_inicio: number;
  minutos_incremento: number;
  hora_fin: number;
  color_libre: string;
  color_reservada: string;
  color_confirmada: string;
  color_cancelada: string;
  color_cobrado: string;
  color_fuera_tiempo: string;
  most_disponibilidad: boolean;
  rangoManual: boolean;
  Filas: string;
  num_columnas: number;
  cantColsFijas: number;
  rangoHora: boolean;
  vizNombreTerapeuta: boolean;
  col_aux: number;
  config_horario?: {
    horario_sabado: string;
    horario_domingo: string;
    formato_hora: string;
    str_dias: string;
  };
  dias_ctespr?: string;
  nventa_ctespr?: string;
  arrTerapeutas?: Terapeuta[];
  arrLisTerapeutas?: number[];
  aliasTerapeutas?: string[];
  disponibilidad?: {
    hora_inicio: number;
    hora_fin: number;
    dia_habil: boolean;
  };
}

/**
 * Terapeuta/Empleado
 */
export interface Terapeuta {
  id: number;
  alias: string;
  nombre: string;
  orden?: number;
}

/**
 * Horario en formato militar y regular
 */
export interface HorarioAgenda {
  militar: string;      // "09:00"
  regular: string;      // "09:00 am"
  mark: boolean;        // true si es hora en punto (:00)
}

/**
 * Reserva/Cita en Agenda
 */
export interface Reserva {
  id_agenda: number;
  id_cliente: number;
  id_personal: number;
  hora: string;
  hora_ag: string;
  status: 'Cobrado' | 'Confirmado' | 'Reservado' | 'Cancelado' | 'FueraTiempo';
  duracion: number;
  columna: number;
  columna_ag: number;
  id_personal_ag: number | string;
  cliente: string;
  tel1: string | null;
  tel2: string | null;
  email1: string | null;
  notas: string;
  notas2: string;
  notas_ag: string;
  ban_cita: number;
  ban_liquid_credito: number;
  servicios_agenda: string | null;
  seteado: boolean;
  alias_personal: string;
  nombre_personal: string;
}

/**
 * Cliente
 */
export interface Cliente {
  id: number;
  nombrecto: string;
  tel1: string;
  tel2: string;
  email1: string;
  medio_promo: string;
  codPaisTel1?: string;
  apaterno?: string;
  amaterno?: string;
  nombre?: string;
}

/**
 * Producto/Servicio
 */
export interface Producto {
  id: number;
  nombre: string;
  codigo: string;
  tipo: 'Servicio' | 'Materia prima' | 'Materia prima y producto terminado' | 'Producto terminado';
  u_medida: string;
  n_duracion: number;
}

/**
 * Datos de cita cobrada
 */
export interface CitaCobrada {
  id: number;
  status: string;
  id_caja: number;
  folio: number;
  clav_insumo: number;
  notas: string;
  fecha: string;
  cliente: string;
  lista_servicios: string;
  empleado: string;
  hora: string;
  espacios_duracion: number;
  lista_productos: string;
  anticipos: string;
  EF: number;
  TA: number;
  TR: number;
  DE: number;
  PU: number;
  CR: number;
  SA: number;
  total: number;
}

/**
 * Cita pendiente para notificaciones
 */
export interface CitaPendiente {
  id_agenda: number;
  tiempo_notificacion: number;
  status_send: string;
  send_type: string;
  status: string;
  id_cliente: number;
  id_empresa_base: number;
  handel: number;
  nombre_empresa: string;
  nombreSucursal_Sel: string;
  creditos_sms_suc: number;
  fecha: string;
  hora: string;
  codPaisTel1: string;
  tel1: string;
  nombre: string;
  apaterno: string;
  amaterno: string;
  telefono_sucursal: string;
  is_anticipo: number;
  cell_cliente?: string;
}

/**
 * Posición en el mapa de la agenda
 */
export interface PosicionMapa {
  fila: number;
  columna: number;
}

/**
 * Configuración de columnas disponibles
 */
export interface ConfigColumnas {
  [key: string]: {
    horarios?: Array<{
      inicio: string;
      fin: string;
      servicios?: string[];
    }>;
  };
}

/**
 * Parámetros de disponibilidad
 */
export interface DisponibilidadParams {
  fila_inicial: number;
  columna: number;
  espacios: number;
}

/**
 * Cita simulada para apartado de espacio
 */
export interface CitaSimulada {
  id_agenda: string;
  id_cliente: string;
  id_atiende: string;
  hora: string;
  espacios_duracion: number;
  columna: number | string;
  notas: string;
  alias_atiende?: string;
  nombre_atiende?: string;
}

/**
 * Información de registro de Agenda
 */
export interface InfoRegAgenda {
  id: number;
  handel: number;
  id_empresa_base: number;
  id_cliente: number;
  id_personal: number;
  fecha: string;
  hora: string;
  status: string;
  espacios_duracion: number;
  spacio: number;
  notas: string;
  notas2: string;
  ban_cita: number;
  ban_liquid_credito: number;
  lnk_fecha?: number;
}
