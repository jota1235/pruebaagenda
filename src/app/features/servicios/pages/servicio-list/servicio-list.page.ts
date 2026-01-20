import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonChip,
  IonBadge,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
  searchOutline,
  cutOutline,
  trashOutline,
  createOutline,
  timeOutline,
  cashOutline
} from 'ionicons/icons';
import { DatabaseService } from '../../../../core/services/database.service';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number; // en espacios de tiempo
  activo: number;
  categoria?: string;
}

@Component({
  selector: 'app-servicio-list',
  templateUrl: './servicio-list.page.html',
  styleUrls: ['./servicio-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonFab,
    IonFabButton,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonChip,
    IonBadge
  ]
})
export class ServicioListPage implements OnInit {
  servicios: Servicio[] = [];
  serviciosFiltrados: Servicio[] = [];
  isLoading = true;
  searchTerm = '';

  // Configuración de espacios (asumiendo 15 minutos por espacio)
  minutosPerEspacio = 15;

  constructor(
    private router: Router,
    private databaseService: DatabaseService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      addOutline,
      arrowBackOutline,
      searchOutline,
      cutOutline,
      trashOutline,
      createOutline,
      timeOutline,
      cashOutline
    });
  }

  async ngOnInit() {
    await this.loadServicios();
  }

  /**
   * Cargar servicios desde la base de datos
   */
  async loadServicios(event?: any) {
    try {
      this.isLoading = true;
      this.servicios = await this.databaseService.getServicios();
      this.serviciosFiltrados = [...this.servicios];
      console.log('Servicios cargados:', this.servicios.length);
    } catch (error) {
      console.error('Error cargando servicios:', error);
      await this.showToast('Error al cargar servicios', 'danger');
    } finally {
      this.isLoading = false;
      if (event) {
        event.target.complete();
      }
    }
  }

  /**
   * Buscar servicios por nombre o descripción
   */
  handleSearch(event: any) {
    const query = event.target.value?.toLowerCase() || '';
    this.searchTerm = query;

    if (!query.trim()) {
      this.serviciosFiltrados = [...this.servicios];
      return;
    }

    this.serviciosFiltrados = this.servicios.filter(servicio => {
      const nombre = servicio.nombre?.toLowerCase() || '';
      const descripcion = servicio.descripcion?.toLowerCase() || '';
      const categoria = servicio.categoria?.toLowerCase() || '';

      return nombre.includes(query) ||
             descripcion.includes(query) ||
             categoria.includes(query);
    });
  }

  /**
   * Ir a crear nuevo servicio
   */
  goToCreate() {
    this.router.navigate(['/servicios/nuevo']);
  }

  /**
   * Ver detalle del servicio
   */
  viewServicio(servicio: Servicio) {
    this.router.navigate(['/servicios', servicio.id]);
  }

  /**
   * Editar servicio
   */
  editServicio(event: Event, servicio: Servicio) {
    event.stopPropagation();
    this.router.navigate(['/servicios', servicio.id, 'editar']);
  }

  /**
   * Eliminar servicio (marca como inactivo)
   */
  async deleteServicio(event: Event, servicio: Servicio) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar el servicio "${servicio.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.databaseService.deleteServicio(servicio.id);
              await this.showToast('Servicio eliminado correctamente', 'success');
              await this.loadServicios();
            } catch (error) {
              console.error('Error eliminando servicio:', error);
              await this.showToast('Error al eliminar servicio', 'danger');
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
    this.router.navigate(['/menu']);
  }

  /**
   * Formatear duración de espacios a minutos
   */
  formatDuracion(espacios: number): string {
    const minutos = espacios * this.minutosPerEspacio;
    if (minutos < 60) {
      return `${minutos} min`;
    }
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return minutosRestantes > 0 ? `${horas}h ${minutosRestantes}min` : `${horas}h`;
  }

  /**
   * Formatear precio
   */
  formatPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(precio);
  }

  /**
   * Obtener color del icono basado en categoría o ID
   */
  getIconColor(servicio: Servicio): string {
    const colors = [
      'primary', 'secondary', 'tertiary', 'success',
      'warning', 'danger', 'medium', 'dark'
    ];
    return colors[servicio.id % colors.length];
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
