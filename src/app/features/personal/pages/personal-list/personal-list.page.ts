import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
  IonBadge,
  IonChip,
  IonAvatar,
  IonSpinner,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  personOutline,
  createOutline,
  trashOutline,
  searchOutline,
  briefcaseOutline,
  callOutline
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
  selector: 'app-personal-list',
  templateUrl: './personal-list.page.html',
  styleUrls: ['./personal-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    IonRefresher,
    IonRefresherContent,
    IonBadge,
    IonChip,
    IonAvatar,
    IonSpinner
  ]
})
export class PersonalListPage implements OnInit {
  personal: Personal[] = [];
  filteredPersonal: Personal[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private db: DatabaseService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ addOutline, personOutline, createOutline, trashOutline, searchOutline, briefcaseOutline, callOutline });
  }

  ngOnInit() {
    this.loadPersonal();
  }

  ionViewWillEnter() {
    this.loadPersonal();
  }

  async loadPersonal() {
    this.isLoading = true;
    try {
      this.personal = await this.db.getPersonal();
      this.filteredPersonal = [...this.personal];
    } catch (error) {
      console.error('Error cargando personal:', error);
      await this.showToast('Error al cargar el personal', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  handleSearch(event: any) {
    const query = event.target.value?.toLowerCase() || '';
    this.searchTerm = query;

    if (!query.trim()) {
      this.filteredPersonal = [...this.personal];
      return;
    }

    this.filteredPersonal = this.personal.filter(p =>
      p.nombre.toLowerCase().includes(query) ||
      p.apellido.toLowerCase().includes(query) ||
      p.telefono.includes(query) ||
      p.especialidad.toLowerCase().includes(query) ||
      (p.email && p.email.toLowerCase().includes(query))
    );
  }

  handleRefresh(event: any) {
    this.loadPersonal().then(() => {
      event.target.complete();
    });
  }

  goToDetail(id: number) {
    this.router.navigate(['/personal', id]);
  }

  goToCreate() {
    this.router.navigate(['/personal/nuevo']);
  }

  goToEdit(id: number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/personal', id, 'editar']);
  }

  async confirmDelete(id: number, nombre: string, apellido: string, event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar a ${nombre} ${apellido}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deletePersonal(id, nombre, apellido);
          }
        }
      ]
    });

    await alert.present();
  }

  async deletePersonal(id: number, nombre: string, apellido: string) {
    try {
      await this.db.deletePersonal(id);
      await this.showToast(`${nombre} ${apellido} eliminado correctamente`, 'success');
      await this.loadPersonal();
    } catch (error) {
      console.error('Error eliminando personal:', error);
      await this.showToast('Error al eliminar el empleado', 'danger');
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
