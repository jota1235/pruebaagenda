# 📱 ANÁLISIS: Diseño de Agenda con Carrusel de Terapeutas

**Fecha**: 2025-11-21
**Propósito**: Diseñar la vista correcta de agenda con scroll horizontal por terapeuta

---

## 🎯 **PROBLEMA ACTUAL**

### Vista Incorrecta (Timeline Único)
```
Horario  |  Citas (mezcladas)
---------|--------------------
09:00    |  Juan (Angie)
09:30    |  María (Mónica)  ← Solo se ve 1 por horario
10:00    |  [vacío]
10:30    |  Carlos (Gloria)
```

**Problemas**:
- ❌ No se ve a qué terapeuta pertenece cada cita
- ❌ Si hay 2+ citas al mismo tiempo (diferentes terapeutas), solo se muestra 1
- ❌ Imposible ver disponibilidad por terapeuta
- ❌ No se puede mapear correctamente el algoritmo `MapaAgenda()`

---

## ✅ **DISEÑO CORRECTO (Sistema Real)**

### Concepto: Carrusel Horizontal de Terapeutas

```
┌──────────────────────────────────────────────────────────────┐
│  ◄──  [  Angie  ] │ [ Mónica ] │ [ Gloria ] │ [ Extra ]  ──►│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  09:00  ┌──────────────────────────────────┐                │
│         │ 🟢 LIBRE - Toca para agendar     │                │
│         └──────────────────────────────────┘                │
│                                                               │
│  09:30  ┌──────────────────────────────────┐                │
│         │ María González                    │                │
│         │ 🟡 Masaje Relajante - 1h          │                │
│         │ Tel: 555-1234                     │                │
│         └──────────────────────────────────┘                │
│                                                               │
│  10:00  ┌──────────────────────────────────┐                │
│         │ [Continuación de cita anterior]   │                │
│         └──────────────────────────────────┘                │
│                                                               │
│  10:30  ┌──────────────────────────────────┐                │
│         │ 🟢 LIBRE - Toca para agendar     │                │
│         └──────────────────────────────────┘                │
│                                                               │
│  11:00  ┌──────────────────────────────────┐                │
│         │ Juan Pérez                        │                │
│         │ 🟢 Corte de Cabello - 30min       │                │
│         └──────────────────────────────────┘                │
│                                                               │
│  ...    (Scroll vertical para más horarios)                  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Interacción:
- **Swipe Horizontal (←→)**: Cambiar de terapeuta
- **Scroll Vertical (↑↓)**: Ver más horarios
- **Tap en celda LIBRE**: Abrir formulario de cita
- **Tap en celda OCUPADA**: Ver detalles / Editar / Cancelar

---

## 🏗️ **ARQUITECTURA DEL COMPONENTE**

### Estructura de Datos

```typescript
interface AgendaView {
  fecha: Date;
  terapeutas: TerapeutaColumn[];
  horarios: string[];  // ["09:00", "09:30", "10:00", ...]
  mapa: string[][];    // [columna][fila] = '' | '123' | 'X' | 'i' | 'd'
}

interface TerapeutaColumn {
  id: number;
  nombre: string;
  alias: string;
  orden: number;
  celdas: Celda[];
}

interface Celda {
  fila: number;
  hora: string;
  estado: 'libre' | 'ocupado' | 'continuacion' | 'inhabil' | 'deshabilitado';
  cita?: CitaInfo;
}

interface CitaInfo {
  id: number;
  cliente: string;
  servicio: string;
  duracion: number;  // en minutos
  status: string;
  tel: string;
  espacios: number;  // cuántos slots ocupa
}
```

---

## 📐 **IMPLEMENTACIÓN CON IONIC**

### Opción 1: ion-slides (Ionic 6)

```html
<!-- agenda-main.page.html -->
<ion-content>
  <!-- Selector de Fecha -->
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-button (click)="prevDay()">
        <ion-icon name="chevron-back"></ion-icon>
      </ion-button>
    </ion-buttons>

    <ion-title class="ion-text-center">
      {{ selectedDate | date:'EEEE, d MMMM yyyy' }}
    </ion-title>

    <ion-buttons slot="end">
      <ion-button (click)="nextDay()">
        <ion-icon name="chevron-forward"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>

  <!-- Indicadores de Terapeutas -->
  <div class="therapist-indicators">
    <div
      *ngFor="let terapeuta of terapeutas; let i = index"
      class="indicator"
      [class.active]="currentSlideIndex === i"
      (click)="slideTo(i)">
      {{ terapeuta.alias }}
    </div>
  </div>

  <!-- Carrusel de Terapeutas -->
  <ion-slides
    [options]="slideOpts"
    (ionSlideDidChange)="onSlideChange($event)"
    #slides>

    <!-- Slide por cada Terapeuta -->
    <ion-slide *ngFor="let terapeuta of terapeutas">
      <div class="therapist-schedule">

        <!-- Header del Terapeuta -->
        <div class="therapist-header">
          <ion-avatar>
            <img [src]="terapeuta.avatar || 'assets/default-avatar.png'">
          </ion-avatar>
          <div class="therapist-info">
            <h2>{{ terapeuta.nombre }}</h2>
            <p>{{ terapeuta.alias }}</p>
          </div>
        </div>

        <!-- Timeline de Horarios -->
        <ion-list class="time-slots">
          <ion-item
            *ngFor="let celda of terapeuta.celdas; let fila = index"
            [class]="getCeldaClass(celda)"
            (click)="onCeldaClick(terapeuta, celda, fila)">

            <!-- Hora -->
            <ion-label slot="start" class="time-label">
              {{ celda.hora }}
            </ion-label>

            <!-- Contenido de la Celda -->
            <div class="slot-content">

              <!-- LIBRE -->
              <div *ngIf="celda.estado === 'libre'" class="slot-libre">
                <ion-icon name="add-circle-outline"></ion-icon>
                <span>Disponible - Toca para agendar</span>
              </div>

              <!-- OCUPADO (Inicio de cita) -->
              <div *ngIf="celda.estado === 'ocupado' && celda.cita" class="slot-ocupado">
                <div class="client-name">{{ celda.cita.cliente }}</div>
                <div class="service-name">{{ celda.cita.servicio }}</div>
                <div class="duration">
                  <ion-icon name="time-outline"></ion-icon>
                  {{ celda.cita.duracion }} min
                </div>
                <ion-badge [color]="getStatusColor(celda.cita.status)">
                  {{ celda.cita.status }}
                </ion-badge>
              </div>

              <!-- CONTINUACIÓN -->
              <div *ngIf="celda.estado === 'continuacion'" class="slot-continuacion">
                <ion-icon name="arrow-down"></ion-icon>
                <span>Continúa...</span>
              </div>

              <!-- INHÁBIL -->
              <div *ngIf="celda.estado === 'inhabil'" class="slot-inhabil">
                <ion-icon name="ban-outline"></ion-icon>
                <span>Fuera de servicio</span>
              </div>

            </div>
          </ion-item>
        </ion-list>

      </div>
    </ion-slide>
  </ion-slides>

  <!-- FAB para agregar cita rápida -->
  <ion-fab vertical="bottom" horizontal="end" slot="fixed">
    <ion-fab-button (click)="openQuickAppointment()">
      <ion-icon name="add"></ion-icon>
    </ion-fab-button>
  </ion-fab>

</ion-content>
```

### TypeScript

```typescript
// agenda-main.page.ts
export class AgendaMainPage implements OnInit {
  @ViewChild('slides', { static: false }) slides: IonSlides;

  selectedDate: Date = new Date();
  terapeutas: TerapeutaColumn[] = [];
  horarios: string[] = [];
  mapa: string[][] = [];
  currentSlideIndex = 0;

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    loop: false,
    pagination: false
  };

  constructor(
    private agendaService: AgendaService,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    await this.loadAgenda();
  }

  async loadAgenda() {
    // 1. Configurar servicio
    this.agendaService.setFechaAg(this.formatDate(this.selectedDate));

    // 2. Leer configuración
    const tieneConfig = await this.agendaService.readConfigAgenda();
    if (!tieneConfig) return;

    // 3. Generar mapa
    await this.agendaService.MapaAgenda(false);

    // 4. Obtener datos
    this.horarios = this.agendaService.getInfoHorarios(false) as string[];
    const terapeutasRaw = this.agendaService.getInfoColsTerapeutas();
    this.mapa = this.agendaService.getArrMapa();
    const citas = this.agendaService.getInfoReservas();

    // 5. Construir estructura de terapeutas con celdas
    this.terapeutas = terapeutasRaw.map((terapeuta, columna) => {
      const celdas: Celda[] = this.horarios.map((hora, fila) => {
        const valorMapa = this.mapa[columna]?.[fila] || '';
        return this.buildCelda(fila, hora, valorMapa, citas);
      });

      return {
        id: terapeuta.id,
        nombre: terapeuta.nombre,
        alias: terapeuta.alias,
        orden: terapeuta.orden,
        avatar: terapeuta.avatar,
        celdas: celdas
      };
    });

    console.log('Agenda cargada:', {
      fecha: this.selectedDate,
      terapeutas: this.terapeutas.length,
      horarios: this.horarios.length,
      totalCitas: citas.length
    });
  }

  buildCelda(fila: number, hora: string, valorMapa: string, citas: any[]): Celda {
    // Celda vacía (libre)
    if (valorMapa === '') {
      return {
        fila,
        hora,
        estado: 'libre'
      };
    }

    // Continuación de cita
    if (valorMapa === 'X') {
      return {
        fila,
        hora,
        estado: 'continuacion'
      };
    }

    // Día inhábil
    if (valorMapa === 'i') {
      return {
        fila,
        hora,
        estado: 'inhabil'
      };
    }

    // Columna deshabilitada
    if (valorMapa === 'd') {
      return {
        fila,
        hora,
        estado: 'deshabilitado'
      };
    }

    // Es un ID de cita
    const citaId = parseInt(valorMapa);
    const cita = citas.find(c => c.id_agenda === citaId);

    if (cita) {
      return {
        fila,
        hora,
        estado: 'ocupado',
        cita: {
          id: cita.id_agenda,
          cliente: cita.cliente,
          servicio: cita.servicios_agenda || 'Sin servicio',
          duracion: cita.duracion * 30, // slots a minutos
          status: cita.status,
          tel: cita.tel1 || '',
          espacios: cita.duracion
        }
      };
    }

    // Fallback
    return {
      fila,
      hora,
      estado: 'libre'
    };
  }

  getCeldaClass(celda: Celda): string {
    const classes = ['time-slot', `slot-${celda.estado}`];

    if (celda.cita) {
      classes.push(`status-${celda.cita.status.toLowerCase()}`);
    }

    return classes.join(' ');
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'Reservado': 'warning',
      'Confirmado': 'success',
      'Cobrado': 'primary',
      'Cancelado': 'danger',
      'FueraTiempo': 'medium'
    };
    return colors[status] || 'medium';
  }

  async onCeldaClick(terapeuta: TerapeutaColumn, celda: Celda, fila: number) {
    if (celda.estado === 'libre') {
      // Crear nueva cita
      await this.createAppointment(terapeuta, celda.hora, fila);
    } else if (celda.estado === 'ocupado' && celda.cita) {
      // Ver/editar cita existente
      await this.viewAppointment(celda.cita);
    }
    // No hacer nada en continuación o inhábil
  }

  async createAppointment(terapeuta: TerapeutaColumn, hora: string, fila: number) {
    const modal = await this.modalCtrl.create({
      component: AppointmentFormComponent,
      componentProps: {
        date: this.selectedDate,
        hora: hora,
        terapeutaId: terapeuta.id,
        terapeutaNombre: terapeuta.nombre,
        mode: 'create'
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      await this.loadAgenda(); // Recargar
    }
  }

  async viewAppointment(cita: CitaInfo) {
    const modal = await this.modalCtrl.create({
      component: AppointmentDetailComponent,
      componentProps: {
        citaId: cita.id
      }
    });

    await modal.present();

    const { role } = await modal.onWillDismiss();
    if (role === 'updated' || role === 'deleted') {
      await this.loadAgenda(); // Recargar
    }
  }

  async onSlideChange(event: any) {
    this.currentSlideIndex = await this.slides.getActiveIndex();
  }

  async slideTo(index: number) {
    await this.slides.slideTo(index);
  }

  prevDay() {
    this.selectedDate = new Date(this.selectedDate.setDate(this.selectedDate.getDate() - 1));
    this.loadAgenda();
  }

  nextDay() {
    this.selectedDate = new Date(this.selectedDate.setDate(this.selectedDate.getDate() + 1));
    this.loadAgenda();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
```

### Estilos SCSS

```scss
// agenda-main.page.scss
.therapist-indicators {
  display: flex;
  justify-content: center;
  padding: 8px 0;
  background: var(--ion-color-light);
  gap: 8px;

  .indicator {
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
    background: white;
    color: var(--ion-color-medium);
    cursor: pointer;
    transition: all 0.3s;

    &.active {
      background: var(--ion-color-primary);
      color: white;
    }
  }
}

.therapist-schedule {
  width: 100%;
  padding: 16px;
}

.therapist-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: var(--ion-color-light);
  border-radius: 12px;

  ion-avatar {
    width: 56px;
    height: 56px;
  }

  .therapist-info {
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    p {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: var(--ion-color-medium);
    }
  }
}

.time-slots {
  ion-item {
    --padding-start: 0;
    --inner-padding-end: 0;
    margin-bottom: 8px;
    border-radius: 8px;

    &.slot-libre {
      --background: var(--ion-color-light);
      cursor: pointer;

      &:active {
        --background: var(--ion-color-light-shade);
      }
    }

    &.slot-ocupado {
      --background: var(--ion-color-warning-tint);

      &.status-confirmado {
        --background: var(--ion-color-success-tint);
      }

      &.status-cobrado {
        --background: var(--ion-color-primary-tint);
      }

      &.status-cancelado {
        --background: var(--ion-color-danger-tint);
      }
    }

    &.slot-continuacion {
      --background: var(--ion-color-medium-tint);
      cursor: default;
    }

    &.slot-inhabil {
      --background: var(--ion-color-light-shade);
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.time-label {
  min-width: 60px;
  font-weight: 600;
  font-size: 14px;
  color: var(--ion-color-dark);
}

.slot-content {
  flex: 1;
  padding: 12px;
}

.slot-libre {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ion-color-medium);

  ion-icon {
    font-size: 20px;
  }

  span {
    font-size: 14px;
  }
}

.slot-ocupado {
  .client-name {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 4px;
  }

  .service-name {
    font-size: 14px;
    color: var(--ion-color-medium-shade);
    margin-bottom: 8px;
  }

  .duration {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--ion-color-medium);
    margin-bottom: 8px;

    ion-icon {
      font-size: 16px;
    }
  }

  ion-badge {
    font-size: 11px;
  }
}

.slot-continuacion {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--ion-color-medium);
  font-size: 14px;
  opacity: 0.7;

  ion-icon {
    font-size: 20px;
  }
}

.slot-inhabil {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ion-color-medium);

  ion-icon {
    font-size: 20px;
  }
}
```

---

## 🔄 **INTEGRACIÓN CON MapaAgenda()**

### Cómo se Conecta

```typescript
// 1. AgendaService genera el mapa
await this.agendaService.MapaAgenda(false);

// 2. Obtenemos la matriz
this.mapa = this.agendaService.getArrMapa();
// mapa[columna][fila] = '' | '123' | 'X' | 'i' | 'd'

// 3. Construimos las celdas por terapeuta
this.terapeutas = terapeutasRaw.map((terapeuta, columna) => ({
  ...terapeuta,
  celdas: this.horarios.map((hora, fila) => {
    const valor = this.mapa[columna][fila];
    return this.buildCelda(fila, hora, valor, citas);
  })
}));

// 4. Ionic renderiza cada terapeuta en un slide
// 5. Usuario desliza para ver otro terapeuta
// 6. Todos comparten los mismos horarios (eje Y)
// 7. Cada uno tiene su propia columna del mapa (eje X)
```

---

## ✅ **VENTAJAS DE ESTE DISEÑO**

1. ✅ **Compatible 100% con MapaAgenda()**
   - Usa la matriz exactamente como la genera el algoritmo
   - No requiere modificaciones a la lógica

2. ✅ **Vista por Terapeuta**
   - Fácil ver disponibilidad de cada uno
   - Múltiples citas al mismo horario (diferentes terapeutas)

3. ✅ **Intuición Mobile-First**
   - Swipe horizontal natural
   - Scroll vertical para horarios
   - Tap para crear/ver citas

4. ✅ **Escalable**
   - Funciona con 1 terapeuta o 20
   - Columnas auxiliares en slides extra

5. ✅ **Preparado para Sincronización**
   - Estructura de datos compatible con servidor
   - Campo `spacio` (columna) se puede calcular del índice del slide

---

## 🚀 **PRÓXIMOS PASOS**

### Orden de Implementación

1. ✅ **PRIMERO: Corregir Estructura de BD** (De COMPARACION_SYSERV_VS_ACTUAL.md)
   - Renombrar `citas` → `tagenda`
   - Crear `tagenda_aux`
   - Agregar campos faltantes (`spacio`, `espacios_duracion`, etc.)

2. ✅ **SEGUNDO: Implementar Vista de Carrusel** (Este documento)
   - Refactorizar `agenda-main.page.html`
   - Actualizar `agenda-main.page.ts`
   - Agregar estilos SCSS

3. ✅ **TERCERO: Conectar con MapaAgenda()**
   - Integrar algoritmo del sistema real
   - Probar con datos reales

4. ✅ **CUARTO: Testing**
   - Probar con diferentes terapeutas
   - Probar citas superpuestas
   - Probar día inhábil
   - Probar columnas auxiliares

---

## 📊 **ESTIMACIÓN DE TIEMPO**

| Tarea | Tiempo | Prioridad |
|-------|--------|-----------|
| Migración de BD | 1 día | 🔴 CRÍTICO |
| Implementación de Carrusel | 4-6 horas | 🔴 ALTO |
| Integración con MapaAgenda() | 2-3 horas | 🟡 MEDIO |
| Testing y Ajustes | 2-3 horas | 🟢 BAJO |
| **TOTAL** | **2 días** | |

---

## 🎯 **CONCLUSIÓN**

El diseño de carrusel con slides es:
- ✅ La forma correcta del sistema real
- ✅ Compatible con la estructura de datos existente
- ✅ Preparado para sincronización
- ✅ Mejor UX para móviles
- ✅ Escalable y mantenible

**Recomendación**: Implementar este diseño DESPUÉS de corregir la estructura de BD para garantizar compatibilidad total.

---

**Última actualización**: 2025-11-21
