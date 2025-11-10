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
  ActionSheetController
} from '@ionic/angular/standalone';
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
  hour: string;
  slots: { time: string; isEmpty: boolean; appointment?: any }[];
}

interface DayOption {
  day: string;
  date: number;
  isToday: boolean;
  isSelected: boolean;
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

  // Días de la semana
  weekDays: DayOption[] = [
    { day: 'DOM', date: 2, isToday: false, isSelected: false },
    { day: 'LUN', date: 3, isToday: false, isSelected: false },
    { day: 'MAR', date: 4, isToday: false, isSelected: false },
    { day: 'MIÉ', date: 5, isToday: false, isSelected: false },
    { day: 'JUE', date: 6, isToday: false, isSelected: false },
    { day: 'VIE', date: 7, isToday: true, isSelected: true },
    { day: 'SÁB', date: 8, isToday: false, isSelected: false }
  ];

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

  constructor(
    private router: Router,
    private actionSheetController: ActionSheetController
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
    // Simular carga de datos
    await this.delay(1500);

    // Generar timeline
    this.generateTimeSlots();

    // Mostrar contenido con animación
    this.isLoading = false;
    setTimeout(() => {
      this.showContent = true;
    }, 100);
  }

  /**
   * Generar slots de tiempo para el timeline
   */
  generateTimeSlots() {
    const hours = ['9', '10', '11', '12', '1', '2', '3', '4', '5', '6', '7'];
    const periods = ['a.m.', 'a.m.', 'a.m.', 'p.m.', 'p.m.', 'p.m.', 'p.m.', 'p.m.', 'p.m.', 'p.m.', 'p.m.'];

    this.timeSlots = hours.map((hour, index) => {
      return {
        hour: `${hour} ${periods[index]}`,
        slots: [
          { time: '00', isEmpty: true },
          { time: '15', isEmpty: true },
          { time: '30', isEmpty: true },
          { time: '45', isEmpty: true }
        ]
      };
    });

    // Agregar una cita de ejemplo en 9:15 a.m. (45 min = 3 slots)
    if (this.timeSlots[0]) {
      // Marcar los 3 slots como ocupados (9:15, 9:30, 9:45)
      this.timeSlots[0].slots[1] = {
        time: '15',
        isEmpty: false,
        appointment: {
          clientName: 'Juan Pérez',
          service: 'Corte de Cabello',
          duration: 45,
          status: 'confirmed'
        }
      };
      this.timeSlots[0].slots[2] = {
        time: '30',
        isEmpty: false
      };
      this.timeSlots[0].slots[3] = {
        time: '45',
        isEmpty: false
      };
    }
  }

  /**
   * Seleccionar día
   */
  selectDay(day: DayOption) {
    this.weekDays.forEach(d => d.isSelected = false);
    day.isSelected = true;
    console.log('Día seleccionado:', day);
    // TODO: Cargar citas del día seleccionado
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
  createAppointment() {
    console.log('Crear nueva cita');
    // TODO: Navegar a formulario de nueva cita
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
