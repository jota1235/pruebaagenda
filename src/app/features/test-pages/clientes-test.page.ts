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
  selector: 'app-clientes-test',
  templateUrl: './clientes-test.page.html',
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
export class ClientesTestPage implements OnInit {
  clientes: any[] = [];
  isLoading = true;

  constructor(private agendaService: AgendaSimpleService) {}

  async ngOnInit() {
    await this.loadClientes();
  }

  async loadClientes() {
    try {
      this.isLoading = true;
      this.clientes = await this.agendaService.getPacientes();
      console.log('Clientes cargados desde localStorage:', this.clientes);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
