import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonButtons,
  IonBackButton,
  IonSpinner
} from '@ionic/angular/standalone';
import { AgendaSimpleService } from '../../core/services/agenda-simple.service';

@Component({
  selector: 'app-servicios-test',
  templateUrl: './servicios-test.page.html',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonButtons,
    IonBackButton,
    IonSpinner
  ]
})
export class ServiciosTestPage implements OnInit {
  servicios: any[] = [];
  isLoading = true;

  constructor(private agendaService: AgendaSimpleService) {}

  async ngOnInit() {
    await this.loadServicios();
  }

  async loadServicios() {
    try {
      this.isLoading = true;
      this.servicios = await this.agendaService.getServicios();
      console.log('Servicios cargados desde localStorage:', this.servicios);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
