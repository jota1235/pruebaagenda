/**
 * Modelos de datos para la agenda
 * Basados en el sistema real de algoritmo-syserv
 */

export interface Cliente {
  id: number;
  handel: number;
  id_empresa_base: number;
  nombre: string;
  apaterno?: string;
  amaterno?: string;
  tel1?: string;
  tel2?: string;
  email1?: string;
  codPaisTel1?: string;
  activo: number; // 1 = activo, 0 = inactivo
}

export interface Personal {
  id: number;
  handel: number;
  id_empresa_base: number;
  alias: string;
  nombre: string;
  apellidos?: string;
  activo: number; // 1 = activo, 0 = inactivo
  orden?: number;
}

export interface Producto {
  id: number;
  handel: number;
  id_empresa_base: number;
  codigo?: string;
  nombre: string;
  tipo: string; // 'Servicio', 'Producto', etc.
  n_duracion?: number; // Duración en incrementos de 30 min
  precio?: number;
  activo: number; // 1 = activo, 0 = inactivo
}

export interface Cita {
  id: number;
  handel: number;
  id_empresa_base: number;
  id_cliente: number;
  id_personal: number;
  id_producto: number;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  status: string; // 'Reservado', 'Confirmado', 'Cobrado', 'Cancelado'
  espacios_duracion: number; // Duración en incrementos
  notas?: string;
  folio?: number;
  efectivo?: number;
  tarjeta?: number;
  transferencia?: number;
  total?: number;
}
