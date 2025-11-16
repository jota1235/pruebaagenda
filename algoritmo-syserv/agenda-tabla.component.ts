import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AgendaService } from './agenda.service';
import { AgendaPrivilegiosService } from './agenda-privilegios.service';
import { Reserva, HorarioAgenda, Terapeuta, ConfigAgenda } from './agenda.interfaces';

/**
 * Interfaz para datos de celda procesados
 */
interface DatosCelda {
  idReg: number;
  cliente: string;
  tel1: string;
  tel2: string;
  idPersonal: number;
  notas: string;
  hora: string;
  spacio: number;
  status: string;
  idCliente: number;
  email: string;
  duracion: number;
  notas2: string;
  banCita: number;
  banLiquidCredito: number;
  serviciosAgenda: string;
  aliasPersonal: string;
  backgroundColor: string;
  contenidoHTML: string;
  rowspan: number;
  visible: boolean;
}

/**
 * Componente de Tabla de Agenda
 * Renderiza la tabla HTML de la agenda con todas las citas, horarios y terapeutas
 * Traducido desde listar_calendario.php
 */
@Component({
  selector: 'app-agenda-tabla',
  templateUrl: './agenda-tabla.component.html',
  styleUrls: ['./agenda-tabla.component.scss']
})
export class AgendaTablaComponent implements OnInit {

  @Input() fecha: string = '';
  @Input() diasClientePremium: number = 365;

  @Output() celdaClick = new EventEmitter<DatosCelda>();
  @Output() celdaDblClick = new EventEmitter<DatosCelda>();

  // Datos de la agenda
  horarios: HorarioAgenda[] = [];
  terapeutas: Terapeuta[] = [];
  config: ConfigAgenda | any = {};
  reservas: Reserva[] = [];
  mapa: string[][] = [];

  // Datos procesados para renderizado
  matrizCeldas: DatosCelda[][] = [];
  encabezados: any[] = [];

  // Control de visualización
  columnaUsuarioActual: number = -1;
  nombreEncontrado: boolean = false;
  cron: string = '+';
  cantidadColumnas: number = 0;

  // Estados
  cargando: boolean = false;
  errorCarga: string = '';

  // Contenido auxiliar
  fechaLarga: string = '';
  posColumnas: string = '';

  constructor(
    private agendaService: AgendaService,
    private privilegiosService: AgendaPrivilegiosService
  ) {}

  async ngOnInit() {
    if (this.fecha) {
      await this.cargarDatos();
    }
  }

  /**
   * Carga todos los datos necesarios para renderizar la tabla
   */
  async cargarDatos() {
    this.cargando = true;
    this.errorCarga = '';

    try {
      // Configurar fecha
      this.agendaService.setFechaAg(this.fecha);
      this.agendaService.setValidHorario(false);

      // Generar mapa de reservaciones
      this.reservas = this.agendaService.MapaAgenda();

      // Obtener configuración
      this.config = this.agendaService.getInfoConfigAgenda();
      this.horarios = this.agendaService.getInfoHorarios(true) as HorarioAgenda[];
      this.terapeutas = this.agendaService.getInfoColsTerapeutas();
      this.mapa = this.agendaService.getArrMapa();
      this.posColumnas = this.agendaService.getPosColums();

      // Leer clientes premium si tiene privilegio
      if (this.privilegiosService.debeMarcarClientesPremium()) {
        // Implementar lectura de clientes premium
      }

      // Calcular cron (fecha actual vs fecha seleccionada)
      this.cron = this.calcularCron();

      // Verificar privilegio para modificar fechas anteriores
      if (this.privilegiosService.puedeModificarFechasAnteriores()) {
        this.cron = '+';
      }

      // Procesar datos
      this.procesarDatos();

      // Generar fecha larga
      this.generarFechaLarga();

    } catch (error) {
      console.error('Error cargando datos de agenda:', error);
      this.errorCarga = 'Error al cargar los datos de la agenda';
    } finally {
      this.cargando = false;
    }
  }

  /**
   * Calcula si la fecha es pasada (-) o futura (+)
   */
  private calcularCron(): string {
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    const fechaSeleccionada = new Date(this.fecha);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    return fechaSeleccionada >= fechaActual ? '+' : '-';
  }

  /**
   * Genera la fecha en formato largo (Lun. 15 de Ene. 2025)
   */
  private generarFechaLarga(): void {
    const dias = ['', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.', 'Dom.'];
    const meses = ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sept.', 'Oct.', 'Nov.', 'Dic.'];

    const fecha = new Date(this.fecha);
    const diaSemana = dias[fecha.getDay() === 0 ? 7 : fecha.getDay()];
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();

    this.fechaLarga = `${diaSemana} ${dia} de ${mes} ${anio}`;
  }

  /**
   * Formatea el período de cliente premium
   */
  private formatearPeriodoClientePremium(dias: number): string {
    if (dias >= 1 && dias <= 29) {
      return `${dias} Días`;
    } else if (dias === 30) {
      return '1 Mes';
    } else if (dias > 30 && dias <= 364) {
      return `${(dias / 30).toFixed(2)} Meses`;
    } else if (dias === 365) {
      return '1 Año';
    } else {
      return `${(dias / 365).toFixed(2)} Años`;
    }
  }

  /**
   * Procesa todos los datos y genera la matriz de celdas
   */
  private procesarDatos(): void {
    // Determinar cantidad de columnas
    this.calcularCantidadColumnas();

    // Generar encabezados
    this.generarEncabezados();

    // Generar matriz de celdas
    this.generarMatrizCeldas();
  }

  /**
   * Calcula la cantidad total de columnas a mostrar
   */
  private calcularCantidadColumnas(): void {
    const maxEspacio = this.obtenerMaximoEspacio();

    if (this.config.cantColsFijas === 0) {
      const totalTerapeutas = this.terapeutas.length + this.config.col_aux;
      this.cantidadColumnas = Math.max(maxEspacio, totalTerapeutas);
    } else {
      this.cantidadColumnas = this.config.cantColsFijas;
    }

    if (this.cantidadColumnas === 0) {
      this.cantidadColumnas = 1;
    }
  }

  /**
   * Obtiene el máximo espacio ocupado por las reservas
   */
  private obtenerMaximoEspacio(): number {
    let max = 0;

    this.reservas.forEach(reserva => {
      if (reserva.columna_ag > max && reserva.status !== 'Cancelado') {
        max = reserva.columna_ag;
      }
    });

    return max + 1;
  }

  /**
   * Genera los encabezados de columnas
   */
  private generarEncabezados(): void {
    this.encabezados = [];
    let nComodin = 0;

    const soloAgendaPropia = this.privilegiosService.soloAgendaPropia();
    const idUsuario = this.privilegiosService.getIdUsuario();
    const usuarioActual = this.privilegiosService.getUsuario();

    if (this.config.vizNombreTerapeuta && this.terapeutas.length > 0) {
      for (let col = 0; col < this.cantidadColumnas; col++) {
        const terapeuta = this.terapeutas[col];

        if (terapeuta) {
          // Verificar si es columna del usuario actual
          let mostrar = true;

          if (soloAgendaPropia) {
            if (terapeuta.alias === usuarioActual) {
              this.columnaUsuarioActual = col;
              this.nombreEncontrado = true;
            } else {
              mostrar = false;
            }
          } else {
            this.nombreEncontrado = true;
          }

          if (mostrar) {
            this.encabezados.push({
              tipo: 'terapeuta',
              label: terapeuta.alias.toLowerCase(),
              columna: col,
              mostrarAgregar: col === this.cantidadColumnas - 1 && this.privilegiosService.puedeEditarColumnas()
            });
          }
        } else {
          if (!soloAgendaPropia) {
            nComodin++;
            this.encabezados.push({
              tipo: 'comodin',
              label: `Comodín ${nComodin}`,
              columna: col,
              mostrarAgregar: col === this.cantidadColumnas - 1 && this.privilegiosService.puedeEditarColumnas()
            });
          }
        }
      }
    } else {
      // Columnas fijas
      const nombresColumnas = this.config.Filas ? this.config.Filas.split('|') : [];

      if (nombresColumnas.length > 1) {
        nombresColumnas.forEach((nombre, col) => {
          this.encabezados.push({
            tipo: 'fija',
            label: nombre,
            columna: col,
            mostrarAgregar: false
          });
        });
      }
    }
  }

  /**
   * Genera la matriz completa de celdas
   */
  private generarMatrizCeldas(): void {
    this.matrizCeldas = [];

    const vectorControl: { [key: number]: number } = {};
    const vectorOcupado: { [key: number]: boolean } = {};

    // Inicializar vectores de control
    for (let col = 0; col <= 75; col++) {
      vectorControl[col] = 1;
      vectorOcupado[col] = false;
    }

    // Procesar reservas y crear matriz de búsqueda rápida
    const matrizReservas: { [key: string]: Reserva } = {};
    this.reservas.forEach(reserva => {
      const key = `${reserva.hora_ag}_${reserva.columna_ag}`;
      matrizReservas[key] = reserva;
    });

    // Generar cada fila
    this.horarios.forEach((horario, fila) => {
      const filaCeldas: DatosCelda[] = [];

      for (let col = 0; col < this.cantidadColumnas; col++) {
        // Verificar si debe mostrar esta columna
        if (this.columnaUsuarioActual === -1 || this.columnaUsuarioActual === col) {
          const key = `${horario.militar}_${col}`;
          const reserva = matrizReservas[key];

          const celda = this.procesarCelda(
            horario,
            col,
            fila,
            reserva,
            vectorControl,
            vectorOcupado
          );

          filaCeldas.push(celda);
        }
      }

      this.matrizCeldas.push(filaCeldas);
    });
  }

  /**
   * Procesa una celda individual
   */
  private procesarCelda(
    horario: HorarioAgenda,
    col: number,
    fila: number,
    reserva: Reserva | undefined,
    vectorControl: { [key: number]: number },
    vectorOcupado: { [key: number]: boolean }
  ): DatosCelda {
    // Datos por defecto
    let celda: DatosCelda = {
      idReg: 0,
      cliente: '',
      tel1: '',
      tel2: '',
      idPersonal: 0,
      notas: '',
      hora: horario.militar,
      spacio: col,
      status: this.config.disponibilidad.dia_habil ? 'Libre' : 'FueraTiempo',
      idCliente: 0,
      email: '',
      duracion: 1,
      notas2: '',
      banCita: 0,
      banLiquidCredito: 0,
      serviciosAgenda: '',
      aliasPersonal: '',
      backgroundColor: '',
      contenidoHTML: '',
      rowspan: 1,
      visible: true
    };

    // Si hay reserva, llenar datos
    if (reserva) {
      celda.idReg = reserva.id_agenda;
      celda.cliente = reserva.cliente;
      celda.tel1 = reserva.tel1 || '';
      celda.tel2 = reserva.tel2 || '';
      celda.idPersonal = reserva.id_personal;
      celda.notas = reserva.notas;
      celda.status = reserva.status;
      celda.idCliente = reserva.id_cliente;
      celda.email = reserva.email1 || '';
      celda.duracion = reserva.duracion;
      celda.notas2 = reserva.notas2;
      celda.banCita = reserva.ban_cita;
      celda.banLiquidCredito = reserva.ban_liquid_credito;
      celda.serviciosAgenda = reserva.servicios_agenda || '';
      celda.aliasPersonal = reserva.alias_personal;
    }

    // Combinar notas
    if (celda.notas && celda.notas2) {
      celda.notas2 = `${celda.notas2}<br><b>${celda.notas}</b>`;
    } else if (celda.notas) {
      celda.notas2 = celda.notas;
    }

    // Control de rowspan
    if (!vectorOcupado[col] &&
        (celda.status === 'Reservado' || celda.status === 'Confirmado' || celda.status === 'Cobrado')) {
      vectorControl[col] = celda.duracion;

      if (celda.duracion > 1) {
        vectorOcupado[col] = true;
        celda.rowspan = celda.duracion;
      }
    }

    // Verificar si la celda debe ocultarse (es parte de un rowspan)
    if (vectorOcupado[col] && celda.rowspan === 1) {
      celda.visible = false;
    }

    // Decrementar control de rowspan
    if (vectorOcupado[col]) {
      vectorControl[col]--;
      if (vectorControl[col] <= 0) {
        vectorOcupado[col] = false;
      }
    }

    // Aplicar privilegios y controles
    celda = this.aplicarPrivilegiosCelda(celda);

    // Control de días pasados
    if (this.cron === '-') {
      if (celda.status === 'Libre') {
        celda.status = 'FueraTiempo';
      }
      if (celda.status !== 'Cobrado') {
        celda.status = 'FueraTiempo';
      }
    }

    // Generar contenido HTML
    celda.contenidoHTML = this.generarContenidoCelda(celda);

    // Determinar color de fondo
    celda.backgroundColor = this.obtenerColorStatus(celda.status);

    // Resaltar empleado solicitado
    if (celda.banCita === 1 &&
        this.privilegiosService.debeMarcarEmpleadoSolicitado() &&
        celda.aliasPersonal &&
        celda.status === 'Confirmado') {
      celda.backgroundColor = '#58ACFA';
    }

    return celda;
  }

  /**
   * Aplica privilegios y controles a una celda
   */
  private aplicarPrivilegiosCelda(celda: DatosCelda): DatosCelda {
    const idUsuario = this.privilegiosService.getIdUsuario();
    const soloAgendaPropia = this.privilegiosService.soloAgendaPropia();

    // Si el usuario tiene agenda propia y no es su celda
    if (soloAgendaPropia && idUsuario !== celda.idPersonal && celda.status !== 'Libre') {
      celda.status = 'FueraTiempo';
      return celda;
    }

    // Verificar permisos según encontró su nombre
    if (this.nombreEncontrado) {
      if (celda.status === 'Libre' || celda.status === 'Cancelado') {
        if (!this.privilegiosService.puedeCrearCitas()) {
          celda.status = 'FueraTiempo';
        }
      } else {
        if (!this.privilegiosService.puedeEditarCitas()) {
          celda.status = 'FueraTiempo';
        }
      }
    } else {
      if (soloAgendaPropia) {
        celda.status = 'FueraTiempo';
      } else {
        if (celda.status === 'Libre' || celda.status === 'Cancelado') {
          if (!this.privilegiosService.puedeCrearCitas()) {
            celda.status = 'FueraTiempo';
          }
        } else {
          if (!this.privilegiosService.puedeEditarCitas()) {
            celda.status = 'FueraTiempo';
          }
        }
      }
    }

    return celda;
  }

  /**
   * Genera el contenido HTML de una celda
   */
  private generarContenidoCelda(celda: DatosCelda): string {
    let html = '<div class="celda-contenido">';

    // ID de reservación
    if (celda.status !== 'FueraTiempo' && celda.idReg) {
      html += `<div class="celda-id">${celda.idReg}</div>`;
    }

    // Marca de cliente premium (implementar según necesidad)
    // if (esClientePremium) { ... }

    // Nombre del cliente
    if (celda.status !== 'FueraTiempo' && celda.cliente) {
      const colorCliente = celda.status === 'Cobrado' ? '#F6CECE' : 'black';
      html += `<div class="celda-cliente" style="color: ${colorCliente}">${celda.cliente}</div>`;
    }

    // Teléfono
    if (celda.tel1 && !this.privilegiosService.debeOcultarCelular()) {
      html += `<div class="celda-tel">${celda.tel1}</div>`;
    }

    // Servicios
    if (celda.serviciosAgenda) {
      html += `<div class="celda-servicios">${celda.serviciosAgenda}</div>`;
    }

    // Nombre del empleado
    if (celda.idPersonal && celda.aliasPersonal) {
      const colorEmpleado = celda.status === 'Cobrado' ? '#F5A9A9' : 'red';
      const nombreEmpleado = celda.aliasPersonal.toUpperCase();

      if (celda.banCita === 1 && nombreEmpleado && celda.status !== 'Cancelado') {
        html += `<div class="celda-empleado-solicitado">${nombreEmpleado}</div>`;
      } else {
        html += `<div class="celda-empleado" style="color: ${colorEmpleado}">${nombreEmpleado}</div>`;
      }
    }

    // Notas
    if (celda.notas2) {
      if (celda.status !== 'FueraTiempo') {
        html += `<div class="celda-notas">${celda.notas2}</div>`;
      } else {
        html += `<div class="celda-notas celda-notas-bloqueado">${celda.notas2}</div>`;
      }
    }

    // Etiqueta de crédito liquidado
    if (celda.banLiquidCredito === 1) {
      html += '<div class="celda-etiqueta">Liquidado</div>';
    }

    html += '</div>';

    return html;
  }

  /**
   * Obtiene el color de fondo según el status
   */
  private obtenerColorStatus(status: string): string {
    const config = this.agendaService.getInfoConfigAgenda();

    const colores: { [key: string]: string } = {
      'Libre': config.color_libre || '#FFFFFF',
      'Reservado': config.color_reservada || '#FFA500',
      'Confirmado': config.color_confirmada || '#00FF00',
      'Cancelado': config.color_cancelada || '#FF0000',
      'Cobrado': config.color_cobrado || '#0000FF',
      'FueraTiempo': config.color_fuera_tiempo || '#808080'
    };

    return colores[status] || '#FFFFFF';
  }

  /**
   * Maneja el clic en una celda
   */
  onCeldaClick(celda: DatosCelda): void {
    this.celdaClick.emit(celda);
  }

  /**
   * Maneja el doble clic en una celda
   */
  onCeldaDblClick(celda: DatosCelda): void {
    this.celdaDblClick.emit(celda);
  }

  /**
   * Determina si una fila debe tener línea inferior
   */
  debeSubrayarFila(horario: HorarioAgenda): boolean {
    return horario.mark && this.config.minutos_incremento < 60;
  }

  /**
   * Recarga los datos de la tabla
   */
  async recargar(): Promise<void> {
    await this.cargarDatos();
  }
}
