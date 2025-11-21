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
  IonSpinner,
  IonBadge
} from '@ionic/angular/standalone';
import { DatabaseService } from '../../core/services/database.service';
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
    IonSpinner,
    IonBadge
  ]
})
export class PersonalTestPage implements OnInit {
  personal: any[] = [];
  isLoading = true;
  source = ''; // 'SQLite' o 'localStorage'

  constructor(
    private databaseService: DatabaseService,
    private agendaSimpleService: AgendaSimpleService
  ) {}

  async ngOnInit() {
    await this.loadPersonal();
  }

  async loadPersonal() {
    try {
      this.isLoading = true;

      // Verificar si SQLite está disponible
      if (this.databaseService.isReady()) {
        console.log('📱 Cargando personal desde SQLite...');
        this.source = 'SQLite';
        const personalRaw = await this.databaseService.getPersonal();

        // Transformar formato SQLite al formato esperado por la UI
        this.personal = personalRaw.map(p => ({
          id: p.id,
          nombre: p.apellidos ? `${p.nombre} ${p.apellidos}` : p.nombre,
          activo: 'SI'
        }));

        console.log(`✅ ${this.personal.length} personal cargado desde SQLite`);
      } else {
        console.log('💾 SQLite no disponible, cargando desde localStorage...');
        this.source = 'localStorage';
        this.personal = await this.agendaSimpleService.getPersonalAgenda();
        console.log(`✅ ${this.personal.length} personal cargado desde localStorage`);
      }

    } catch (error) {
      console.error('❌ Error cargando personal:', error);
      this.source = 'Error';
    } finally {
      this.isLoading = false;
    }
  }
}
