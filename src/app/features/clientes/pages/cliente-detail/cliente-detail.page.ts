import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonAvatar,
  IonChip,
  IonBadge,
  IonSpinner,
  AlertController,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  createOutline,
  trashOutline,
  personOutline,
  callOutline,
  mailOutline,
  calendarOutline,
  transgenderOutline,
  documentTextOutline,
  timeOutline
} from 'ionicons/icons';
import { DatabaseService } from '../../../../core/services/database.service';

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fecha_nacimiento?: string;
  genero?: string;
  notas?: string;
  activo: number;
  fecha_creacion: string;
}

@Component({
  selector: 'app-cliente-detail',
  templateUrl: './cliente-detail.page.html',
  styleUrls: ['./cliente-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonAvatar,
    IonChip,
    IonBadge,
    IonSpinner
  ]
})
export class ClienteDetailPage implements OnInit {
  cliente?: Cliente;
  isLoading = true;
  clienteId!: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private databaseService: DatabaseService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({
      arrowBackOutline,
      createOutline,
      trashOutline,
      personOutline,
      callOutline,
      mailOutline,
      calendarOutline,
      transgenderOutline,
      documentTextOutline,
      timeOutline
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clienteId = +id;
      await this.loadCliente();
    } else {
      await this.showToast('ID de cliente no válido', 'danger');
      this.goBack();
    }
  }

  /**
   * Cargar datos del cliente
   */
  async loadCliente() {
    this.isLoading = true;

    try {
      const cliente = await this.databaseService.getClienteById(this.clienteId);

      if (cliente) {
        this.cliente = cliente;
      } else {
        await this.showToast('Cliente no encontrado', 'danger');
        this.goBack();
      }
    } catch (error) {
      console.error('Error cargando cliente:', error);
      await this.showToast('Error al cargar cliente', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Editar cliente
   */
  editCliente() {
    this.router.navigate(['/clientes', this.clienteId, 'editar']);
  }

  /**
   * Eliminar cliente
   */
  async deleteCliente() {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar a ${this.cliente?.nombre} ${this.cliente?.apellido}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando cliente...'
            });
            await loading.present();

            try {
              await this.databaseService.deleteCliente(this.clienteId);
              await this.showToast('Cliente eliminado correctamente', 'success');
              await loading.dismiss();
              this.goBack();
            } catch (error) {
              console.error('Error eliminando cliente:', error);
              await loading.dismiss();
              await this.showToast('Error al eliminar cliente', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Volver atrás
   */
  goBack() {
    this.router.navigate(['/clientes']);
  }

  /**
   * Obtener iniciales del nombre
   */
  getInitials(): string {
    if (!this.cliente) return '';
    const nombre = this.cliente.nombre?.charAt(0) || '';
    const apellido = this.cliente.apellido?.charAt(0) || '';
    return (nombre + apellido).toUpperCase();
  }

  /**
   * Obtener color del avatar
   */
  getAvatarColor(): string {
    if (!this.cliente) return '#3B82F6';
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];
    return colors[this.cliente.id % colors.length];
  }

  /**
   * Obtener nombre completo
   */
  getFullName(): string {
    if (!this.cliente) return '';
    return `${this.cliente.nombre} ${this.cliente.apellido}`.trim();
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'No especificado';

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Calcular edad
   */
  calculateAge(dateString: string): number | null {
    if (!dateString) return null;

    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Llamar por teléfono
   */
  callPhone() {
    if (this.cliente?.telefono) {
      window.open(`tel:${this.cliente.telefono}`, '_system');
    }
  }

  /**
   * Enviar email
   */
  sendEmail() {
    if (this.cliente?.email) {
      window.open(`mailto:${this.cliente.email}`, '_system');
    }
  }

  /**
   * Mostrar toast
   */
  async showToast(message: string, color: string = 'dark') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
