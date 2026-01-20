import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonAvatar,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  createOutline,
  trashOutline,
  personOutline,
  callOutline,
  mailOutline,
  briefcaseOutline,
  calendarOutline,
  checkmarkCircleOutline,
  closeCircleOutline
} from 'ionicons/icons';
import { DatabaseService } from '../../../../core/services/database.service';

interface Personal {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  especialidad: string;
  activo: number;
  fecha_contratacion?: string;
}

@Component({
  selector: 'app-personal-detail',
  templateUrl: './personal-detail.page.html',
  styleUrls: ['./personal-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSpinner,
    IonAvatar
  ]
})
export class PersonalDetailPage implements OnInit {
  personal: Personal | null = null;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private db: DatabaseService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      arrowBackOutline,
      createOutline,
      trashOutline,
      personOutline,
      callOutline,
      mailOutline,
      briefcaseOutline,
      calendarOutline,
      checkmarkCircleOutline,
      closeCircleOutline
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPersonal(parseInt(id, 10));
    }
  }

  async loadPersonal(id: number) {
    this.isLoading = true;
    try {
      this.personal = await this.db.getPersonalById(id);
      if (!this.personal) {
        await this.showToast('Empleado no encontrado', 'danger');
        this.router.navigate(['/personal']);
      }
    } catch (error) {
      console.error('Error cargando personal:', error);
      await this.showToast('Error al cargar los datos del empleado', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  goToEdit() {
    if (this.personal) {
      this.router.navigate(['/personal', this.personal.id, 'editar']);
    }
  }

  async confirmDelete() {
    if (!this.personal) return;

    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar a ${this.personal.nombre} ${this.personal.apellido}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deletePersonal();
          }
        }
      ]
    });

    await alert.present();
  }

  async deletePersonal() {
    if (!this.personal) return;

    try {
      await this.db.deletePersonal(this.personal.id);
      await this.showToast(`${this.personal.nombre} ${this.personal.apellido} eliminado correctamente`, 'success');
      this.router.navigate(['/personal']);
    } catch (error) {
      console.error('Error eliminando personal:', error);
      await this.showToast('Error al eliminar el empleado', 'danger');
    }
  }

  callPhone() {
    if (this.personal?.telefono) {
      window.location.href = `tel:${this.personal.telefono}`;
    }
  }

  sendEmail() {
    if (this.personal?.email) {
      window.location.href = `mailto:${this.personal.email}`;
    }
  }

  getAvatarColor(id: number): string {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];
    return colors[id % colors.length];
  }

  getAvatarInitials(nombre: string, apellido: string): string {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }

  formatFecha(fecha: string | undefined): string {
    if (!fecha) return 'No especificada';

    const date = new Date(fecha);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
