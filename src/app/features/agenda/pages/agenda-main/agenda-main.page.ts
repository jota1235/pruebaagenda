import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonBadge,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  ActionSheetController,
  ModalController
} from '@ionic/angular/standalone';
import { CalendarModalComponent, CalendarModalResult } from '../../components/calendar-modal/calendar-modal.component';
import { AppointmentFormComponent, AppointmentFormData } from '../../components/appointment-form/appointment-form.component';
import { AgendaService } from '../../../../core/services/agenda.service';
import { ConfigAgenda, Reserva } from '../../../../core/interfaces/agenda.interfaces';
import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  ellipsisVerticalOutline,
  addOutline,
  calendarOutline,
  peopleOutline,
  documentTextOutline,
  megaphoneOutline,
  storefrontOutline,
  homeOutline,
  settingsOutline,
  helpCircleOutline,
  closeOutline,
  locationOutline,
  callOutline,
  mailOutline,
  globeOutline,
  checkmarkCircleOutline,
  starOutline,
  cashOutline,
  cutOutline,
  colorPaletteOutline,
  handLeftOutline,
  footstepsOutline,
  happyOutline,
  brushOutline
} from 'ionicons/icons';

interface TimeSlot {
  time: string;
  displayTime: string;
  period: string;
  isEmpty: boolean;
  appointment?: any;
}

interface DayOption {
  day: string;
  date: number;
  month: number;
  year: number;
  fullDate: Date;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
}

@Component({
  selector: 'app-agenda-main',
  templateUrl: './agenda-main.page.html',
  styleUrls: ['./agenda-main.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    IonBadge,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonGrid,
    IonRow,
    IonCol,
    IonChip
  ]
})
export class AgendaMainPage implements OnInit {
  // Estados de carga
  isLoading = true;
  showContent = false;

  // Notificaciones
  notificationCount = 1;

  // Horario
  currentDay = 'Hoy';
  currentHours = '10:00 a.m. - 7:00 p.m.';

  // Días del mes (se generará dinámicamente en initializeAgenda)
  monthDays: DayOption[] = [];

  // Timeline de horas
  timeSlots: TimeSlot[] = [];

  // Tab activo en bottom navigation
  activeTab = 'appointments';

  // Datos del negocio (mismo contenido que profile)
  businessInfo = {
    name: 'Salón Belleza & Estilo',
    logo: 'https://via.placeholder.com/150/3B82F6/FFFFFF?text=BE',
    description: 'Tu salón de confianza con más de 10 años de experiencia ofreciendo servicios de belleza y estética de la más alta calidad.',
    address: 'Av. Principal 123, Col. Centro, Ciudad de México',
    phone: '+52 55 1234 5678',
    email: 'contacto@bellezaestilo.com',
    website: 'www.bellezaestilo.com',
    status: 'Abierto ahora'
  };

  stats = [
    { icon: 'calendar-outline', value: '245', label: 'Citas este mes', color: 'primary' },
    { icon: 'people-outline', value: '128', label: 'Clientes activos', color: 'secondary' },
    { icon: 'star-outline', value: '4.8', label: 'Calificación', color: 'warning' },
    { icon: 'cash-outline', value: '$45K', label: 'Ingresos del mes', color: 'success' }
  ];

  businessHours = [
    { day: 'Lunes', hours: '9:00 a.m. - 8:00 p.m.', isToday: false },
    { day: 'Martes', hours: '9:00 a.m. - 8:00 p.m.', isToday: false },
    { day: 'Miércoles', hours: '9:00 a.m. - 8:00 p.m.', isToday: false },
    { day: 'Jueves', hours: '9:00 a.m. - 8:00 p.m.', isToday: false },
    { day: 'Viernes', hours: '9:00 a.m. - 8:00 p.m.', isToday: true },
    { day: 'Sábado', hours: '10:00 a.m. - 6:00 p.m.', isToday: false },
    { day: 'Domingo', hours: 'Cerrado', isToday: false }
  ];

  services = [
    { name: 'Corte de Cabello', icon: 'cut-outline' },
    { name: 'Tinte y Color', icon: 'color-palette-outline' },
    { name: 'Manicure', icon: 'hand-left-outline' },
    { name: 'Pedicure', icon: 'footsteps-outline' },
    { name: 'Tratamientos Faciales', icon: 'happy-outline' },
    { name: 'Maquillaje', icon: 'brush-outline' }
  ];

  // Fecha seleccionada actualmente
  selectedDate: Date = new Date();

  // Configuración de agenda desde BD
  agendaConfig?: ConfigAgenda;

  // Citas del día
  appointments: Reserva[] = [];

  constructor(
    private router: Router,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private agendaService: AgendaService
  ) {
    // Registrar iconos
    addIcons({
      notificationsOutline,
      ellipsisVerticalOutline,
      addOutline,
      calendarOutline,
      peopleOutline,
      documentTextOutline,
      megaphoneOutline,
      storefrontOutline,
      homeOutline,
      settingsOutline,
      helpCircleOutline,
      closeOutline,
      locationOutline,
      callOutline,
      mailOutline,
      globeOutline,
      checkmarkCircleOutline,
      starOutline,
      cashOutline,
      cutOutline,
      colorPaletteOutline,
      handLeftOutline,
      footstepsOutline,
      happyOutline,
      brushOutline
    });
  }

  ngOnInit() {
    // Simular carga inicial
    this.initializeAgenda();
  }

  /**
   * Inicializar agenda con animación de carga
   */
  async initializeAgenda() {
    try {
      // 1. Configurar el handel (sucursal) y empresa
      this.agendaService.handel = 1;
      this.agendaService.id_empresa_base = 1;

      // 2. Cargar configuración de agenda
      const fecha = this.formatDateSQL(new Date());
      const configLoaded = await this.agendaService.readConfigAgenda(fecha);

      if (configLoaded) {
        this.agendaConfig = this.agendaService.getInfoConfigAgenda();
        console.log('✅ Configuración de agenda cargada:', this.agendaConfig);

        // Actualizar horario del día
        this.updateBusinessHours();
      } else {
        console.warn('⚠️ No se pudo cargar la configuración de agenda');
      }

      // 3. Inicializar con la fecha actual (Hoy)
      this.selectedDate = new Date();
      this.updateViewForSelectedDate(this.selectedDate);

      // 4. Cargar citas del día
      await this.loadAppointmentsForDate(this.selectedDate);

      // 5. Generar timeline con datos reales
      this.generateTimeSlots();

      // Mostrar contenido con animación
      this.isLoading = false;
      setTimeout(() => {
        this.showContent = true;
      }, 100);
    } catch (error) {
      console.error('❌ Error inicializando agenda:', error);
      this.isLoading = false;
      this.showContent = true;
    }
  }

  /**
   * Cargar citas para una fecha específica
   */
  async loadAppointmentsForDate(date: Date) {
    try {
      const fecha = this.formatDateSQL(date);

      // Establecer la fecha en el servicio ANTES de cargar las citas
      this.agendaService.setFechaAg(fecha);

      // Usar MapaAgenda para obtener todas las citas mapeadas de esa fecha
      this.appointments = await this.agendaService.MapaAgenda(false);
    } catch (error) {
      console.error('Error cargando citas:', error);
      this.appointments = [];
    }
  }

  /**
   * Actualizar horarios del negocio desde configuración
   */
  updateBusinessHours() {
    if (!this.agendaConfig) return;

    const horaInicio = this.agendaConfig.hora_inicio;
    const horaFin = this.agendaConfig.hora_fin;

    this.currentHours = `${this.formatHora(horaInicio)}:00 - ${this.formatHora(horaFin)}:00`;
  }

  /**
   * Formatear hora en formato de 12 horas
   */
  formatHora(hora: number): string {
    const period = hora >= 12 ? 'p.m.' : 'a.m.';
    const hora12 = hora > 12 ? hora - 12 : hora === 0 ? 12 : hora;
    return `${hora12}:00 ${period}`;
  }

  /**
   * Formatear fecha en formato SQL (YYYY-MM-DD)
   */
  formatDateSQL(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Generar slots de tiempo para el timeline basado en configuración real
   */
  generateTimeSlots() {
    this.timeSlots = [];

    if (!this.agendaConfig) {
      console.warn('⚠️ No hay configuración de agenda disponible');
      return;
    }

    const horaInicio = this.agendaConfig.hora_inicio;
    const horaFin = this.agendaConfig.hora_fin;
    const incrementoMinutos = this.agendaConfig.minutos_incremento;

    // Generar slots desde hora inicio hasta hora fin
    let horaActual = horaInicio;
    let minutoActual = 0;

    while (horaActual < horaFin || (horaActual === horaFin && minutoActual === 0)) {
      const period = horaActual >= 12 ? 'p.m.' : 'a.m.';
      const hora12 = horaActual > 12 ? horaActual - 12 : horaActual === 0 ? 12 : horaActual;
      const minuteStr = minutoActual.toString().padStart(2, '0');

      const timeKey = `${horaActual.toString().padStart(2, '0')}:${minuteStr}`;

      // Buscar si hay una cita en este horario
      const appointment = this.appointments.find(apt => apt.hora === timeKey);

      this.timeSlots.push({
        time: timeKey,
        displayTime: `${hora12}:${minuteStr}`,
        period: period,
        isEmpty: !appointment,
        appointment: appointment ? {
          clientName: appointment.cliente,
          service: appointment.servicios_agenda || 'Sin servicio',
          duration: appointment.duracion * incrementoMinutos,
          status: appointment.status.toLowerCase()
        } : undefined
      });

      // Incrementar tiempo
      minutoActual += incrementoMinutos;
      if (minutoActual >= 60) {
        horaActual++;
        minutoActual = 0;
      }
    }

    console.log(`✅ ${this.timeSlots.length} slots de tiempo generados`);
  }

  /**
   * Seleccionar día desde el selector semanal
   */
  selectDay(day: DayOption) {
    // Actualizar la fecha seleccionada
    this.selectedDate = new Date(day.fullDate);

    // Actualizar la vista completa (título, selector semanal, etc.)
    this.updateViewForSelectedDate(this.selectedDate);

    console.log('Día seleccionado desde selector semanal:', this.selectedDate);
  }

  /**
   * Abrir modal de calendario
   */
  async openCalendar() {
    const modal = await this.modalController.create({
      component: CalendarModalComponent,
      cssClass: 'calendar-modal',
      breakpoints: [0, 0.5, 0.75, 0.95],
      initialBreakpoint: 0.95,
      backdropDismiss: true
    });

    await modal.present();

    // Esperar a que se cierre el modal
    const { data, role } = await modal.onWillDismiss<CalendarModalResult>();

    if (role === 'confirm' && data?.selectedDate) {
      // Actualizar la fecha seleccionada
      this.selectedDate = data.selectedDate;
      this.updateViewForSelectedDate(data.selectedDate);
      console.log('Fecha seleccionada desde calendario:', data.selectedDate);
    }
  }

  /**
   * Actualizar la vista según la fecha seleccionada
   */
  async updateViewForSelectedDate(date: Date) {
    // Actualizar el título del día
    const today = new Date();
    const isToday = this.isSameDay(date, today);

    if (isToday) {
      this.currentDay = 'Hoy';
    } else {
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      this.currentDay = `${dayNames[date.getDay()]}, ${date.getDate()} de ${monthNames[date.getMonth()]}`;
    }

    // Actualizar el selector de días del mes
    this.updateMonthSelector(date);

    // Cargar citas del día seleccionado
    await this.loadAppointmentsForDate(date);

    // Regenerar timeline con las nuevas citas
    this.generateTimeSlots();
  }

  /**
   * Actualizar el selector de días del mes (carrusel)
   */
  updateMonthSelector(date: Date) {
    const today = new Date();
    const selectedMonth = date.getMonth();
    const selectedYear = date.getFullYear();

    // Generar todos los días del mes
    this.monthDays = [];
    const dayAbbreviations = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

    // Obtener el número de días del mes
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    // Generar cada día del mes
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dayDate = new Date(selectedYear, selectedMonth, dayNum);
      const dayOfWeek = dayDate.getDay();

      this.monthDays.push({
        day: dayAbbreviations[dayOfWeek],
        date: dayNum,
        month: selectedMonth,
        year: selectedYear,
        fullDate: new Date(dayDate),
        isToday: this.isSameDay(dayDate, today),
        isSelected: this.isSameDay(dayDate, date),
        isCurrentMonth: true
      });
    }

    // Scroll automático al día seleccionado después de renderizar
    setTimeout(() => {
      this.scrollToSelectedDay();
    }, 100);
  }

  /**
   * Hacer scroll automático al día seleccionado
   */
  scrollToSelectedDay() {
    const selectedElement = document.querySelector('.day-item.selected');
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }

  /**
   * Verificar si dos fechas son el mismo día
   */
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Abrir notificaciones
   */
  openNotifications() {
    console.log('Abrir notificaciones');
    // TODO: Navegar a notificaciones
  }

  /**
   * Abrir menú de opciones
   */
  async openOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Volver al Menú',
          icon: 'home-outline',
          handler: () => {
            this.goToMenu();
          }
        },
        {
          text: 'Configuración',
          icon: 'settings-outline',
          handler: () => {
            console.log('Ir a configuración');
            // TODO: Navegar a configuración
          }
        },
        {
          text: 'Ayuda',
          icon: 'help-circle-outline',
          handler: () => {
            console.log('Abrir ayuda');
            // TODO: Mostrar ayuda
          }
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  /**
   * Volver al menú principal
   */
  goToMenu() {
    this.router.navigate(['/home']);
  }

  /**
   * Crear nueva cita
   */
  async createAppointment() {
    const modal = await this.modalController.create({
      component: AppointmentFormComponent,
      cssClass: 'appointment-form-modal',
      componentProps: {
        date: this.selectedDate,
        mode: 'create'
      },
      backdropDismiss: false
    });

    await modal.present();

    // Esperar a que se cierre el modal
    const { data, role } = await modal.onWillDismiss<AppointmentFormData>();

    if (role === 'confirm' && data) {
      console.log('Cita guardada:', data);

      // Guardar cita mock en web (en móvil se guardaría en SQLite)
      await this.agendaService.createMockAppointment(data);

      // Recargar citas del día desde la base de datos/memoria
      await this.loadAppointmentsForDate(this.selectedDate);

      // Regenerar timeline con las nuevas citas
      this.generateTimeSlots();
    }
  }

  /**
   * Cambiar tab del bottom navigation
   */
  changeTab(tab: string) {
    this.activeTab = tab;
    console.log('Tab seleccionado:', tab);
    // TODO: Navegar según el tab
  }

  /**
   * Utilidad para delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
