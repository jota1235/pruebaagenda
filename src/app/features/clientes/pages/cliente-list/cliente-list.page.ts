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
  IonAvatar,
  IonNote,
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonChip,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
  searchOutline,
  personOutline,
  callOutline,
  mailOutline,
  trashOutline,
  createOutline
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
  selector: 'app-cliente-list',
  templateUrl: './cliente-list.page.html',
  styleUrls: ['./cliente-list.page.scss'],
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
    IonAvatar,
    IonNote,
    IonFab,
    IonFabButton,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonChip
  ]
})
export class ClienteListPage implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  isLoading = true;
  searchTerm = '';

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
      personOutline,
      callOutline,
      mailOutline,
      trashOutline,
      createOutline
    });
  }

  async ngOnInit() {
    await this.loadClientes();
  }

  /**
   * Cargar clientes desde la base de datos
   */
  async loadClientes(event?: any) {
    try {
      this.isLoading = true;
      this.clientes = await this.databaseService.getClientes();
      this.clientesFiltrados = [...this.clientes];
      console.log('Clientes cargados:', this.clientes.length);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      await this.showToast('Error al cargar clientes', 'danger');
    } finally {
      this.isLoading = false;
      if (event) {
        event.target.complete();
      }
    }
  }

  /**
   * Buscar clientes por nombre, teléfono o email
   */
  handleSearch(event: any) {
    const query = event.target.value?.toLowerCase() || '';
    this.searchTerm = query;

    if (!query.trim()) {
      this.clientesFiltrados = [...this.clientes];
      return;
    }

    this.clientesFiltrados = this.clientes.filter(cliente => {
      const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
      const telefono = cliente.telefono?.toLowerCase() || '';
      const email = cliente.email?.toLowerCase() || '';

      return nombreCompleto.includes(query) ||
             telefono.includes(query) ||
             email.includes(query);
    });
  }

  /**
   * Ir a crear nuevo cliente
   */
  goToCreate() {
    this.router.navigate(['/clientes/nuevo']);
  }

  /**
   * Ver detalle del cliente
   */
  viewCliente(cliente: Cliente) {
    this.router.navigate(['/clientes', cliente.id]);
  }

  /**
   * Editar cliente
   */
  editCliente(event: Event, cliente: Cliente) {
    event.stopPropagation();
    this.router.navigate(['/clientes', cliente.id, 'editar']);
  }

  /**
   * Eliminar cliente (marca como inactivo)
   */
  async deleteCliente(event: Event, cliente: Cliente) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar a ${cliente.nombre} ${cliente.apellido}?`,
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
              await this.databaseService.deleteCliente(cliente.id);
              await this.showToast('Cliente eliminado correctamente', 'success');
              await this.loadClientes();
            } catch (error) {
              console.error('Error eliminando cliente:', error);
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
    this.router.navigate(['/menu']);
  }

  /**
   * Obtener iniciales del nombre para el avatar
   */
  getInitials(cliente: Cliente): string {
    const nombre = cliente.nombre?.charAt(0) || '';
    const apellido = cliente.apellido?.charAt(0) || '';
    return (nombre + apellido).toUpperCase();
  }

  /**
   * Obtener color del avatar basado en el ID
   */
  getAvatarColor(id: number): string {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // amber
      '#EF4444', // red
      '#8B5CF6', // violet
      '#EC4899', // pink
      '#06B6D4', // cyan
      '#84CC16'  // lime
    ];
    return colors[id % colors.length];
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

  /**
   * Obtener nombre completo
   */
  getFullName(cliente: Cliente): string {
    return `${cliente.nombre} ${cliente.apellido}`.trim();
  }

  /**
   * Formatear fecha de creación
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
