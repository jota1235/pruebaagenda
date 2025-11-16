/**
 * Componente de ejemplo para implementar la Agenda
 * en Ionic + Angular usando el AgendaService
 */

import { Component, OnInit } from '@angular/core';
import { AgendaService } from './services/agenda.service';
import { Reserva, Terapeuta, HorarioAgenda } from './interfaces/agenda.interfaces';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss']
})
export class AgendaPage implements OnInit {

  // Datos de la agenda
  horarios: HorarioAgenda[] = [];
  terapeutas: Terapeuta[] = [];
  mapa: string[][] = [];
  reservas: Reserva[] = [];

  // Configuración
  fechaSeleccionada: string = '';
  columnaSeleccionada: number = -1;
  filaSeleccionada: number = -1;

  // Estados
  cargando: boolean = false;
  agendaInicializada: boolean = false;

  constructor(
    private agendaService: AgendaService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.inicializarAgenda();
  }

  /**
   * Inicializa la base de datos y carga la agenda del día
   */
  async inicializarAgenda() {
    const loading = await this.loadingController.create({
      message: 'Inicializando agenda...'
    });
    await loading.present();

    try {
      // Inicializar base de datos
      await this.agendaService.initDatabase();

      // Configurar parámetros
      this.agendaService.setHandel(1); // ID de sucursal
      this.agendaService.setEmpresaBase(1);
      this.agendaService.setMinutosIncremento(30);
      this.agendaService.setMinutosAntelacion(15);

      // Cargar agenda del día actual
      this.fechaSeleccionada = this.obtenerFechaHoy();
      await this.cargarAgenda(this.fechaSeleccionada);

      this.agendaInicializada = true;

      await this.mostrarToast('Agenda inicializada correctamente', 'success');
    } catch (error) {
      console.error('Error inicializando agenda:', error);
      await this.mostrarToast('Error al inicializar la agenda', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Carga todos los datos de la agenda para una fecha específica
   */
  async cargarAgenda(fecha: string) {
    this.cargando = true;

    try {
      // Establecer fecha
      this.agendaService.setFechaAg(fecha);

      // Leer configuración de la agenda
      const configOk = this.agendaService.readConfigAgenda(fecha);

      if (!configOk) {
        throw new Error('No se pudo leer la configuración de la agenda');
      }

      // Obtener información de terapeutas
      this.agendaService.ReadColsTerapeutas();
      this.terapeutas = this.agendaService.getInfoColsTerapeutas();

      // Leer reservas del día
      this.agendaService.readReservas(fecha);
      this.reservas = this.agendaService.getInfoReservas();

      // Generar mapa de ocupación
      this.agendaService.MapaAgenda(false);
      this.mapa = this.agendaService.getArrMapa();

      // Obtener horarios
      this.horarios = this.agendaService.getInfoHorarios(true) as HorarioAgenda[];

      console.log('Agenda cargada:');
      console.log('- Terapeutas:', this.terapeutas.length);
      console.log('- Horarios:', this.horarios.length);
      console.log('- Reservas:', this.reservas.length);

    } catch (error) {
      console.error('Error cargando agenda:', error);
      await this.mostrarToast('Error al cargar la agenda', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  /**
   * Maneja el clic en una celda de la agenda
   */
  async onCeldaClick(columna: number, fila: number) {
    this.columnaSeleccionada = columna;
    this.filaSeleccionada = fila;

    const valor = this.mapa[columna][fila];
    const horario = this.horarios[fila];
    const terapeuta = this.terapeutas[columna];

    // Si está vacío, mostrar opción para crear cita
    if (valor === '') {
      await this.mostrarDialogoNuevaCita(columna, fila, horario.militar, terapeuta);
    }
    // Si es un número, mostrar detalles de la cita
    else if (!isNaN(parseInt(valor))) {
      const idAgenda = parseInt(valor);
      await this.mostrarDetallesCita(idAgenda);
    }
    // Si es 'X', buscar el inicio de la cita
    else if (valor === 'X') {
      const idAgenda = this.buscarInicioCita(columna, fila);
      if (idAgenda) {
        await this.mostrarDetallesCita(idAgenda);
      }
    }
    // Espacio no disponible
    else {
      await this.mostrarToast('Este espacio no está disponible', 'warning');
    }
  }

  /**
   * Busca el ID de agenda al inicio de una cita que ocupa varios espacios
   */
  buscarInicioCita(columna: number, fila: number): number | null {
    // Buscar hacia arriba
    for (let f = fila - 1; f >= 0; f--) {
      const valor = this.mapa[columna][f];
      if (!isNaN(parseInt(valor))) {
        return parseInt(valor);
      }
      if (valor !== 'X') break;
    }
    return null;
  }

  /**
   * Muestra un diálogo para crear una nueva cita
   */
  async mostrarDialogoNuevaCita(
    columna: number,
    fila: number,
    hora: string,
    terapeuta: Terapeuta
  ) {
    const alert = await this.alertController.create({
      header: 'Nueva Cita',
      message: `¿Desea crear una cita para ${terapeuta.nombre} a las ${hora}?`,
      inputs: [
        {
          name: 'cliente',
          type: 'text',
          placeholder: 'Nombre del cliente'
        },
        {
          name: 'duracion',
          type: 'number',
          placeholder: 'Duración (espacios)',
          value: 1,
          min: 1
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Crear',
          handler: (data) => {
            this.crearNuevaCita(columna, fila, hora, terapeuta.id, data);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Crea una nueva cita en la base de datos
   */
  async crearNuevaCita(
    columna: number,
    fila: number,
    hora: string,
    idTerapeuta: number,
    datos: any
  ) {
    const loading = await this.loadingController.create({
      message: 'Creando cita...'
    });
    await loading.present();

    try {
      // Verificar disponibilidad
      const duracion = parseInt(datos.duracion) || 1;
      const disponible = this.agendaService.isDisponible(fila, columna, duracion);

      if (!disponible) {
        await this.mostrarToast('El espacio no está disponible', 'danger');
        return;
      }

      // Aquí deberías implementar la lógica para insertar en la BD
      // Por ahora solo mostramos confirmación
      console.log('Crear cita:', {
        fecha: this.fechaSeleccionada,
        hora: hora,
        columna: columna,
        terapeuta: idTerapeuta,
        cliente: datos.cliente,
        duracion: duracion
      });

      await this.mostrarToast('Cita creada exitosamente', 'success');

      // Recargar agenda
      await this.cargarAgenda(this.fechaSeleccionada);

    } catch (error) {
      console.error('Error creando cita:', error);
      await this.mostrarToast('Error al crear la cita', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Muestra los detalles de una cita existente
   */
  async mostrarDetallesCita(idAgenda: number) {
    const cita = this.reservas.find(r => r.id_agenda === idAgenda);

    if (!cita) {
      await this.mostrarToast('No se encontró la cita', 'danger');
      return;
    }

    const horaFin = this.agendaService.calcHorario(cita.hora, cita.duracion);

    const alert = await this.alertController.create({
      header: 'Detalles de la Cita',
      message: `
        <strong>Cliente:</strong> ${cita.cliente}<br>
        <strong>Terapeuta:</strong> ${cita.nombre_personal}<br>
        <strong>Hora:</strong> ${cita.hora} - ${horaFin}<br>
        <strong>Status:</strong> ${cita.status}<br>
        <strong>Notas:</strong> ${cita.notas || 'Sin notas'}
      `,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        },
        {
          text: 'Editar',
          handler: () => {
            // Implementar edición
            console.log('Editar cita:', idAgenda);
          }
        },
        {
          text: 'Cancelar Cita',
          cssClass: 'danger',
          handler: () => {
            this.confirmarCancelacion(idAgenda);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Confirma la cancelación de una cita
   */
  async confirmarCancelacion(idAgenda: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar Cancelación',
      message: '¿Está seguro que desea cancelar esta cita?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí, Cancelar',
          cssClass: 'danger',
          handler: () => {
            this.cancelarCita(idAgenda);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Cancela una cita
   */
  async cancelarCita(idAgenda: number) {
    const loading = await this.loadingController.create({
      message: 'Cancelando cita...'
    });
    await loading.present();

    try {
      // Aquí implementarías la lógica para actualizar el status a 'Cancelado'
      console.log('Cancelar cita:', idAgenda);

      await this.mostrarToast('Cita cancelada exitosamente', 'success');

      // Recargar agenda
      await this.cargarAgenda(this.fechaSeleccionada);

    } catch (error) {
      console.error('Error cancelando cita:', error);
      await this.mostrarToast('Error al cancelar la cita', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Cambia la fecha de la agenda
   */
  async cambiarFecha(event: any) {
    const nuevaFecha = event.detail.value.split('T')[0];
    this.fechaSeleccionada = nuevaFecha;
    await this.cargarAgenda(nuevaFecha);
  }

  /**
   * Buscar disponibilidad para una duración específica
   */
  async buscarDisponibilidad(espacios: number = 1) {
    const loading = await this.loadingController.create({
      message: 'Buscando disponibilidad...'
    });
    await loading.present();

    try {
      const numColumnas = this.agendaService.readNCols();
      let encontrado = false;

      for (let fila = 0; fila < this.horarios.length && !encontrado; fila++) {
        for (let columna = 0; columna < numColumnas && !encontrado; columna++) {
          if (this.agendaService.isDisponible(fila, columna, espacios)) {
            encontrado = true;

            const horario = this.horarios[fila];
            const terapeuta = this.terapeutas[columna];

            await loading.dismiss();

            const alert = await this.alertController.create({
              header: 'Disponibilidad Encontrada',
              message: `
                <strong>Terapeuta:</strong> ${terapeuta.nombre}<br>
                <strong>Hora:</strong> ${horario.regular}<br>
                <strong>Duración:</strong> ${espacios} espacio(s)
              `,
              buttons: [
                {
                  text: 'Continuar buscando',
                  role: 'cancel'
                },
                {
                  text: 'Reservar',
                  handler: () => {
                    this.mostrarDialogoNuevaCita(columna, fila, horario.militar, terapeuta);
                  }
                }
              ]
            });

            await alert.present();
          }
        }
      }

      if (!encontrado) {
        await loading.dismiss();
        await this.mostrarToast('No hay disponibilidad para la duración solicitada', 'warning');
      }

    } catch (error) {
      console.error('Error buscando disponibilidad:', error);
      await loading.dismiss();
      await this.mostrarToast('Error al buscar disponibilidad', 'danger');
    }
  }

  /**
   * Exportar base de datos
   */
  async exportarDatos() {
    try {
      const blob = this.agendaService.exportDatabase();

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agenda_${new Date().getTime()}.sqlite`;
        a.click();
        URL.revokeObjectURL(url);

        await this.mostrarToast('Base de datos exportada', 'success');
      }
    } catch (error) {
      console.error('Error exportando datos:', error);
      await this.mostrarToast('Error al exportar datos', 'danger');
    }
  }

  /**
   * Importar base de datos
   */
  async importarDatos(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    const loading = await this.loadingController.create({
      message: 'Importando datos...'
    });
    await loading.present();

    try {
      const success = await this.agendaService.importDatabase(file);

      if (success) {
        await this.mostrarToast('Datos importados correctamente', 'success');
        await this.cargarAgenda(this.fechaSeleccionada);
      } else {
        await this.mostrarToast('Error al importar datos', 'danger');
      }
    } catch (error) {
      console.error('Error importando datos:', error);
      await this.mostrarToast('Error al importar datos', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Obtiene la clase CSS para una celda
   */
  getCeldaClass(columna: number, fila: number): string {
    const valor = this.mapa[columna]?.[fila];

    if (!valor) return 'celda';
    if (valor === '') return 'celda libre';
    if (valor === 'X') return 'celda ocupado-continua';
    if (valor === 'i') return 'celda inhabil';
    if (valor === 'd') return 'celda deshabilitado';
    if (!isNaN(parseInt(valor))) {
      // Buscar la cita para determinar su status
      const cita = this.reservas.find(r => r.id_agenda === parseInt(valor));
      if (cita) {
        return `celda ${cita.status.toLowerCase()}`;
      }
    }

    return 'celda ocupado';
  }

  /**
   * Obtiene el contenido de una celda
   */
  getCeldaContenido(columna: number, fila: number): string {
    const valor = this.mapa[columna]?.[fila];

    if (!valor || valor === '' || valor === 'X' || valor === 'i' || valor === 'd') {
      return '';
    }

    const idAgenda = parseInt(valor);
    if (!isNaN(idAgenda)) {
      const cita = this.reservas.find(r => r.id_agenda === idAgenda);
      if (cita) {
        return `${cita.cliente}`;
      }
    }

    return '';
  }

  /**
   * Utilidad: obtiene la fecha de hoy en formato YYYY-MM-DD
   */
  obtenerFechaHoy(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  }

  /**
   * Muestra un toast message
   */
  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  /**
   * Obtiene el color de fondo para un status
   */
  getColorStatus(status: string): string {
    const config = this.agendaService.getInfoConfigAgenda();

    const colores: { [key: string]: string } = {
      'Libre': config.color_libre || '#FFFFFF',
      'Reservado': config.color_reservada || '#FFA500',
      'Confirmado': config.color_confirmada || '#00FF00',
      'Cancelado': config.color_cancelada || '#FF0000',
      'Cobrado': config.color_cobrado || '#0000FF',
      'FueraTiempo': config.color_fuera_tiempo || '#808080'
    };

    return colores[status] || '#CCCCCC';
  }

  /**
   * Refresca la agenda
   */
  async refrescar(event: any) {
    await this.cargarAgenda(this.fechaSeleccionada);
    event.target.complete();
  }
}
