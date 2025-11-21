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
    IonSpinner,
    IonBadge
  ]
})
export class ClientesTestPage implements OnInit {
  clientes: any[] = [];
  isLoading = true;
  source = ''; // 'SQLite' o 'localStorage'

  constructor(
    private databaseService: DatabaseService,
    private agendaSimpleService: AgendaSimpleService
  ) {}

  async ngOnInit() {
    await this.loadClientes();
  }

  async loadClientes() {
    try {
      this.isLoading = true;

      // Verificar si SQLite está disponible
      if (this.databaseService.isReady()) {
        console.log('📱 Cargando clientes desde SQLite...');
        this.source = 'SQLite';
        const clientesRaw = await this.databaseService.getClientes();

        // Transformar formato SQLite al formato esperado por la UI
        this.clientes = clientesRaw.map(c => ({
          id: c.id,
          nombre: `${c.nombre || ''} ${c.apaterno || ''} ${c.amaterno || ''}`.trim(),
          telefono: c.tel1 || '',
          email: c.email1 || '',
          activo: 'SI'
        }));

        console.log(`✅ ${this.clientes.length} clientes cargados desde SQLite`);
      } else {
        console.log('💾 SQLite no disponible, cargando desde localStorage...');
        this.source = 'localStorage';
        this.clientes = await this.agendaSimpleService.getPacientes();
        console.log(`✅ ${this.clientes.length} clientes cargados desde localStorage`);
      }

    } catch (error) {
      console.error('❌ Error cargando clientes:', error);
      this.source = 'Error';
    } finally {
      this.isLoading = false;
    }
  }
}
