import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonBadge,
  IonFooter,
  IonGrid,
  IonRow,
  IonCol,
  ModalController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  personOutline,
  calendarOutline,
  timeOutline,
  cutOutline,
  cashOutline,
  documentTextOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons';
import { Reserva } from '../../../../core/interfaces/agenda.interfaces';
import { DatabaseService } from '../../../../core/services/database.service';

@Component({
  selector: 'app-appointment-detail',
  templateUrl: './appointment-detail.component.html',
  styleUrls: ['./appointment-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonBadge,
    IonFooter,
    IonGrid,
    IonRow,
    IonCol
  ]
})
export class AppointmentDetailComponent implements OnInit {
  @Input() appointment!: Reserva;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private databaseService: DatabaseService
  ) {
    addIcons({
      closeOutline,
      personOutline,
      calendarOutline,
      timeOutline,
      cutOutline,
      cashOutline,
      documentTextOutline,
      createOutline,
      trashOutline
    });
  }

  ngOnInit() {
    console.log('📋 Appointment detail opened:', this.appointment);
  }

  /**
   * Cerrar el modal
   */
  closeModal() {
    this.modalController.dismiss(null, 'cancel');
  }

  /**
   * Editar cita
   */
  async editAppointment() {
    this.modalController.dismiss({
      action: 'edit',
      appointment: this.appointment
    }, 'edit');
  }

  /**
   * Eliminar cita con confirmación
   */
  async deleteAppointment() {
    const alert = await this.alertController.create({
      header: 'Eliminar Cita',
      message: `¿Está seguro de que desea eliminar la cita de ${this.appointment.cliente}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.performDelete();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Ejecutar eliminación de cita
   */
  private async performDelete() {
    try {
      console.log('🗑️ Eliminando cita ID:', this.appointment.id_agenda);

      // Usar el método deleteCitaTagenda que hace soft delete (activo=0)
      const deleted = await this.databaseService.deleteCitaTagenda(this.appointment.id_agenda);

      if (deleted) {
        console.log('✅ Cita eliminada correctamente');

        // Cerrar modal y notificar éxito
        this.modalController.dismiss({
          action: 'delete',
          appointmentId: this.appointment.id_agenda
        }, 'delete');
      } else {
        console.error('❌ No se pudo eliminar la cita');
        await this.showErrorAlert('No se pudo eliminar la cita. Intente nuevamente.');
      }
    } catch (error) {
      console.error('❌ Error eliminando cita:', error);
      await this.showErrorAlert('Error al eliminar la cita.');
    }
  }

  /**
   * Mostrar alerta de error
   */
  private async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  /**
   * Obtener color del chip según el status
   */
  getStatusColor(status: string): string {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'confirmado':
        return 'success';
      case 'reservado':
        return 'warning';
      case 'cobrado':
        return 'primary';
      case 'cancelado':
        return 'danger';
      case 'fueratiempo':
        return 'medium';
      default:
        return 'medium';
    }
  }

  /**
   * Formatear fecha para mostrar
   */
  formatDate(fecha: string): string {
    const date = new Date(fecha + 'T00:00:00'); // Evitar problemas de timezone
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    return `${dayNames[date.getDay()]}, ${date.getDate()} de ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }

  /**
   * Formatear hora para mostrar (convertir de 24h a 12h)
   */
  formatTime(hora: string): string {
    const [hours, minutes] = hora.split(':').map(Number);
    const period = hours >= 12 ? 'p.m.' : 'a.m.';
    const hour12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}
