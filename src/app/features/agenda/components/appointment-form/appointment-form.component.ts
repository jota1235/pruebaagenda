import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonFooter,
  IonDatetime,
  IonModal,
  ModalController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  checkmarkOutline,
  addOutline,
  trashOutline,
  calendarOutline,
  timeOutline,
  personOutline,
  searchOutline
} from 'ionicons/icons';
import { AgendaService } from '../../../../core/services/agenda.service';
import { DatabaseService } from '../../../../core/services/database.service';
import { Reserva } from '../../../../core/interfaces/agenda.interfaces';

/**
 * Interface para el formulario de cita
 */
export interface AppointmentFormData {
  date: Date;
  time: string;
  clientId?: number;
  clientName: string;
  staffId: number;
  services: AppointmentService[];
  isPromo: boolean;
  notes?: string;
}

/**
 * Interface para servicio en la cita
 */
export interface AppointmentService {
  serviceId: number;
  serviceName: string;
  quantity: number;
  duration: number;
  price?: number;
}

/**
 * Interface para Cliente
 */
export interface Client {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
}

/**
 * Interface para Personal/Staff
 */
export interface Staff {
  id: number;
  name: string;
  active: boolean;
}

/**
 * Interface para Servicio
 */
export interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
}

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
    IonBadge,
    IonFooter,
    IonDatetime,
    IonModal
  ]
})
export class AppointmentFormComponent implements OnInit {
  // Inputs del componente
  @Input() date: Date = new Date();
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() existingAppointment?: Reserva;
  @Input() preselectedStaff?: number;

  // Tabs
  activeTab: 'general' | 'conceptos' = 'general';

  // Selector de fecha/hora
  showDateTimePicker = false;
  selectedDateTime: string = '';
  tempDateTime: string = '';
  minDate: string = '';
  maxDate: string = ''; // Fecha máxima (1 año en el futuro)

  // Selector de hora personalizado
  availableHours: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  selectedHour: number = 9;
  selectedMinute: number = 0;
  selectedPeriod: 'AM' | 'PM' = 'AM';

  // Tab General
  clientSearchQuery = '';
  clientResults: Client[] = [];
  selectedClient: Client | null = null;
  selectedStaffId: number | null = null;

  // Tab Conceptos
  selectedServiceId: number | null = null;
  serviceSearchQuery = '';
  serviceResults: Service[] = [];
  selectedService: Service | null = null;
  serviceQuantity: number = 1;
  serviceDuration: number = 30;
  servicePrice: number = 0;
  addedServices: AppointmentService[] = [];

  // Promo
  isPromo = false;

  // Data from database
  allClients: Client[] = [];
  staffList: Staff[] = [];
  services: Service[] = [];

  durationOptions = [
    { value: 15, label: '00:15 m' },
    { value: 30, label: '00:30 m' },
    { value: 45, label: '00:45 m' },
    { value: 60, label: '01:00 m' },
    { value: 90, label: '01:30 m' },
    { value: 120, label: '02:00 m' }
  ];

  constructor(
    private modalController: ModalController,
    private agendaService: AgendaService,
    private databaseService: DatabaseService,
    private alertController: AlertController
  ) {
    // Registrar iconos
    addIcons({
      closeOutline,
      checkmarkOutline,
      addOutline,
      trashOutline,
      calendarOutline,
      timeOutline,
      personOutline,
      searchOutline
    });
  }

  async ngOnInit() {
    // Configurar fecha mínima (hoy a las 00:00 para permitir todas las horas del día)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.minDate = today.toISOString();

    // Configurar fecha máxima (1 año en el futuro)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    maxDate.setHours(23, 59, 59, 999);
    this.maxDate = maxDate.toISOString();

    // Redondear la fecha inicial a intervalos de 30 minutos
    const minutes = this.date.getMinutes();
    if (minutes !== 0 && minutes !== 30) {
      // Redondear al múltiplo de 30 más cercano
      this.date.setMinutes(minutes < 15 ? 0 : (minutes < 45 ? 30 : 0));
      if (minutes >= 45) {
        this.date.setHours(this.date.getHours() + 1);
      }
    }

    // Inicializar selector de hora personalizado con la hora actual
    this.initializeTimeSelector();

    // Formatear fecha y hora inicial
    this.selectedDateTime = this.formatDateTime(this.date);

    // Load data from database
    await this.loadData();

    // Si estamos en modo edición, poblar el formulario con los datos existentes
    if (this.mode === 'edit' && this.existingAppointment) {
      await this.populateFormForEdit();
    }

    // Si se pasó un staff pre-seleccionado, aplicarlo
    if (this.mode === 'create' && this.preselectedStaff) {
      this.selectedStaffId = this.preselectedStaff;
    }
  }

  /**
   * Cargar datos desde la base de datos
   */
  async loadData() {
    try {
      console.log('🔄 Iniciando carga de datos...');

      // Cargar pacientes/clientes
      console.log('📋 Cargando pacientes...');
      const pacientes = await this.agendaService.getPacientes();
      console.log('📋 Pacientes obtenidos de BD:', pacientes);

      this.allClients = pacientes.map((p: any) => ({
        id: p.id,
        name: p.nombre,
        phone: p.telefono || '',
        email: p.email || ''
      }));
      console.log('📋 Clientes procesados:', this.allClients);

      // Cargar personal
      console.log('👥 Cargando personal...');
      const personal = await this.agendaService.getPersonalAgenda();
      console.log('👥 Personal obtenido de BD:', personal);

      this.staffList = personal.map((p: any) => ({
        id: p.id,
        name: p.nombre,
        active: p.activo === 'SI'
      }));
      console.log('👥 Personal procesado:', this.staffList);

      // Cargar servicios
      console.log('💼 Cargando servicios...');
      const servicios = await this.agendaService.getServicios();
      console.log('💼 Servicios obtenidos de BD:', servicios);

      this.services = servicios.map((s: any) => ({
        id: s.id,
        name: s.nombre,
        duration: s.duracion || 30,
        price: s.precio || 0
      }));
      console.log('💼 Servicios procesados:', this.services);

      console.log('✅ Datos cargados correctamente:', {
        clients: this.allClients.length,
        staff: this.staffList.length,
        services: this.services.length
      });
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
    }
  }

  /**
   * Poblar formulario con datos de cita existente (modo edición)
   */
  async populateFormForEdit() {
    if (!this.existingAppointment) return;

    console.log('✏️ Poblando formulario para editar:', this.existingAppointment);

    // 1. Establecer cliente
    const client = this.allClients.find(c => c.name === this.existingAppointment!.cliente);
    if (client) {
      this.selectedClient = client;
      this.clientSearchQuery = client.name;
    } else {
      // Si no se encuentra en la lista, crear un objeto temporal
      this.selectedClient = {
        id: this.existingAppointment.id_cliente,
        name: this.existingAppointment.cliente
      };
      this.clientSearchQuery = this.existingAppointment.cliente;
    }

    // 2. Establecer personal
    this.selectedStaffId = this.existingAppointment.id_personal;

    // 3. Establecer fecha y hora
    if (this.existingAppointment.fecha) {
      const [year, month, day] = this.existingAppointment.fecha.split('-').map(Number);
      const [hours, minutes] = this.existingAppointment.hora.split(':').map(Number);
      this.date = new Date(year, month - 1, day, hours, minutes);
      this.selectedDateTime = this.formatDateTime(this.date);
    }

    // 4. Cargar servicios de la cita
    // Los servicios vienen en servicios_agenda como texto concatenado
    // Necesitamos obtener los servicios individuales desde tagenda_aux
    try {
      if (this.databaseService.isReady()) {
        // Obtener servicios de tagenda_aux para esta cita usando id_agenda
        const serviciosAux = await this.databaseService.getServiciosDeCita(this.existingAppointment.id_agenda);

        if (serviciosAux && serviciosAux.length > 0) {
          this.addedServices = serviciosAux.map((s: any) => ({
            serviceId: s.id_producto_servicio,
            serviceName: s.servicio_nombre || 'Servicio sin nombre',
            quantity: s.cantidad,
            duration: s.servicio_duracion || 30,
            price: s.costo || 0
          }));

          console.log(`✅ ${this.addedServices.length} servicios cargados para edición`);
        }
      }
    } catch (error) {
      console.error('❌ Error cargando servicios de la cita:', error);
      // Fallback: crear un servicio genérico si no se pueden cargar
      this.addedServices = [{
        serviceId: 0,
        serviceName: this.existingAppointment.servicios_agenda || 'Servicio',
        quantity: 1,
        duration: this.existingAppointment.duracion || 30,
        price: 0
      }];
    }

    console.log('✅ Formulario poblado para edición:', {
      cliente: this.selectedClient.name,
      personal: this.selectedStaffId,
      servicios: this.addedServices.length,
      fecha: this.selectedDateTime
    });
  }

  /**
   * Formatear fecha/hora para mostrar
   */
  formatDateTime(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    // Convertir a formato de 12 horas
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12;
    hours = hours ? hours : 12; // La hora '0' debe ser '12'
    const hoursFormatted = String(hours);

    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} - ${hoursFormatted}:${minutes} ${ampm}`;
  }

  /**
   * Cambiar tab activo
   */
  onTabChange(event: any) {
    this.activeTab = event.detail.value;
  }

  /**
   * Inicializar selector de hora con la hora actual
   */
  initializeTimeSelector() {
    const hours = this.date.getHours();
    const minutes = this.date.getMinutes();

    // Determinar AM/PM
    this.selectedPeriod = hours >= 12 ? 'PM' : 'AM';

    // Convertir hora de 24h a 12h
    let hour12 = hours % 12;
    hour12 = hour12 === 0 ? 12 : hour12;
    this.selectedHour = hour12;

    // Redondear minutos a 00 o 30
    this.selectedMinute = minutes < 30 ? 0 : 30;
  }

  /**
   * Abrir selector de fecha/hora
   */
  openDateTimePicker() {
    this.tempDateTime = this.date.toISOString();
    this.initializeTimeSelector();
    this.showDateTimePicker = true;
  }

  /**
   * Seleccionar hora
   */
  selectHour(hour: number) {
    this.selectedHour = hour;
  }

  /**
   * Seleccionar minuto
   */
  selectMinute(minute: number) {
    this.selectedMinute = minute;
  }

  /**
   * Seleccionar periodo (AM/PM)
   */
  selectPeriod(period: 'AM' | 'PM') {
    this.selectedPeriod = period;
  }

  /**
   * Obtener vista previa de la hora seleccionada
   */
  getSelectedTimePreview(): string {
    const minutesFormatted = String(this.selectedMinute).padStart(2, '0');
    return `${this.selectedHour}:${minutesFormatted} ${this.selectedPeriod}`;
  }

  /**
   * Confirmar fecha/hora seleccionada
   */
  confirmDateTime() {
    if (this.tempDateTime) {
      // Tomar la fecha del datetime picker
      const selectedDate = new Date(this.tempDateTime);

      // Convertir hora de 12h a 24h
      let hours24 = this.selectedHour;
      if (this.selectedPeriod === 'PM' && this.selectedHour !== 12) {
        hours24 += 12;
      } else if (this.selectedPeriod === 'AM' && this.selectedHour === 12) {
        hours24 = 0;
      }

      // Aplicar la hora seleccionada a la fecha
      selectedDate.setHours(hours24, this.selectedMinute, 0, 0);

      // Actualizar la fecha del componente
      this.date = selectedDate;
      this.selectedDateTime = this.formatDateTime(this.date);
    }
    this.showDateTimePicker = false;
  }

  /**
   * Cancelar selección de fecha/hora
   */
  cancelDateTime() {
    this.showDateTimePicker = false;
  }

  /**
   * Cerrar modal de fecha/hora
   */
  closeDateTimePicker() {
    this.showDateTimePicker = false;
  }

  /**
   * Buscar clientes
   */
  searchClients(event: any) {
    const query = event.target.value.toLowerCase().trim();
    this.clientSearchQuery = query;

    if (query.length >= 2) {
      this.clientResults = this.allClients.filter(client =>
        client.name.toLowerCase().includes(query) ||
        (client.phone && client.phone.includes(query))
      );
    } else {
      this.clientResults = [];
    }
  }

  /**
   * Seleccionar cliente
   */
  selectClient(client: Client) {
    this.selectedClient = client;
    this.clientSearchQuery = client.name;
    this.clientResults = [];
  }

  /**
   * Limpiar selección de cliente
   */
  clearClient() {
    this.selectedClient = null;
    this.clientSearchQuery = '';
    this.clientResults = [];
  }

  /**
   * Buscar servicios
   */
  async searchServices(event: any) {
    const query = event.target.value.toLowerCase().trim();
    this.serviceSearchQuery = query;

    if (query.length >= 2) {
      // Buscar en la lista local primero
      this.serviceResults = this.services.filter(service =>
        service.name.toLowerCase().includes(query)
      );

      // Si no hay resultados y SQLite está disponible, buscar en BD
      if (this.serviceResults.length === 0 && this.databaseService.isReady()) {
        try {
          const dbResults = await this.databaseService.searchServicios(query);
          this.serviceResults = dbResults.map((s: any) => ({
            id: s.id,
            name: s.nombre,
            duration: s.duracion || 30,
            price: s.precio || 0
          }));
        } catch (error) {
          console.error('❌ Error buscando servicios:', error);
        }
      }
    } else {
      this.serviceResults = [];
    }
  }

  /**
   * Seleccionar servicio de la lista de resultados
   */
  selectService(service: Service) {
    this.selectedService = service;
    this.serviceSearchQuery = service.name;
    this.serviceDuration = service.duration;
    this.servicePrice = service.price;
    this.serviceResults = [];
  }

  /**
   * Limpiar selección de servicio
   */
  clearService() {
    this.selectedService = null;
    this.serviceSearchQuery = '';
    this.serviceResults = [];
    this.serviceDuration = 30;
    this.servicePrice = 0;
  }

  /**
   * Agregar servicio a la lista
   * Soporta tanto servicios predefinidos como personalizados (texto libre)
   */
  async addService() {
    const serviceName = this.serviceSearchQuery.trim();

    if (!serviceName) {
      return;
    }

    let serviceId: number;
    let servicePrice = this.servicePrice;

    // Si hay un servicio seleccionado de la lista, usar ese
    if (this.selectedService) {
      serviceId = this.selectedService.id;
      servicePrice = this.selectedService.price;
    } else {
      // Es un servicio personalizado (texto libre)
      // Crear el servicio en la BD
      if (this.databaseService.isReady()) {
        console.log(`🆕 Creando servicio personalizado: "${serviceName}"`);

        try {
          serviceId = await this.databaseService.addServicio({
            nombre: serviceName,
            n_duracion: this.serviceDuration,
            precio: servicePrice
          });

          // Agregar a la lista local para futuras búsquedas
          this.services.push({
            id: serviceId,
            name: serviceName,
            duration: this.serviceDuration,
            price: servicePrice
          });
        } catch (error) {
          console.error('❌ Error creando servicio personalizado:', error);
          return;
        }
      } else {
        // Si SQLite no está disponible, usar ID temporal
        serviceId = Date.now();
      }
    }

    const appointmentService: AppointmentService = {
      serviceId: serviceId,
      serviceName: serviceName,
      quantity: this.serviceQuantity,
      duration: this.serviceDuration,
      price: servicePrice
    };

    this.addedServices.push(appointmentService);

    // Resetear formulario de servicio
    this.clearService();
    this.serviceQuantity = 1;
    this.serviceDuration = 30;
    this.servicePrice = 0;
  }

  /**
   * Eliminar servicio de la lista
   */
  removeService(service: AppointmentService) {
    const index = this.addedServices.indexOf(service);
    if (index > -1) {
      this.addedServices.splice(index, 1);
    }
  }

  /**
   * Calcular duración total
   */
  get totalDuration(): number {
    return this.addedServices.reduce((total, item) => {
      return total + (item.duration * item.quantity);
    }, 0);
  }

  /**
   * Calcular precio total
   */
  get totalPrice(): number {
    return this.addedServices.reduce((total, item) => {
      return total + ((item.price || 0) * item.quantity);
    }, 0);
  }

  /**
   * Validar formulario
   */
  isFormValid(): boolean {
    const isValid = (
      this.selectedClient !== null &&
      this.selectedStaffId !== null &&
      this.addedServices.length > 0
    );

    // Debug temporal - solo loggear una vez cada 2 segundos
    if (!isValid && !this._lastValidationLog || Date.now() - this._lastValidationLog > 2000) {
      this._lastValidationLog = Date.now();
      console.log('🔴 Formulario inválido:');
      console.log('  - Cliente seleccionado:', this.selectedClient !== null, this.selectedClient);
      console.log('  - Personal seleccionado:', this.selectedStaffId !== null, this.selectedStaffId);
      console.log('  - Servicios agregados:', this.addedServices.length > 0, this.addedServices.length, 'servicios');
    }

    return isValid;
  }

  private _lastValidationLog = 0;

  /**
   * Guardar cita
   */
  async saveAppointment() {
    if (!this.isFormValid()) {
      console.log('Formulario inválido');
      // TODO: Mostrar alerta de validación
      return;
    }

    const formData: AppointmentFormData = {
      date: this.date,
      time: this.selectedDateTime,
      clientId: this.selectedClient!.id,
      clientName: this.selectedClient!.name,
      staffId: this.selectedStaffId!,
      services: this.addedServices,
      isPromo: this.isPromo
    };

    console.log('💾 Guardando cita:', formData);

    try {
      // Guardar en SQLite usando el nuevo formato compatible con syserv
      if (this.databaseService.isReady()) {
        // Formatear fecha y hora para SQLite
        const fecha = this.formatDateForSQL(this.date);
        const hora = this.formatTimeForSQL(this.date);

        // Calcular duración total en minutos
        const duracion_total_minutos = this.addedServices.reduce(
          (sum, s) => sum + (s.duration * s.quantity),
          0
        );

        // Preparar array de servicios con precio
        const servicios = this.addedServices.map(s => ({
          id_servicio: s.serviceId,
          cantidad: s.quantity,
          costo: s.price || 0
        }));

        console.log(`📊 Total de servicios: ${servicios.length}`);
        console.log(`⏱️  Duración total: ${duracion_total_minutos} minutos`);

        if (this.mode === 'edit' && this.existingAppointment) {
          // MODO EDICIÓN: Actualizar cita existente
          console.log(`✏️  Actualizando cita ID: ${this.existingAppointment.id_agenda}`);

          const updated = await this.databaseService.updateCitaTagenda(
            this.existingAppointment.id_agenda,
            {
              handel: 1,
              id_empresa_base: 1,
              id_cliente: this.selectedClient!.id!,
              id_personal: this.selectedStaffId!,
              fecha: fecha,
              hora: hora,
              duracion_minutos: duracion_total_minutos,
              servicios: servicios,
              status: this.existingAppointment.status || 'Reservado',
              notas: this.existingAppointment.notas || ''
            }
          );

          if (updated) {
            console.log(`✅ Cita actualizada exitosamente`);
            console.log(`   - 1 registro actualizado en tagenda`);
            console.log(`   - ${servicios.length} registros actualizados en tagenda_aux`);
          } else {
            throw new Error('No se pudo actualizar la cita');
          }

        } else {
          // MODO CREACIÓN: Guardar nueva cita
          console.log('📱 Guardando nueva cita en tagenda (compatible syserv)...');

          const citaId = await this.databaseService.addCitaTagenda({
            handel: 1,
            id_empresa_base: 1,
            id_cliente: this.selectedClient!.id!,
            id_personal: this.selectedStaffId!,
            fecha: fecha,
            hora: hora,
            duracion_minutos: duracion_total_minutos,
            servicios: servicios,
            status: 'Reservado',
            notas: ''
          });

          console.log(`✅ Cita guardada en tagenda con ID: ${citaId}`);
          console.log(`   - 1 registro en tagenda`);
          console.log(`   - ${servicios.length} registros en tagenda_aux`);
          console.log(`   - Duración: ${duracion_total_minutos} min → slots calculados automáticamente`);
        }

      } else {
        console.log('💾 SQLite no disponible, guardando en localStorage...');
        // TODO: Implementar guardado en localStorage como fallback
      }

      // Cerrar modal con confirmación
      this.modalController.dismiss(formData, 'confirm');

    } catch (error: any) {
      console.error('❌ Error guardando cita:', error);

      // Mostrar alerta de error al usuario
      const alert = await this.alertController.create({
        header: 'Error al guardar cita',
        message: error.message || 'Ocurrió un error al guardar la cita. Por favor, intente nuevamente.',
        buttons: ['OK']
      });

      await alert.present();
    }
  }

  /**
   * Formatear fecha para SQL (YYYY-MM-DD)
   */
  private formatDateForSQL(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Formatear hora para SQL (HH:MM)
   */
  private formatTimeForSQL(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Cerrar modal
   */
  closeModal() {
    this.modalController.dismiss(null, 'cancel');
  }

  /**
   * Toggle promo
   */
  togglePromo() {
    this.isPromo = !this.isPromo;
  }
}
