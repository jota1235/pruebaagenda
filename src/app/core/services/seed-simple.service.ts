import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Cliente, Personal, Producto } from '../models/agenda.models';

/**
 * Servicio para poblar datos de prueba en localStorage
 */
@Injectable({
  providedIn: 'root'
})
export class SeedSimpleService {
  private readonly handel = 1;
  private readonly id_empresa_base = 1;

  constructor(private storage: StorageService) {}

  /**
   * Verifica si hay datos
   */
  hasData(): boolean {
    const clientes = this.storage.get<Cliente[]>('clientes', []);
    return clientes.length > 0;
  }

  /**
   * Puebla la base de datos con datos de prueba
   */
  async seedDatabase(): Promise<void> {
    console.log('📦 Poblando localStorage con datos de prueba...');

    // Clientes de prueba
    const clientes: Cliente[] = [
      {
        id: 1,
        handel: this.handel,
        id_empresa_base: this.id_empresa_base,
        nombre: 'Juan',
        apaterno: 'Pérez',
        amaterno: 'García',
        tel1: '555-0101',
        email1: 'juan.perez@example.com',
        activo: 1
      },
      {
        id: 2,
        handel: this.handel,
        id_empresa_base: this.id_empresa_base,
        nombre: 'María',
        apaterno: 'González',
        amaterno: 'López',
        tel1: '555-0102',
        email1: 'maria.gonzalez@example.com',
        activo: 1
      },
      {
        id: 3,
        handel: this.handel,
        id_empresa_base: this.id_empresa_base,
        nombre: 'Carlos',
        apaterno: 'Martínez',
        amaterno: 'Rodríguez',
        tel1: '555-0103',
        email1: 'carlos.martinez@example.com',
        activo: 1
      },
      {
        id: 4,
        handel: this.handel,
        id_empresa_base: this.id_empresa_base,
        nombre: 'Ana',
        apaterno: 'Hernández',
        amaterno: 'Díaz',
        tel1: '555-0104',
        email1: 'ana.hernandez@example.com',
        activo: 1
      },
      {
        id: 5,
        handel: this.handel,
        id_empresa_base: this.id_empresa_base,
        nombre: 'Pedro',
        apaterno: 'Sánchez',
        amaterno: 'Flores',
        tel1: '555-0105',
        email1: 'pedro.sanchez@example.com',
        activo: 1
      }
    ];

    // Personal de prueba
    const personal: Personal[] = [
      {
        id: 1,
        handel: this.handel,
        id_empresa_base: this.id_empresa_base,
        alias: 'dr_rodriguez',
        nombre: 'Dr. Rodríguez',
        apellidos: 'García',
        activo: 1,
        orden: 1
      },
      {
        id: 2,
        handel: this.handel,
        id_empresa_base: this.id_empresa_base,
        alias: 'dra_fernandez',
        nombre: 'Dra. Fernández',
        apellidos: 'López',
        activo: 1,
        orden: 2
      },
      {
        id: 3,
        handel: this.handel,
        id_empresa_base: this.id_empresa_base,
        alias: 'lic_gonzalez',
        nombre: 'Lic. González',
        apellidos: 'Martínez',
        activo: 1,
        orden: 3
      },
      {
        id: 4,
        handel: this.handel,
        id_empresa_base: this.id_empresa_base,
        alias: 'lic_torres',
        nombre: 'Lic. Torres',
        apellidos: 'Sánchez',
        activo: 1,
        orden: 4
      }
    ];

    // Servicios de prueba
    const productos: Producto[] = [
      {
        id: 1,
        handel: this.handel,
        id_empresa_base: this.id_empresa_base,
        codigo: 'SRV001',
        nombre: 'Masaje Relajante',
        tipo: 'Servicio',
        n_duracion: 2, // 2 * 30 min = 60 min
        precio: 500,
        activo: 1
      },
      {
        id: 2,
        handel: this.handel,
        id_empresa_base: this.id_empresa_base,
        codigo: 'SRV002',
        nombre: 'Masaje Terapéutico',
        tipo: 'Servicio',
        n_duracion: 3, // 3 * 30 min = 90 min
        precio: 750,
        activo: 1
      },
      {
        id: 3,
        handel: this.handel,
        id_empresa_base: this.id_empresa_base,
        codigo: 'SRV003',
        nombre: 'Acupuntura',
        tipo: 'Servicio',
        n_duracion: 1, // 1 * 30 min = 30 min
        precio: 600,
        activo: 1
      },
      {
        id: 4,
        handel: this.handel,
        id_empresa_base: this.id_empresa_base,
        codigo: 'SRV004',
        nombre: 'Reflexología',
        tipo: 'Servicio',
        n_duracion: 2, // 2 * 30 min = 60 min
        precio: 550,
        activo: 1
      },
      {
        id: 5,
        handel: this.handel,
        id_empresa_base: this.id_empresa_base,
        codigo: 'SRV005',
        nombre: 'Aromaterapia',
        tipo: 'Servicio',
        n_duracion: 1, // 1 * 30 min = 30 min
        precio: 350,
        activo: 1
      },
      {
        id: 6,
        handel: this.handel,
        id_empresa_base: this.id_empresa_base,
        codigo: 'SRV006',
        nombre: 'Tratamiento Facial',
        tipo: 'Servicio',
        n_duracion: 2, // 2 * 30 min = 60 min
        precio: 650,
        activo: 1
      }
    ];

    // Guardar en localStorage
    this.storage.set('clientes', clientes);
    this.storage.set('personal', personal);
    this.storage.set('productos', productos);
    this.storage.set('citas', []); // Array vacío de citas

    console.log('✅ Datos de prueba guardados en localStorage');
    console.log(`   - ${clientes.length} clientes`);
    console.log(`   - ${personal.length} personal`);
    console.log(`   - ${productos.length} servicios`);
  }

  /**
   * Limpia todos los datos
   */
  async clearAllData(): Promise<void> {
    this.storage.clear();
    console.log('🗑️  Todos los datos eliminados');
  }
}
