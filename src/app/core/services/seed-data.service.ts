import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';

/**
 * Servicio para poblar la base de datos con datos de prueba
 * Utilizado en desarrollo y primera ejecución
 */
@Injectable({
  providedIn: 'root'
})
export class SeedDataService {

  constructor(private dbService: DatabaseService) {}

  /**
   * Verifica si la base de datos ya tiene datos
   */
  async hasData(): Promise<boolean> {
    const result = await this.dbService.executeQuery(
      'SELECT COUNT(*) as count FROM tempresa'
    );
    return result[0]?.count > 0;
  }

  /**
   * Puebla la base de datos con datos de prueba
   */
  async seedDatabase(): Promise<void> {
    console.log('🌱 Iniciando seed de base de datos...');

    try {
      // 1. Insertar empresa base
      await this.insertEmpresa();
      console.log('✅ Empresa insertada');

      // 2. Insertar sucursal
      await this.insertSucursal();
      console.log('✅ Sucursal insertada');

      // 3. Insertar configuración de agenda
      await this.insertConfigAgenda();
      console.log('✅ Configuración de agenda insertada');

      // 4. Insertar terapeutas/personal
      await this.insertTerapeutas();
      console.log('✅ Terapeutas insertados');

      // 5. Insertar servicios/productos
      await this.insertServicios();
      console.log('✅ Servicios insertados');

      // 6. Insertar medios informativos
      await this.insertMediosInformativos();
      console.log('✅ Medios informativos insertados');

      // 7. Insertar clientes de ejemplo
      await this.insertClientes();
      console.log('✅ Clientes insertados');

      // 8. Insertar citas de ejemplo
      await this.insertCitas();
      console.log('✅ Citas insertadas');

      // 9. Guardar cambios en web store
      await this.dbService.saveToStore();

      console.log('🎉 Seed completado exitosamente!');
    } catch (error) {
      console.error('❌ Error durante el seed:', error);
      throw error;
    }
  }

  /**
   * Inserta empresa base
   */
  private async insertEmpresa(): Promise<void> {
    const query = `
      INSERT INTO tempresa (
        id, nombre, rfc, calle, num_ext, num_int, colonia,
        ciudad, estado, pais, cp, telefono, email, sitio_web,
        sync_status, uuid_local, version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const uuid = this.generateUUID();
    const now = new Date().toISOString();

    await this.dbService.executeCommand(query, [
      1, // id
      'Spa & Wellness Demo',
      'SPW123456XXX',
      'Av. Principal',
      '100',
      '',
      'Centro',
      'Ciudad de México',
      'CDMX',
      'México',
      '01000',
      '+52 55 1234 5678',
      'contacto@spawellness.com',
      'https://spawellness.com',
      'synced', // sync_status
      uuid,
      1, // version
      now,
      now
    ]);
  }

  /**
   * Inserta sucursal base
   */
  private async insertSucursal(): Promise<void> {
    const query = `
      INSERT INTO tsucursales (
        id, id_empresa_base, nombre, telefono, calle, num_ext, num_int,
        colonia, ciudad, estado, pais, cp, email, activo,
        sync_status, uuid_local, version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const uuid = this.generateUUID();
    const now = new Date().toISOString();

    await this.dbService.executeCommand(query, [
      1, // id (handel)
      1, // id_empresa_base
      'Sucursal Centro',
      '+52 55 1234 5678',
      'Av. Principal',
      '100',
      '',
      'Centro',
      'Ciudad de México',
      'CDMX',
      'México',
      '01000',
      'centro@spawellness.com',
      1, // activo
      'synced',
      uuid,
      1,
      now,
      now
    ]);
  }

  /**
   * Inserta configuración de agenda
   */
  private async insertConfigAgenda(): Promise<void> {
    const query = `
      INSERT INTO tconfig_gral (
        id, handel, id_empresa_base, puesto_servicio, hora_inicio, minutos_incremento, hora_fin,
        color_libre, color_reservada, color_confirmada, color_cancelada,
        color_cobrado, color_fuera_tiempo, most_disponibilidad, rangoManual,
        Filas, num_columnas, rangoHora, vizNombreTerapeuta
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.dbService.executeCommand(query, [
      1, // id
      1, // handel
      1, // id_empresa_base
      'Consultorio',
      9, // hora_inicio (9 AM)
      30, // minutos_incremento
      20, // hora_fin (8 PM)
      '#FFFFFF', // color_libre (blanco)
      '#FFE5B4', // color_reservada (melocotón claro)
      '#90EE90', // color_confirmada (verde claro)
      '#FFB6C1', // color_cancelada (rosa claro)
      '#87CEEB', // color_cobrado (azul cielo)
      '#D3D3D3', // color_fuera_tiempo (gris claro)
      'SI', // most_disponibilidad
      'NO', // rangoManual
      'horas', // Filas
      3, // num_columnas
      'SI', // rangoHora
      'SI' // vizNombreTerapeuta
    ]);
  }

  /**
   * Inserta terapeutas/personal de ejemplo
   */
  private async insertTerapeutas(): Promise<void> {
    const terapeutas = [
      { id: 1, nombre: 'María', apellidos: 'González Pérez', alias: 'Maria G.' },
      { id: 2, nombre: 'Juan', apellidos: 'Martínez López', alias: 'Juan M.' },
      { id: 3, nombre: 'Ana', apellidos: 'Rodríguez Sánchez', alias: 'Ana R.' }
    ];

    const query = `
      INSERT INTO tpersonal (
        id, handel, id_empresa_base, nombre, apellidos, alias, activo, tipo,
        sync_status, uuid_local, version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const terapeuta of terapeutas) {
      const uuid = this.generateUUID();
      const now = new Date().toISOString();

      await this.dbService.executeCommand(query, [
        terapeuta.id,
        1, // handel
        1, // id_empresa_base
        terapeuta.nombre,
        terapeuta.apellidos,
        terapeuta.alias,
        1, // activo
        'Terapeuta',
        'synced',
        uuid,
        1,
        now,
        now
      ]);
    }
  }

  /**
   * Inserta servicios/productos de ejemplo
   */
  private async insertServicios(): Promise<void> {
    const servicios = [
      { id: 1, codigo: 'MAS-60', nombre: 'Masaje Relajante 60min', duracion: 2 },
      { id: 2, codigo: 'MAS-90', nombre: 'Masaje Relajante 90min', duracion: 3 },
      { id: 3, codigo: 'FAC-60', nombre: 'Facial Hidratante', duracion: 2 },
      { id: 4, codigo: 'MAN-30', nombre: 'Manicure Express', duracion: 1 },
      { id: 5, codigo: 'PED-45', nombre: 'Pedicure Completo', duracion: 2 }
    ];

    const query = `
      INSERT INTO tproductos (
        id, handel, codigo, nombre, tipo, u_medida, n_duracion, activo,
        sync_status, uuid_local, version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const servicio of servicios) {
      const uuid = this.generateUUID();
      const now = new Date().toISOString();

      await this.dbService.executeCommand(query, [
        servicio.id,
        1, // handel
        servicio.codigo,
        servicio.nombre,
        'Servicio',
        'Servicio',
        servicio.duracion,
        1, // activo
        'synced',
        uuid,
        1,
        now,
        now
      ]);
    }
  }

  /**
   * Inserta medios informativos
   */
  private async insertMediosInformativos(): Promise<void> {
    const medios = [
      'Redes Sociales',
      'Recomendación',
      'Google',
      'Anuncio',
      'Otro'
    ];

    const query = `
      INSERT INTO tmedios_informativos (
        id, handel, nombre, activo,
        sync_status, uuid_local, version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (let i = 0; i < medios.length; i++) {
      const uuid = this.generateUUID();
      const now = new Date().toISOString();

      await this.dbService.executeCommand(query, [
        i + 1,
        1, // handel
        medios[i],
        1, // activo
        'synced',
        uuid,
        1,
        now,
        now
      ]);
    }
  }

  /**
   * Inserta clientes de ejemplo
   */
  private async insertClientes(): Promise<void> {
    const clientes = [
      {
        id: 1,
        nombre: 'Laura',
        apaterno: 'Hernández',
        amaterno: 'García',
        tel1: '5551234567',
        email1: 'laura.hernandez@email.com',
        medio_promo: 'Redes Sociales'
      },
      {
        id: 2,
        nombre: 'Carlos',
        apaterno: 'Ramírez',
        amaterno: 'Torres',
        tel1: '5559876543',
        email1: 'carlos.ramirez@email.com',
        medio_promo: 'Recomendación'
      },
      {
        id: 3,
        nombre: 'Patricia',
        apaterno: 'López',
        amaterno: 'Morales',
        tel1: '5555555555',
        email1: 'patricia.lopez@email.com',
        medio_promo: 'Google'
      },
      {
        id: 4,
        nombre: 'Roberto',
        apaterno: 'Flores',
        amaterno: 'Vega',
        tel1: '5554443332',
        email1: 'roberto.flores@email.com',
        medio_promo: 'Redes Sociales'
      },
      {
        id: 5,
        nombre: 'Diana',
        apaterno: 'Castro',
        amaterno: 'Ruiz',
        tel1: '5552221111',
        email1: 'diana.castro@email.com',
        medio_promo: 'Recomendación'
      }
    ];

    const query = `
      INSERT INTO tclientes (
        id, handel, id_empresa_base, nombre, apaterno, amaterno,
        tel1, email1, medio_promo, codPaisTel1, activo,
        sync_status, uuid_local, version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const cliente of clientes) {
      const uuid = this.generateUUID();
      const now = new Date().toISOString();

      await this.dbService.executeCommand(query, [
        cliente.id,
        1, // handel
        1, // id_empresa_base
        cliente.nombre,
        cliente.apaterno,
        cliente.amaterno,
        cliente.tel1,
        cliente.email1,
        cliente.medio_promo,
        '+52', // codPaisTel1
        1, // activo
        'synced',
        uuid,
        1,
        now,
        now
      ]);
    }
  }

  /**
   * Inserta citas de ejemplo para hoy y mañana
   */
  private async insertCitas(): Promise<void> {
    // Obtener fecha de hoy
    const hoy = new Date();
    const fechaHoy = this.formatDate(hoy);

    // Obtener fecha de mañana
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    const fechaManana = this.formatDate(manana);

    const citas = [
      // Citas de hoy
      {
        id: 1,
        fecha: fechaHoy,
        hora: '10:00',
        id_cliente: 1,
        id_personal: 1,
        status: 'Confirmado',
        espacios_duracion: 2,
        spacio: 0,
        notas: 'Primera cita'
      },
      {
        id: 2,
        fecha: fechaHoy,
        hora: '11:00',
        id_cliente: 2,
        id_personal: 2,
        status: 'Reservado',
        espacios_duracion: 3,
        spacio: 1,
        notas: 'Cliente frecuente'
      },
      {
        id: 3,
        fecha: fechaHoy,
        hora: '14:00',
        id_cliente: 3,
        id_personal: 3,
        status: 'Cobrado',
        espacios_duracion: 2,
        spacio: 2,
        notas: 'Pago anticipado'
      },
      // Citas de mañana
      {
        id: 4,
        fecha: fechaManana,
        hora: '09:00',
        id_cliente: 4,
        id_personal: 1,
        status: 'Confirmado',
        espacios_duracion: 2,
        spacio: 0,
        notas: 'Cita temprana'
      },
      {
        id: 5,
        fecha: fechaManana,
        hora: '15:00',
        id_cliente: 5,
        id_personal: 2,
        status: 'Reservado',
        espacios_duracion: 1,
        spacio: 1,
        notas: 'Cita tarde'
      }
    ];

    const queryAgenda = `
      INSERT INTO tagenda (
        id, handel, id_empresa_base, id_cliente, id_personal,
        fecha, hora, status, espacios_duracion, spacio, notas, notas2,
        ban_cita, ban_liquid_credito,
        sync_status, uuid_local, version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const queryAgendaAux = `
      INSERT INTO tagenda_aux (
        id, id_agenda, id_producto_servicio, cantidad,
        sync_status, uuid_local, version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const cita of citas) {
      const uuid = this.generateUUID();
      const now = new Date().toISOString();

      // Insertar cita en tagenda
      await this.dbService.executeCommand(queryAgenda, [
        cita.id,
        1, // handel
        1, // id_empresa_base
        cita.id_cliente,
        cita.id_personal,
        cita.fecha,
        cita.hora,
        cita.status,
        cita.espacios_duracion,
        cita.spacio,
        cita.notas,
        '', // notas2
        1, // ban_cita
        0, // ban_liquid_credito
        'synced',
        uuid,
        1,
        now,
        now
      ]);

      // Insertar servicio asociado en tagenda_aux
      // Para simplificar, asociamos el servicio con id 1 (Masaje 60min)
      const uuidAux = this.generateUUID();
      await this.dbService.executeCommand(queryAgendaAux, [
        cita.id, // id (puede ser el mismo que id_agenda)
        cita.id, // id_agenda
        1, // id_producto_servicio (Masaje 60min)
        1, // cantidad
        'synced',
        uuidAux,
        1,
        now,
        now
      ]);
    }
  }

  /**
   * Formatea una fecha como YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Genera un UUID v4 simple
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Limpia todos los datos de prueba (útil para reiniciar)
   */
  async clearAllData(): Promise<void> {
    console.log('🗑️ Limpiando datos de prueba...');

    const tables = [
      'tagenda_aux',
      'tagenda',
      'tclientes',
      'tproductos',
      'tpersonal',
      'tmedios_informativos',
      'tconfig_agenda',
      'tsucursales',
      'tempresa'
    ];

    for (const table of tables) {
      await this.dbService.executeCommand(`DELETE FROM ${table}`);
    }

    console.log('✅ Datos limpiados');
  }
}
