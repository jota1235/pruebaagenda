import { Component, OnInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// Swiper se carga como script global desde angular.json
declare var Swiper: any;
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
import { AppointmentDetailComponent } from '../../components/appointment-detail/appointment-detail.component';
import { AgendaService } from '../../../../core/services/agenda.service';
import { DatabaseService } from '../../../../core/services/database.service';
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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

  // ==================== CARRUSEL DE TERAPEUTAS ====================
  @ViewChild('swiperContainer') swiperRef?: ElementRef;
  swiper?: any;

  // Terapeutas activos (cada uno es un slide)
  terapeutas: Array<{
    id: number;
    alias: string;
    nombre: string;
    orden: number;
  }> = [];

  // Horarios del día (eje Y)
  horarios: string[] = [];

  // Matriz de agenda generada por MapaAgenda()
  arrMapa: string[][] = [];

  // Índice del terapeuta actual visible
  currentTherapistIndex = 0;

  // Intervalo para sincronizar el índice del swiper
  swiperSyncInterval?: any;

  constructor(
    private router: Router,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private agendaService: AgendaService,
    private databaseService: DatabaseService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
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

  ngAfterViewInit() {
    // NO inicializar aquí porque el *ngIf="activeTab === 'appointments'"
    // puede no haber renderizado el contenido aún
    // La inicialización se hace después de cargar los datos
  }

  ngOnDestroy() {
    // Limpiar intervalo de sincronización
    this.stopSwiperSync();
  }

  /**
   * Inicializar Swiper usando API de JavaScript (NO Web Component)
   * Mucho más confiable en producción
   */
  private initializeSwiper() {
    setTimeout(() => {
      if (this.swiperRef && this.swiperRef.nativeElement) {
        const swiperEl = this.swiperRef.nativeElement;

        try {
          if (typeof Swiper === 'undefined') {
            console.error('Swiper no está definido globalmente');
            return;
          }

          // Crear una referencia al componente para usar dentro de los callbacks
          const self = this;

          this.swiper = new Swiper(swiperEl, {
            slidesPerView: 1,
            spaceBetween: 0,
            speed: 300,
            touchRatio: 1,
            touchAngle: 45,
            grabCursor: true,
            simulateTouch: true,
            allowTouchMove: true,
            resistance: true,
            resistanceRatio: 0.85,
            on: {
              slideChange: function() {
                console.log('🔄 slideChange disparado, activeIndex:', self.swiper.activeIndex);
                self.ngZone.run(() => {
                  self.currentTherapistIndex = self.swiper.activeIndex;
                  console.log('  - Nuevo índice asignado:', self.currentTherapistIndex);
                  self.cdr.detectChanges();
                });
              },
              slideChangeTransitionEnd: function() {
                console.log('✅ slideChangeTransitionEnd disparado, activeIndex:', self.swiper.activeIndex);
                self.ngZone.run(() => {
                  self.currentTherapistIndex = self.swiper.activeIndex;
                  self.cdr.detectChanges();
                });
              }
            }
          });

          console.log('✓ Swiper inicializado correctamente');

          // Iniciar sincronización manual como fallback
          this.startSwiperSync();

          this.cdr.detectChanges();
        } catch (error) {
          console.error('Error inicializando Swiper:', error);
        }
      }
    }, 500);
  }

  /**
   * Sincronizar manualmente el índice del swiper (fallback para producción)
   */
  private startSwiperSync() {
    console.log('🔄 Iniciando polling de swiper...');

    // Limpiar intervalo anterior si existe
    if (this.swiperSyncInterval) {
      clearInterval(this.swiperSyncInterval);
    }

    let pollCount = 0;

    // Revisar cada 100ms si el activeIndex cambió
    this.swiperSyncInterval = setInterval(() => {
      pollCount++;

      if (!this.swiper) {
        if (pollCount % 10 === 0) {
          console.log('⚠️ Polling #' + pollCount + ': swiper no existe');
        }
        return;
      }

      const swiperActiveIndex = this.swiper.activeIndex;
      const swiperRealIndex = this.swiper.realIndex;

      if (pollCount % 10 === 0) {
        console.log('📊 Poll #' + pollCount + ': currentIndex=' + this.currentTherapistIndex +
                    ', activeIndex=' + swiperActiveIndex +
                    ', realIndex=' + swiperRealIndex);
      }

      if (swiperActiveIndex !== this.currentTherapistIndex) {
        this.ngZone.run(() => {
          console.log('⚡ CAMBIO DETECTADO: ' + this.currentTherapistIndex + ' → ' + swiperActiveIndex);
          this.currentTherapistIndex = swiperActiveIndex;
          this.cdr.detectChanges();
        });
      }
    }, 100);

    console.log('✅ Polling iniciado con ID:', this.swiperSyncInterval);
  }

  /**
   * Detener sincronización manual del swiper
   */
  private stopSwiperSync() {
    if (this.swiperSyncInterval) {
      clearInterval(this.swiperSyncInterval);
      this.swiperSyncInterval = undefined;
    }
  }

  /**
   * Inicializar agenda con animación de carga
   */
  async initializeAgenda() {
    try {
      console.log('🚀 Iniciando initializeAgenda()...');

      // 0. MIGRACIONES: Corregir duraciones incorrectas en la BD
      // (solo se ejecutarán una vez, detectan valores > 10 y los convierten de minutos a espacios)
      console.log('🔍 Verificando DatabaseService.isReady():', this.databaseService.isReady());

      if (this.databaseService.isReady()) {
        console.log('✅ DatabaseService listo, ejecutando migraciones...');

        const serviciosCorregidos = await this.databaseService.corregirDuracionServicios(); // Corregir n_duracion en productos
        console.log(`📊 Servicios corregidos: ${serviciosCorregidos}`);

        const citasCorregidas = await this.databaseService.corregirEspaciosDuracion();  // Corregir espacios_duracion en tagenda
        console.log(`📊 Citas corregidas: ${citasCorregidas}`);
      } else {
        console.warn('⚠️  DatabaseService NO está listo, migraciones NO ejecutadas');
      }

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
    console.log('📅 loadAppointmentsForDate() iniciado para:', date);
    try {
      const fecha = this.formatDateSQL(date);

      // Establecer la fecha en el servicio ANTES de cargar las citas
      this.agendaService.setFechaAg(fecha);

      // DEBUG: Verificar datos RAW de la BD ANTES de MapaAgenda
      console.log('🔬 Verificando datos RAW de tagenda ANTES de MapaAgenda...');
      const citasRaw = await this.databaseService.getCitasTagenda(fecha);
      console.log(`📊 Citas RAW de BD (${citasRaw.length}):`);
      citasRaw.forEach((c: any, i: number) => {
        console.log(`   ${i+1}. ${c.cliente_nombre} - ${c.hora}`);
        console.log(`      espacios_duracion: ${c.espacios_duracion}`);
        console.log(`      duracion_minutos: ${c.duracion_minutos}`);
      });

      // Usar MapaAgenda para obtener todas las citas mapeadas de esa fecha
      this.appointments = await this.agendaService.MapaAgenda(false);

      // ==================== CARGAR DATOS DEL CARRUSEL ====================

      // 1. Obtener matriz generada por MapaAgenda()
      this.arrMapa = this.agendaService.getArrMapa();

      // 2. Obtener terapeutas activos
      const config = this.agendaService.getInfoConfigAgenda();
      this.terapeutas = (config.arrTerapeutas || []).map((t: any) => ({
        id: t.id,
        alias: t.alias,
        nombre: t.nombre,
        orden: t.orden || 0
      }));

      // 3. Obtener horarios del día
      const horariosData = this.agendaService.getInfoHorarios();
      if (Array.isArray(horariosData)) {
        // Si son objetos HorarioAgenda, extraer el formato militar
        this.horarios = horariosData.map((h: any) =>
          typeof h === 'string' ? h : h.militar
        );
      } else {
        this.horarios = [];
      }

      // Inicializar swiper después de cargar datos
      this.cdr.detectChanges();
      this.initializeSwiper();

    } catch (error) {
      console.error('Error cargando citas:', error);
      this.appointments = [];
      this.terapeutas = [];
      this.horarios = [];
      this.arrMapa = [];
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
   * Formatear hora en formato de 12 horas (solo número)
   * Ejemplo: "09:00" -> "9:00", "13:00" -> "1:00"
   */
  formatHour(horario: string): string {
    const [hours, minutes] = horario.split(':');
    let hour = parseInt(hours);
    hour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${hour}:${minutes}`;
  }

  /**
   * Obtener período AM/PM
   * Ejemplo: "09:00" -> "a.m.", "13:00" -> "p.m."
   */
  formatPeriod(horario: string): string {
    const [hours] = horario.split(':');
    const hour = parseInt(hours);
    return hour < 12 ? 'a.m.' : 'p.m.';
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
          duration: appointment.duracion, // Ya está en minutos, no multiplicar
          status: appointment.status.toLowerCase(),
          fullData: appointment // Guardar el objeto completo para el detalle
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
   * Ver detalle de una cita
   */
  async viewAppointmentDetail(appointment: Reserva) {
    const modal = await this.modalController.create({
      component: AppointmentDetailComponent,
      cssClass: 'appointment-detail-modal',
      componentProps: {
        appointment: appointment
      },
      breakpoints: [0, 0.5, 0.75, 0.95],
      initialBreakpoint: 0.75,
      backdropDismiss: true
    });

    await modal.present();

    // Esperar a que se cierre el modal
    const { data, role } = await modal.onWillDismiss();

    if (role === 'edit' && data?.appointment) {
      // Abrir formulario en modo edición
      await this.editAppointment(data.appointment);
    } else if (role === 'delete' && data?.appointmentId) {
      // Recargar citas después de eliminar
      console.log('✅ Cita eliminada, recargando agenda...');
      await this.loadAppointmentsForDate(this.selectedDate);
      this.generateTimeSlots();
    }
  }

  /**
   * Editar cita existente
   */
  async editAppointment(appointment: Reserva) {
    const modal = await this.modalController.create({
      component: AppointmentFormComponent,
      cssClass: 'appointment-form-modal',
      componentProps: {
        date: new Date(appointment.fecha + 'T00:00:00'),
        mode: 'edit',
        existingAppointment: appointment
      },
      backdropDismiss: false
    });

    await modal.present();

    // Esperar a que se cierre el modal
    const { data, role } = await modal.onWillDismiss<AppointmentFormData>();

    if (role === 'confirm' && data) {
      console.log('✅ Cita actualizada:', data);

      // Recargar citas del día desde la base de datos
      await this.loadAppointmentsForDate(this.selectedDate);

      // Regenerar timeline con las citas actualizadas
      this.generateTimeSlots();
    }
  }

  /**
   * Cambiar tab del bottom navigation
   */
  changeTab(tab: string) {
    this.activeTab = tab;
    console.log('Tab seleccionado:', tab);

    // Si cambiamos a appointments, reinicializar swiper si es necesario
    if (tab === 'appointments' && !this.swiper) {
      setTimeout(() => {
        this.initializeSwiper();
      }, 50);
    }
  }

  /**
   * Utilidad para delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== MÉTODOS DEL CARRUSEL ====================

  /**
   * Evento cuando cambia el slide del carrusel
   */
  onSlideChange() {
    console.log('🔔 onSlideChange called');
    console.log('  - swiper exists:', !!this.swiper);
    console.log('  - swiper.activeIndex:', this.swiper?.activeIndex);
    console.log('  - currentTherapistIndex antes:', this.currentTherapistIndex);

    if (this.swiper) {
      this.ngZone.run(() => {
        const oldIndex = this.currentTherapistIndex;
        this.currentTherapistIndex = this.swiper.activeIndex;
        console.log('  - currentTherapistIndex después:', this.currentTherapistIndex);
        console.log('  - cambió de', oldIndex, 'a', this.currentTherapistIndex);
        this.cdr.detectChanges();
      });
    }
  }

  /**
   * Navegar a un terapeuta específico desde indicadores
   */
  goToTherapist(index: number) {
    if (this.swiper && index >= 0 && index < this.terapeutas.length) {
      this.currentTherapistIndex = index;
      this.cdr.detectChanges();
      this.swiper.slideTo(index);
    }
  }

  /**
   * Obtener información de una celda de la matriz
   */
  getCeldaInfo(columna: number, fila: number): {
    tipo: 'libre' | 'cita' | 'continuacion' | 'inhabil' | 'deshabilitado';
    cita?: Reserva;
    valor: string;
  } {
    const valor = this.arrMapa[columna]?.[fila] || '';

    if (valor === '') return { tipo: 'libre', valor };

    // Para continuaciones (X), buscar la cita original arriba
    if (valor === 'X') {
      // Buscar hacia arriba en la misma columna para encontrar la cita original
      for (let filaAnterior = fila - 1; filaAnterior >= 0; filaAnterior--) {
        const valorAnterior = this.arrMapa[columna]?.[filaAnterior] || '';
        const citaId = parseInt(valorAnterior);
        if (!isNaN(citaId)) {
          const cita = this.appointments.find(c => c.id_agenda === citaId);
          return { tipo: 'continuacion', cita, valor };
        }
      }
      return { tipo: 'continuacion', valor };
    }

    if (valor === 'i') return { tipo: 'inhabil', valor };
    if (valor === 'd') return { tipo: 'deshabilitado', valor };

    const citaId = parseInt(valor);
    if (!isNaN(citaId)) {
      const cita = this.appointments.find(c => c.id_agenda === citaId);
      return { tipo: 'cita', cita, valor };
    }

    return { tipo: 'libre', valor };
  }

  /**
   * Obtener clase CSS según el tipo de celda
   */
  getCeldaClass(columna: number, fila: number): string {
    const info = this.getCeldaInfo(columna, fila);
    return `cell-${info.tipo}`;
  }

  /**
   * Click en una celda de la agenda
   */
  async onCellClick(columna: number, fila: number) {
    const celdaInfo = this.getCeldaInfo(columna, fila);

    // Ver detalle de cita (tanto en celda principal como en continuación)
    if ((celdaInfo.tipo === 'cita' || celdaInfo.tipo === 'continuacion') && celdaInfo.cita) {
      await this.viewAppointmentDetail(celdaInfo.cita);
    } else if (celdaInfo.tipo === 'libre') {
      // Crear nueva cita con datos pre-seleccionados
      const terapeuta = this.terapeutas[columna];
      const horario = this.horarios[fila];

      if (terapeuta && horario) {
        await this.crearCitaConDatos(terapeuta, horario);
      }
    }
  }

  /**
   * Crear cita con terapeuta y hora pre-seleccionados
   */
  async crearCitaConDatos(terapeuta: any, horario: string) {
    // Combinar fecha seleccionada con horario
    const [horas, minutos] = horario.split(':').map(Number);
    const fechaHora = new Date(this.selectedDate);
    fechaHora.setHours(horas, minutos, 0, 0);

    const modal = await this.modalController.create({
      component: AppointmentFormComponent,
      cssClass: 'appointment-form-modal',
      componentProps: {
        date: fechaHora,
        mode: 'create',
        preselectedStaff: terapeuta.id,
        selectedDate: this.selectedDate
      },
      backdropDismiss: false
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<AppointmentFormData>();

    if (role === 'confirm' && data) {
      console.log('✅ Cita creada desde carrusel:', data);
      await this.loadAppointmentsForDate(this.selectedDate);
      this.generateTimeSlots();
    }
  }

  /**
   * Obtener color según el status de la cita
   */
  getStatusColor(status?: string): string {
    switch (status) {
      case 'Confirmado': return 'success';
      case 'Cobrado': return 'primary';
      case 'Reservado': return 'warning';
      case 'Cancelado': return 'danger';
      case 'FueraTiempo': return 'medium';
      default: return 'medium';
    }
  }

  /**
   * Contar citas de un terapeuta específico
   */
  getAppointmentCountForTherapist(terapeutaId: number): number {
    return this.appointments.filter(a => a.id_personal === terapeutaId).length;
  }
}
