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
  selector: 'app-personal-test',
  templateUrl: './personal-test.page.html',
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
export class PersonalTestPage implements OnInit {
  personal: any[] = [];
  isLoading = true;

  constructor(private agendaService: AgendaSimpleService) {}

  async ngOnInit() {
    await this.loadPersonal();
  }

  async loadPersonal() {
    try {
      this.isLoading = true;
      this.personal = await this.agendaService.getPersonalAgenda();
      console.log('Personal cargado desde localStorage:', this.personal);
    } catch (error) {
      console.error('Error cargando personal:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
