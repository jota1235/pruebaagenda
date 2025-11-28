# 📱 PLAN DE IMPLEMENTACIÓN: Carrusel de Agendas por Terapeuta

**Fecha**: 2025-11-22
**Objetivo**: Implementar UI de carrusel donde cada terapeuta tiene su propia agenda visible mediante swipe horizontal

---

## 🎯 CONCEPTO GENERAL

### ¿Cómo Funciona?

```
┌────────────────────────────────────────────────┐
│  [<]  Ana Pérez  [>]          📅 22 Nov 2025  │  ← Indicadores
├────────────────────────────────────────────────┤
│  09:00 ┌──────────────────┐                   │
│        │ Juan Martínez    │  ← CITA           │
│  09:30 │ Corte + Tinte    │                   │
│        │ $550             │                   │
│  10:00 └──────────────────┘                   │
│  10:30  [   DISPONIBLE   ]   ← Celda libre    │
│  11:00 ┌──────────────────┐                   │
│        │ María López      │                   │
│  11:30 │ Masaje           │                   │
│        └──────────────────┘                   │
│  ...                                           │
└────────────────────────────────────────────────┘

🔄 SWIPE → Pasa a la agenda de "Carlos Ruiz"
🔄 SWIPE ← Regresa a la agenda de "Ana Pérez"
```

### Ventajas de Este Diseño

✅ **Sin conflictos de horario**: Cada terapeuta tiene su propio espacio
✅ **Intuitivoeach en móvil**: Swipe horizontal es un gesto natural
✅ **Escalable**: Funciona con 1 o 20 terapeutas
✅ **Compatible con syserv**: Usa la misma estructura de `arrMapa[columna][fila]`
✅ **Fácil navegación**: Indicadores superiores muestran quién está en cada slide

---

## 📐 ARQUITECTURA DE COMPONENTES

### Estructura de Datos (Ya existe)

```typescript
// 1. MapaAgenda() genera la matriz
arrMapa[columna][fila] = {
  '' = Libre
  '123' = ID de cita
  'X' = Continuación
  'i' = Día inhábil
  'd' = Deshabilitado
}

// 2. Terapeutas activos (columnas)
terapeutas = [
  { id: 739, alias: 'Ana', nombre: 'Ana Pérez', orden: 0 },
  { id: 2273, alias: 'Carlos', nombre: 'Carlos Ruiz', orden: 1 },
  { id: 4924, alias: 'Laura', nombre: 'Laura García', orden: 2 }
]

// 3. Horarios (filas)
horarios = ['09:00', '09:30', '10:00', ..., '19:00']

// 4. Citas del día
citas = [ { id_agenda, cliente, servicios, ... }, ... ]
```

### Componentes a Modificar

1. **agenda-main.page.html**: Agregar estructura de carrusel
2. **agenda-main.page.ts**: Lógica de slides y navegación
3. **agenda-main.page.scss**: Estilos del carrusel

---

## 🔨 FASES DE IMPLEMENTACIÓN

### ✅ FASE 0: Preparación (COMPLETADA)

- [x] MapaAgenda() implementado con 6 fases
- [x] Validación de conflictos de horario
- [x] CRUD completo de citas (Create, Read, Update, Delete)
- [x] Datos en tagenda + tagenda_aux

### 📋 FASE 1: Estructura Base del Carrusel (2-3 horas)

**Objetivo**: Implementar swiper con navegación básica

**Tareas**:

1. **Instalar Swiper.js** (reemplazo de ion-slides deprecated)
   ```bash
   npm install swiper@latest
   ```

2. **Actualizar agenda-main.page.html**:
   ```html
   <!-- Indicadores de terapeutas -->
   <div class="therapist-indicators">
     <div *ngFor="let t of terapeutas; let i = index"
          [class.active]="currentTherapistIndex === i"
          (click)="goToTherapist(i)">
       {{ t.alias }}
     </div>
   </div>

   <!-- Swiper de terapeutas -->
   <swiper-container #swiper
     [slidesPerView]="1"
     [spaceBetween]="0"
     (slidechange)="onSlideChange()">

     <swiper-slide *ngFor="let terapeuta of terapeutas; let col = index">
       <!-- Agenda del terapeuta -->
       <div class="therapist-schedule">
         <h3>{{ terapeuta.nombre }}</h3>

         <!-- Timeline de horarios -->
         <ion-list class="time-slots">
           <ion-item *ngFor="let horario of horarios; let fila = index">
             <!-- Celda de cita o espacio libre -->
           </ion-item>
         </ion-list>
       </div>
     </swiper-slide>
   </swiper-container>
   ```

3. **Actualizar agenda-main.page.ts**:
   ```typescript
   import Swiper from 'swiper';

   @ViewChild('swiper') swiperRef: ElementRef | undefined;
   swiper?: Swiper;

   currentTherapistIndex = 0;

   ngAfterViewInit() {
     this.swiper = this.swiperRef?.nativeElement.swiper;
   }

   async onSlideChange() {
     if (this.swiper) {
       this.currentTherapistIndex = this.swiper.activeIndex;
     }
   }

   goToTherapist(index: number) {
     this.swiper?.slideTo(index);
   }
   ```

**Resultado esperado**: Carrusel funcional con navegación entre terapeutas

---

### 📋 FASE 2: Renderizar Celdas de la Agenda (3-4 horas)

**Objetivo**: Mostrar citas y espacios libres correctamente

**Tareas**:

1. **Crear método para obtener celda**:
   ```typescript
   getCeldaInfo(columna: number, fila: number): {
     tipo: 'libre' | 'cita' | 'continuacion' | 'inhabil' | 'deshabilitado';
     cita?: Reserva;
     valor: string;
   } {
     const valor = this.arrMapa[columna]?.[fila] || '';

     if (valor === '') return { tipo: 'libre', valor };
     if (valor === 'X') return { tipo: 'continuacion', valor };
     if (valor === 'i') return { tipo: 'inhabil', valor };
     if (valor === 'd') return { tipo: 'deshabilitado', valor };

     const citaId = parseInt(valor);
     if (!isNaN(citaId)) {
       const cita = this.appointments.find(c => c.id_agenda === citaId);
       return { tipo: 'cita', cita, valor };
     }

     return { tipo: 'libre', valor };
   }
   ```

2. **Actualizar HTML con renderizado de celdas**:
   ```html
   <ion-item *ngFor="let horario of horarios; let fila = index"
             [ngClass]="getCeldaClass(col, fila)"
             (click)="onCellClick(col, fila)">

     <!-- Hora -->
     <ion-label slot="start" class="time-label">
       {{ horario }}
     </ion-label>

     <!-- Celda LIBRE -->
     <div *ngIf="getCeldaInfo(col, fila).tipo === 'libre'"
          class="cell-content libre">
       <span>Disponible</span>
     </div>

     <!-- Celda CITA -->
     <div *ngIf="getCeldaInfo(col, fila).tipo === 'cita'"
          class="cell-content cita">
       <div class="cita-header">
         <strong>{{ getCeldaInfo(col, fila).cita?.cliente }}</strong>
         <ion-badge [color]="getStatusColor(getCeldaInfo(col, fila).cita?.status)">
           {{ getCeldaInfo(col, fila).cita?.status }}
         </ion-badge>
       </div>
       <p class="servicio">{{ getCeldaInfo(col, fila).cita?.servicios_nombres }}</p>
       <p class="costo">${{ getCeldaInfo(col, fila).cita?.costo_total }}</p>
     </div>

     <!-- Celda CONTINUACIÓN (cita multi-slot) -->
     <div *ngIf="getCeldaInfo(col, fila).tipo === 'continuacion'"
          class="cell-content continuacion">
       <!-- Continúa cita anterior -->
     </div>
   </ion-item>
   ```

3. **Estilos por tipo de celda**:
   ```scss
   .cell-content {
     padding: 8px;
     border-radius: 8px;
     min-height: 60px;

     &.libre {
       background: #f8f9fa;
       border: 2px dashed #dee2e6;
       display: flex;
       align-items: center;
       justify-content: center;
       color: #6c757d;
     }

     &.cita {
       background: var(--ion-color-primary-tint);
       border-left: 4px solid var(--ion-color-primary);

       &[data-status="Confirmado"] {
         background: #d4edda;
         border-color: #28a745;
       }

       &[data-status="Cobrado"] {
         background: #cce5ff;
         border-color: #007bff;
       }

       &[data-status="Reservado"] {
         background: #fff3cd;
         border-color: #ffc107;
       }
     }

     &.continuacion {
       background: linear-gradient(to bottom,
         transparent 0%,
         var(--ion-color-primary-tint) 20%,
         var(--ion-color-primary-tint) 100%
       );
       border-left: 4px solid var(--ion-color-primary);
     }
   }
   ```

**Resultado esperado**: Agenda visual con citas coloreadas según status

---

### 📋 FASE 3: Interactividad (2-3 horas)

**Objetivo**: Permitir crear y ver citas desde el carrusel

**Tareas**:

1. **Evento de click en celda**:
   ```typescript
   async onCellClick(columna: number, fila: number) {
     const celdaInfo = this.getCeldaInfo(columna, fila);

     if (celdaInfo.tipo === 'cita') {
       // Ver/editar cita existente
       await this.mostrarDetalleCita(celdaInfo.cita!);
     } else if (celdaInfo.tipo === 'libre') {
       // Crear nueva cita
       const terapeuta = this.terapeutas[columna];
       const horario = this.horarios[fila];
       await this.crearNuevaCita(terapeuta, horario);
     }
   }

   async crearNuevaCita(terapeuta: Terapeuta, horario: string) {
     const modal = await this.modalController.create({
       component: AppointmentFormComponent,
       componentProps: {
         mode: 'create',
         preselectedStaff: terapeuta.id,
         preselectedTime: this.combineDateTime(this.selectedDate, horario),
         selectedDate: this.selectedDate
       }
     });

     await modal.present();

     const { data, role } = await modal.onDidDismiss();
     if (role === 'confirm') {
       await this.loadAppointments(); // Recargar agenda
     }
   }

   async mostrarDetalleCita(cita: Reserva) {
     const modal = await this.modalController.create({
       component: AppointmentDetailComponent,
       componentProps: { appointment: cita }
     });

     await modal.present();

     const { data, role } = await modal.onDidDismiss();
     if (role === 'edit' || role === 'delete') {
       await this.loadAppointments(); // Recargar si hubo cambios
     }
   }
   ```

2. **Pre-selección en formulario**:
   - Personal pre-seleccionado según columna
   - Hora pre-seleccionada según fila
   - Fecha ya está seleccionada

**Resultado esperado**: Click en celda libre abre formulario, click en cita muestra detalle

---

### 📋 FASE 4: Navegación de Fechas (1-2 horas)

**Objetivo**: Permitir cambiar de día manteniendo el terapeuta actual

**Tareas**:

1. **Botones de navegación**:
   ```html
   <ion-header>
     <ion-toolbar>
       <!-- Navegación de fechas -->
       <ion-buttons slot="start">
         <ion-button (click)="previousDay()">
           <ion-icon name="chevron-back"></ion-icon>
         </ion-button>
       </ion-buttons>

       <ion-title>
         {{ selectedDate | date:'EEEE, d MMMM' }}
       </ion-title>

       <ion-buttons slot="end">
         <ion-button (click)="nextDay()">
           <ion-icon name="chevron-forward"></ion-icon>
         </ion-button>
         <ion-button (click)="openCalendar()">
           <ion-icon name="calendar"></ion-icon>
         </ion-button>
       </ion-buttons>
     </ion-toolbar>
   </ion-header>
   ```

2. **Lógica de navegación**:
   ```typescript
   async previousDay() {
     const currentIndex = this.swiper?.activeIndex || 0;

     this.selectedDate = new Date(this.selectedDate);
     this.selectedDate.setDate(this.selectedDate.getDate() - 1);

     await this.loadAppointments();

     // Mantener el mismo terapeuta
     this.swiper?.slideTo(currentIndex);
   }

   async nextDay() {
     const currentIndex = this.swiper?.activeIndex || 0;

     this.selectedDate = new Date(this.selectedDate);
     this.selectedDate.setDate(this.selectedDate.getDate() + 1);

     await this.loadAppointments();

     this.swiper?.slideTo(currentIndex);
   }
   ```

**Resultado esperado**: Cambiar de día mantiene el terapeuta visible

---

### 📋 FASE 5: Optimizaciones y Pulido (2-3 horas)

**Objetivo**: Mejorar rendimiento y experiencia de usuario

**Tareas**:

1. **Lazy loading de celdas**:
   - Solo renderizar celdas visibles en viewport
   - Usar `*ngIf` con flag de visibilidad

2. **Animaciones suaves**:
   ```scss
   .cell-content {
     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

     &:active {
       transform: scale(0.98);
     }
   }

   .swiper-slide {
     transition: opacity 0.3s ease;
   }
   ```

3. **Indicadores visuales**:
   - Badge con número de citas del día por terapeuta
   - Indicador de carga mientras actualiza
   - Feedback táctil (haptics) al cambiar de slide

4. **Gestos adicionales**:
   - Long press en celda para opciones rápidas
   - Swipe vertical para scroll suave
   - Pull to refresh

**Resultado esperado**: App fluida y responsiva

---

## 📊 INTEGRACIÓN CON SISTEMA ACTUAL

### Uso de MapaAgenda()

```typescript
async loadAppointments() {
  // 1. Ejecutar MapaAgenda() para generar matriz
  this.appointments = await this.agendaService.MapaAgenda(false);

  // 2. Obtener matriz generada
  this.arrMapa = this.agendaService.getInfoMapa();

  // 3. Obtener terapeutas activos
  const config = this.agendaService.getInfoConfigAgenda();
  this.terapeutas = config.arrTerapeutas || [];

  // 4. Obtener horarios
  this.horarios = this.agendaService.getInfoHorarios() as string[];
}
```

### Validación de Conflictos

```typescript
// Ya implementado en database.service.ts
// - verificarConflictoHorario() valida antes de guardar
// - addCitaTagenda() rechaza si hay conflicto
// - updateCitaTagenda() valida excluyendo cita actual
```

---

## 🎨 DISEÑO VISUAL

### Paleta de Colores (según status)

```scss
$color-libre: #f8f9fa;
$color-reservado: #fff3cd;
$color-confirmado: #d4edda;
$color-cobrado: #cce5ff;
$color-cancelado: #f8d7da;
$color-fuera-tiempo: #e2e3e5;
```

### Tipografía

```scss
.cita-header {
  font-weight: 600;
  font-size: 14px;
}

.servicio {
  font-size: 12px;
  color: #6c757d;
}

.costo {
  font-size: 14px;
  font-weight: 500;
  color: #28a745;
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### FASE 1: Estructura Base
- [ ] Instalar Swiper.js
- [ ] Crear estructura HTML del carrusel
- [ ] Implementar navegación entre terapeutas
- [ ] Agregar indicadores superiores

### FASE 2: Renderizado de Celdas
- [ ] Método getCeldaInfo()
- [ ] Renderizar celdas libres
- [ ] Renderizar celdas con citas
- [ ] Aplicar estilos por status
- [ ] Manejar citas multi-slot (continuación)

### FASE 3: Interactividad
- [ ] Click en celda libre → Formulario de nueva cita
- [ ] Click en cita → Detalle de cita
- [ ] Pre-selección de terapeuta y hora
- [ ] Recargar agenda después de crear/editar

### FASE 4: Navegación de Fechas
- [ ] Botones anterior/siguiente día
- [ ] Mantener terapeuta al cambiar fecha
- [ ] Modal de calendario
- [ ] Indicador de fecha actual

### FASE 5: Optimizaciones
- [ ] Lazy loading de celdas
- [ ] Animaciones suaves
- [ ] Haptic feedback
- [ ] Pull to refresh
- [ ] Indicadores de carga

---

## 🧪 PLAN DE PRUEBAS

### Pruebas Funcionales

1. ✅ Navegación entre terapeutas (swipe)
2. ✅ Click en celda libre abre formulario
3. ✅ Click en cita muestra detalle
4. ✅ Crear cita actualiza matriz
5. ✅ Editar cita refleja cambios
6. ✅ Eliminar cita libera espacio
7. ✅ Cambiar de fecha mantiene terapeuta
8. ✅ Validación de conflictos funciona

### Pruebas de Rendimiento

1. ✅ Carga rápida con 50+ citas
2. ✅ Swipe fluido sin lag
3. ✅ Scroll vertical suave
4. ✅ Sin memory leaks al cambiar fecha

---

## 📈 ESTIMACIÓN DE TIEMPO

| Fase | Tiempo Estimado | Prioridad |
|------|----------------|-----------|
| Fase 1: Estructura Base | 2-3 horas | 🔴 CRÍTICO |
| Fase 2: Renderizado | 3-4 horas | 🔴 CRÍTICO |
| Fase 3: Interactividad | 2-3 horas | 🟡 ALTO |
| Fase 4: Navegación | 1-2 horas | 🟡 ALTO |
| Fase 5: Optimizaciones | 2-3 horas | 🟢 MEDIO |
| **TOTAL** | **10-15 horas** | **~2 días** |

---

## 🎯 RESULTADO FINAL ESPERADO

✅ **Carrusel de agendas** donde cada terapeuta tiene su propio espacio
✅ **Sin conflictos** de horario entre terapeutas
✅ **Navegación intuitiva** con swipe horizontal
✅ **Visualización clara** de citas con colores por status
✅ **Interacción directa**: tap para crear/ver citas
✅ **Compatibilidad total** con sistema syserv original

---

## 🚀 ¿COMENZAMOS?

**Próximo paso sugerido**: FASE 1 - Estructura Base del Carrusel

¿Procedemos con la instalación de Swiper.js y la implementación del HTML base?
