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
    IonSpinner,
    IonBadge
  ]
})
export class ServiciosTestPage implements OnInit {
  servicios: any[] = [];
  isLoading = true;
  source = ''; // 'SQLite' o 'localStorage'

  constructor(
    private databaseService: DatabaseService,
    private agendaSimpleService: AgendaSimpleService
  ) {}

  async ngOnInit() {
    await this.loadServicios();
  }

  async loadServicios() {
    try {
      this.isLoading = true;

      // Verificar si SQLite está disponible
      if (this.databaseService.isReady()) {
        console.log('📱 Cargando servicios desde SQLite...');
        this.source = 'SQLite';
        const serviciosRaw = await this.databaseService.getServicios();

        // Transformar formato SQLite al formato esperado por la UI
        this.servicios = serviciosRaw.map(s => ({
          id: s.id,
          codigo: s.codigo || '',
          nombre: s.nombre,
          duracion: (s.n_duracion || 0) * 30, // Convertir a minutos
          precio: s.precio || 0,
          activo: 'SI'
        }));

        console.log(`✅ ${this.servicios.length} servicios cargados desde SQLite`);
      } else {
        console.log('💾 SQLite no disponible, cargando desde localStorage...');
        this.source = 'localStorage';
        this.servicios = await this.agendaSimpleService.getServicios();
        console.log(`✅ ${this.servicios.length} servicios cargados desde localStorage`);
      }

    } catch (error) {
      console.error('❌ Error cargando servicios:', error);
      this.source = 'Error';
    } finally {
      this.isLoading = false;
    }
  }
}
