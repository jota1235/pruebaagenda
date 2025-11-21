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
  ModalController
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

  // Tabs
  activeTab: 'general' | 'conceptos' = 'general';

  // Selector de fecha/hora
  showDateTimePicker = false;
  selectedDateTime: string = '';
  tempDateTime: string = '';
  minDate: string = '';
  minuteValues: number[] = [0, 30]; // Solo 00 y 30 minutos
  hourValues: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // Todas las horas en formato 12h

  // Tab General
  clientSearchQuery = '';
  clientResults: Client[] = [];
  selectedClient: Client | null = null;
  selectedStaffId: number | null = null;

  // Tab Conceptos
  selectedServiceId: number | null = null;
  serviceQuantity: number = 1;
  serviceDuration: number = 30;
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
    private databaseService: DatabaseService
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

    // Redondear la fecha inicial a intervalos de 30 minutos
    const minutes = this.date.getMinutes();
    if (minutes !== 0 && minutes !== 30) {
      // Redondear al múltiplo de 30 más cercano
      this.date.setMinutes(minutes < 15 ? 0 : (minutes < 45 ? 30 : 0));
      if (minutes >= 45) {
        this.date.setHours(this.date.getHours() + 1);
      }
    }

    // Formatear fecha y hora inicial
    this.selectedDateTime = this.formatDateTime(this.date);

    // Load data from database
    await this.loadData();
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
   * Abrir selector de fecha/hora
   */
  openDateTimePicker() {
    this.tempDateTime = this.date.toISOString();
    this.showDateTimePicker = true;
  }

  /**
   * Confirmar fecha/hora seleccionada
   */
  confirmDateTime() {
    if (this.tempDateTime) {
      this.date = new Date(this.tempDateTime);

      // Asegurar que los minutos sean 0 o 30
      const minutes = this.date.getMinutes();
      if (minutes !== 0 && minutes !== 30) {
        // Redondear al múltiplo de 30 más cercano
        this.date.setMinutes(minutes < 15 ? 0 : (minutes < 45 ? 30 : 0));
        if (minutes >= 45) {
          this.date.setHours(this.date.getHours() + 1);
        }
      }

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
   * Agregar servicio a la lista
   */
  addService() {
    if (!this.selectedServiceId) {
      return;
    }

    const service = this.services.find(s => s.id === this.selectedServiceId);
    if (!service) {
      return;
    }

    const appointmentService: AppointmentService = {
      serviceId: service.id,
      serviceName: service.name,
      quantity: this.serviceQuantity,
      duration: this.serviceDuration,
      price: service.price
    };

    this.addedServices.push(appointmentService);

    // Resetear formulario de servicio
    this.selectedServiceId = null;
    this.serviceQuantity = 1;
    this.serviceDuration = 30;
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
    return (
      this.selectedClient !== null &&
      this.selectedStaffId !== null &&
      this.addedServices.length > 0
    );
  }

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
      // Guardar en SQLite (una cita por cada servicio)
      if (this.databaseService.isReady()) {
        console.log('📱 Guardando en SQLite...');

        // Formatear fecha y hora para SQLite
        const fecha = this.formatDateForSQL(this.date);
        const hora = this.formatTimeForSQL(this.date);

        for (const service of this.addedServices) {
          const citaData = {
            handel: 1,
            id_empresa_base: 1,
            id_cliente: this.selectedClient!.id,
            id_personal: this.selectedStaffId!,
            id_servicio: service.serviceId,
            fecha: fecha,
            hora: hora,
            duracion: service.duration,
            status: 'Reservado',
            notas: ''
          };

          const citaId = await this.databaseService.addCita(citaData);
          console.log(`✅ Cita guardada en SQLite con ID: ${citaId}`, citaData);
        }

        console.log('✅ Todas las citas guardadas correctamente en SQLite');
      } else {
        console.log('💾 SQLite no disponible, guardando en localStorage...');
        // TODO: Implementar guardado en localStorage como fallback
      }

      // Cerrar modal con confirmación
      this.modalController.dismiss(formData, 'confirm');

    } catch (error) {
      console.error('❌ Error guardando cita:', error);
      // TODO: Mostrar alerta de error
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
