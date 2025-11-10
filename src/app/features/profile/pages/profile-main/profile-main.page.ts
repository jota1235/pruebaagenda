import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonChip,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonButtons,
  IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  callOutline,
  mailOutline,
  timeOutline,
  briefcaseOutline,
  peopleOutline,
  calendarOutline,
  starOutline,
  createOutline,
  chevronBackOutline,
  globeOutline,
  checkmarkCircleOutline,
  trendingUpOutline
} from 'ionicons/icons';

interface BusinessInfo {
  name: string;
  logo: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

interface WorkingHours {
  day: string;
  hours: string;
  isToday: boolean;
}

interface Service {
  name: string;
  icon: string;
  color: string;
}

interface Stats {
  label: string;
  value: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-profile-main',
  templateUrl: './profile-main.page.html',
  styleUrls: ['./profile-main.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonChip,
    IonGrid,
    IonRow,
    IonCol,
    IonBadge,
    IonButtons,
    IonBackButton
  ]
})
export class ProfileMainPage implements OnInit {
  // Información del negocio
  businessInfo: BusinessInfo = {
    name: 'Salón Belleza & Estilo',
    logo: 'https://via.placeholder.com/150/3B82F6/FFFFFF?text=BE',
    description: 'Tu salón de confianza con más de 10 años de experiencia en el cuidado y embellecimiento personal.',
    address: 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX',
    phone: '+52 55 1234 5678',
    email: 'contacto@bellezaestilo.mx',
    website: 'www.bellezaestilo.mx'
  };

  // Horarios de atención
  workingHours: WorkingHours[] = [
    { day: 'Lunes', hours: '9:00 AM - 7:00 PM', isToday: false },
    { day: 'Martes', hours: '9:00 AM - 7:00 PM', isToday: false },
    { day: 'Miércoles', hours: '9:00 AM - 7:00 PM', isToday: false },
    { day: 'Jueves', hours: '9:00 AM - 7:00 PM', isToday: false },
    { day: 'Viernes', hours: '9:00 AM - 8:00 PM', isToday: true },
    { day: 'Sábado', hours: '10:00 AM - 6:00 PM', isToday: false },
    { day: 'Domingo', hours: 'Cerrado', isToday: false }
  ];

  // Servicios destacados
  services: Service[] = [
    { name: 'Cortes', icon: 'briefcase-outline', color: 'primary' },
    { name: 'Coloración', icon: 'star-outline', color: 'secondary' },
    { name: 'Peinados', icon: 'people-outline', color: 'tertiary' },
    { name: 'Tratamientos', icon: 'checkmark-circle-outline', color: 'success' }
  ];

  // Estadísticas del negocio
  stats: Stats[] = [
    { label: 'Clientes Activos', value: '450+', icon: 'people-outline', color: 'primary' },
    { label: 'Citas este Mes', value: '127', icon: 'calendar-outline', color: 'secondary' },
    { label: 'Calificación', value: '4.8', icon: 'star-outline', color: 'warning' },
    { label: 'Años de Experiencia', value: '10+', icon: 'trending-up-outline', color: 'success' }
  ];

  constructor(private router: Router) {
    // Registrar iconos
    addIcons({
      locationOutline,
      callOutline,
      mailOutline,
      timeOutline,
      briefcaseOutline,
      peopleOutline,
      calendarOutline,
      starOutline,
      createOutline,
      chevronBackOutline,
      globeOutline,
      checkmarkCircleOutline,
      trendingUpOutline
    });
  }

  ngOnInit() {
    console.log('Perfil del negocio cargado');
  }

  /**
   * Editar información del negocio
   */
  editProfile() {
    console.log('Editar perfil - Por implementar');
    // TODO: Navegar a página de edición
  }

  /**
   * Volver al menú
   */
  goBack() {
    this.router.navigate(['/menu']);
  }

  /**
   * Llamar al negocio
   */
  callBusiness() {
    window.open(`tel:${this.businessInfo.phone}`, '_system');
  }

  /**
   * Enviar email
   */
  emailBusiness() {
    window.open(`mailto:${this.businessInfo.email}`, '_system');
  }

  /**
   * Abrir sitio web
   */
  openWebsite() {
    window.open(`https://${this.businessInfo.website}`, '_blank');
  }
}
