import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Cliente, Personal, Producto, Cita } from '../models/agenda.models';

/**
 * Servicio de Agenda usando localStorage
 * Mucho más simple y confiable que SQLite
 */
@Injectable({
  providedIn: 'root'
})
export class AgendaSimpleService {
  public handel: number = 1;
  public id_empresa_base: number = 1;

  constructor(private storage: StorageService) {}

  // ==================== CLIENTES ====================

  /**
   * Obtiene todos los clientes
   */
  async getPacientes(): Promise<any[]> {
    const clientes = this.storage.get<Cliente[]>('clientes', []);
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
  }

  /**
   * Agrega un nuevo cliente
   */
  async addCliente(cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
    const clientes = this.storage.get<Cliente[]>('clientes', []);
    const nuevoId = clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1;

    const nuevoCliente: Cliente = {
      id: nuevoId,
      ...cliente
    };

    clientes.push(nuevoCliente);
    this.storage.set('clientes', clientes);

    return nuevoCliente;
  }

  /**
   * Actualiza un cliente
   */
  async updateCliente(id: number, datos: Partial<Cliente>): Promise<boolean> {
    const clientes = this.storage.get<Cliente[]>('clientes', []);
    const index = clientes.findIndex(c => c.id === id);

    if (index === -1) return false;

    clientes[index] = { ...clientes[index], ...datos };
    this.storage.set('clientes', clientes);

    return true;
  }

  /**
   * Elimina un cliente (marca como inactivo)
   */
  async deleteCliente(id: number): Promise<boolean> {
    return this.updateCliente(id, { activo: 0 });
  }

  // ==================== PERSONAL ====================

  /**
   * Obtiene todo el personal
   */
  async getPersonalAgenda(): Promise<any[]> {
    const personal = this.storage.get<Personal[]>('personal', []);
    return personal
      .filter(p => p.handel === this.handel && p.id_empresa_base === this.id_empresa_base && p.activo === 1)
      .map(p => ({
        id: p.id,
        nombre: p.apellidos ? `${p.nombre} ${p.apellidos}` : p.nombre,
        activo: 'SI'
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  /**
   * Agrega nuevo personal
   */
  async addPersonal(personal: Omit<Personal, 'id'>): Promise<Personal> {
    const listPersonal = this.storage.get<Personal[]>('personal', []);
    const nuevoId = listPersonal.length > 0 ? Math.max(...listPersonal.map(p => p.id)) + 1 : 1;

    const nuevoPersonal: Personal = {
      id: nuevoId,
      ...personal
    };

    listPersonal.push(nuevoPersonal);
    this.storage.set('personal', listPersonal);

    return nuevoPersonal;
  }

  /**
   * Actualiza personal
   */
  async updatePersonal(id: number, datos: Partial<Personal>): Promise<boolean> {
    const personal = this.storage.get<Personal[]>('personal', []);
    const index = personal.findIndex(p => p.id === id);

    if (index === -1) return false;

    personal[index] = { ...personal[index], ...datos };
    this.storage.set('personal', personal);

    return true;
  }

  /**
   * Elimina personal (marca como inactivo)
   */
  async deletePersonal(id: number): Promise<boolean> {
    return this.updatePersonal(id, { activo: 0 });
  }

  // ==================== SERVICIOS/PRODUCTOS ====================

  /**
   * Obtiene todos los servicios
   */
  async getServicios(): Promise<any[]> {
    const productos = this.storage.get<Producto[]>('productos', []);
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
  }

  /**
   * Agrega un nuevo servicio
   */
  async addServicio(producto: Omit<Producto, 'id'>): Promise<Producto> {
    const productos = this.storage.get<Producto[]>('productos', []);
    const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;

    const nuevoProducto: Producto = {
      id: nuevoId,
      ...producto,
      tipo: 'Servicio'
    };

    productos.push(nuevoProducto);
    this.storage.set('productos', productos);

    return nuevoProducto;
  }

  /**
   * Actualiza un servicio
   */
  async updateServicio(id: number, datos: Partial<Producto>): Promise<boolean> {
    const productos = this.storage.get<Producto[]>('productos', []);
    const index = productos.findIndex(p => p.id === id);

    if (index === -1) return false;

    productos[index] = { ...productos[index], ...datos };
    this.storage.set('productos', productos);

    return true;
  }

  /**
   * Elimina un servicio (marca como inactivo)
   */
  async deleteServicio(id: number): Promise<boolean> {
    return this.updateServicio(id, { activo: 0 });
  }

  // ==================== CITAS ====================

  /**
   * Obtiene citas por fecha
   */
  async getCitasPorFecha(fecha: string): Promise<Cita[]> {
    const citas = this.storage.get<Cita[]>('citas', []);
    return citas.filter(c =>
      c.handel === this.handel &&
      c.id_empresa_base === this.id_empresa_base &&
      c.fecha === fecha
    ).sort((a, b) => a.hora.localeCompare(b.hora));
  }

  /**
   * Agrega una nueva cita
   */
  async addCita(cita: Omit<Cita, 'id'>): Promise<Cita> {
    const citas = this.storage.get<Cita[]>('citas', []);
    const nuevoId = citas.length > 0 ? Math.max(...citas.map(c => c.id)) + 1 : 1;

    const nuevaCita: Cita = {
      id: nuevoId,
      ...cita
    };

    citas.push(nuevaCita);
    this.storage.set('citas', citas);

    return nuevaCita;
  }

  /**
   * Actualiza una cita
   */
  async updateCita(id: number, datos: Partial<Cita>): Promise<boolean> {
    const citas = this.storage.get<Cita[]>('citas', []);
    const index = citas.findIndex(c => c.id === id);

    if (index === -1) return false;

    citas[index] = { ...citas[index], ...datos };
    this.storage.set('citas', citas);

    return true;
  }

  /**
   * Cancela una cita
   */
  async cancelCita(id: number): Promise<boolean> {
    return this.updateCita(id, { status: 'Cancelado' });
  }

  // ==================== UTILIDADES ====================

  /**
   * Limpia todos los datos
   */
  async clearAllData(): Promise<void> {
    this.storage.clear();
  }

  /**
   * Verifica si hay datos
   */
  async hasData(): Promise<boolean> {
    const clientes = this.storage.get<Cliente[]>('clientes', []);
    return clientes.length > 0;
  }
}
