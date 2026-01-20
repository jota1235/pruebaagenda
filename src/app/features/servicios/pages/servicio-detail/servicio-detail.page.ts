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
  cutOutline,
  cashOutline,
  timeOutline,
  documentTextOutline,
  listOutline
} from 'ionicons/icons';
import { DatabaseService } from '../../../../core/services/database.service';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  activo: number;
  categoria?: string;
}

@Component({
  selector: 'app-servicio-detail',
  templateUrl: './servicio-detail.page.html',
  styleUrls: ['./servicio-detail.page.scss'],
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
    IonChip,
    IonBadge,
    IonSpinner
  ]
})
export class ServicioDetailPage implements OnInit {
  servicio?: Servicio;
  isLoading = true;
  servicioId!: number;
  minutosPerEspacio = 15;

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
      cutOutline,
      cashOutline,
      timeOutline,
      documentTextOutline,
      listOutline
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.servicioId = +id;
      await this.loadServicio();
    } else {
      await this.showToast('ID de servicio no válido', 'danger');
      this.goBack();
    }
  }

  async loadServicio() {
    this.isLoading = true;

    try {
      const servicio = await this.databaseService.getServicioById(this.servicioId);

      if (servicio) {
        this.servicio = servicio;
      } else {
        await this.showToast('Servicio no encontrado', 'danger');
        this.goBack();
      }
    } catch (error) {
      console.error('Error cargando servicio:', error);
      await this.showToast('Error al cargar servicio', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  editServicio() {
    this.router.navigate(['/servicios', this.servicioId, 'editar']);
  }

  async deleteServicio() {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar "${this.servicio?.nombre}"?`,
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
              message: 'Eliminando servicio...'
            });
            await loading.present();

            try {
              await this.databaseService.deleteServicio(this.servicioId);
              await this.showToast('Servicio eliminado correctamente', 'success');
              await loading.dismiss();
              this.goBack();
            } catch (error) {
              console.error('Error eliminando servicio:', error);
              await loading.dismiss();
              await this.showToast('Error al eliminar servicio', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  goBack() {
    this.router.navigate(['/servicios']);
  }

  formatDuracion(espacios: number): string {
    const minutos = espacios * this.minutosPerEspacio;
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return minutosRestantes > 0 ? `${horas}h ${minutosRestantes}min` : `${horas}h`;
  }

  formatPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(precio);
  }

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
