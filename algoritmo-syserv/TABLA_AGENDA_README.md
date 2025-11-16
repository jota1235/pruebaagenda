# 📊 Componente de Tabla de Agenda - Documentación

Traducción completa del archivo PHP `listar_calendario.php` a componente Angular/Ionic para renderizar la tabla HTML de la agenda.

## 📂 Archivos Incluidos

### 🔧 Archivos de Código

1. **`agenda-tabla.component.ts`** (700+ líneas)
   - Componente principal que renderiza la tabla de agenda
   - Procesa datos de citas y genera matriz de celdas
   - Maneja privilegios y permisos de usuario

2. **`agenda-tabla.component.html`**
   - Template HTML con estructura de tabla
   - Renderizado dinámico con *ngFor
   - Atributos data-* para compatibilidad

3. **`agenda-tabla.component.scss`** (400+ líneas)
   - Estilos completos para la tabla
   - Responsive design
   - Estados visuales de celdas
   - Modo oscuro compatible

4. **`agenda-privilegios.service.ts`** (300+ líneas)
   - Servicio para gestionar privilegios de usuario
   - Persistencia en localStorage
   - Métodos de verificación de permisos

---

## 🚀 Instalación

### 1. Copiar archivos al proyecto

```bash
# Estructura sugerida:
src/app/
├── components/
│   └── agenda-tabla/
│       ├── agenda-tabla.component.ts
│       ├── agenda-tabla.component.html
│       └── agenda-tabla.component.scss
└── services/
    ├── agenda.service.ts
    ├── agenda-privilegios.service.ts
    └── agenda.interfaces.ts
```

### 2. Registrar el componente

En `src/app/app.module.ts` o en el módulo correspondiente:

```typescript
import { AgendaTablaComponent } from './components/agenda-tabla/agenda-tabla.component';
import { AgendaPrivilegiosService } from './services/agenda-privilegios.service';

@NgModule({
  declarations: [
    AgendaTablaComponent
  ],
  providers: [
    AgendaPrivilegiosService
  ]
})
export class AppModule { }
```

---

## 🎯 Uso Básico

### Ejemplo 1: Uso en un componente padre

```typescript
import { Component, OnInit } from '@angular/core';
import { AgendaPrivilegiosService } from 'src/app/services/agenda-privilegios.service';

@Component({
  selector: 'app-mi-agenda',
  template: `
    <ion-content>
      <app-agenda-tabla
        [fecha]="fechaSeleccionada"
        [diasClientePremium]="365"
        (celdaClick)="onCeldaClick($event)"
        (celdaDblClick)="onCeldaDblClick($event)">
      </app-agenda-tabla>
    </ion-content>
  `
})
export class MiAgendaComponent implements OnInit {
  fechaSeleccionada: string = '2025-01-15';

  constructor(
    private privilegiosService: AgendaPrivilegiosService
  ) {}

  ngOnInit() {
    // Inicializar privilegios de prueba (para desarrollo)
    this.privilegiosService.inicializarPrivilegiosPrueba();
  }

  onCeldaClick(celda: any) {
    console.log('Celda clickeada:', celda);

    if (celda.status === 'Libre') {
      // Mostrar diálogo para crear nueva cita
      this.crearNuevaCita(celda);
    } else {
      // Mostrar detalles de la cita existente
      this.verDetallesCita(celda);
    }
  }

  onCeldaDblClick(celda: any) {
    console.log('Doble click en celda:', celda);

    if (celda.idReg) {
      // Editar cita existente
      this.editarCita(celda);
    }
  }

  crearNuevaCita(celda: any) {
    // Implementar lógica para crear nueva cita
    console.log('Crear nueva cita en:', celda.hora, 'Columna:', celda.spacio);
  }

  verDetallesCita(celda: any) {
    // Implementar lógica para ver detalles
    console.log('Ver cita ID:', celda.idReg);
  }

  editarCita(celda: any) {
    // Implementar lógica para editar
    console.log('Editar cita ID:', celda.idReg);
  }
}
```

### Ejemplo 2: Configurar privilegios de usuario

```typescript
import { Component, OnInit } from '@angular/core';
import { AgendaPrivilegiosService } from './services/agenda-privilegios.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html'
})
export class LoginPage implements OnInit {

  constructor(
    private privilegiosService: AgendaPrivilegiosService
  ) {}

  async iniciarSesion(usuario: any) {
    // Guardar datos de usuario
    this.privilegiosService.guardarDatosUsuario({
      ID_PERSONAL: usuario.id,
      usuario_Sel: usuario.username,
      handel: usuario.sucursal_id,
      nombre_completo: usuario.nombre
    });

    // Configurar privilegios según el rol del usuario
    this.privilegiosService.setPrivilegio('optAgendaModFecAnt_ID', usuario.puedeModificarFechasAnteriores);
    this.privilegiosService.setPrivilegio('optMarkEmpCit', usuario.marcarEmpleadoSolicitado);
    this.privilegiosService.setPrivilegio('optAgendProx_ID', usuario.soloAgendaPropia);
    this.privilegiosService.setPrivilegio('optNotNewCitas_ID', !usuario.puedeCrearCitas);
    this.privilegiosService.setPrivilegio('optNotEditCitas_ID', !usuario.puedeEditarCitas);
    this.privilegiosService.setPrivilegio('optVizCitCancel_ID', usuario.verCitasCanceladas);
    this.privilegiosService.setPrivilegio('optNotEditCols_ID', !usuario.puedeEditarColumnas);
    this.privilegiosService.setPrivilegio('optMarkPremium', usuario.marcarClientesPremium);
    this.privilegiosService.setPrivilegio('optHidCelCte', usuario.ocultarCelularCliente);

    // Redirigir a la agenda
    // ...
  }
}
```

### Ejemplo 3: Recargar tabla después de cambios

```typescript
import { Component, ViewChild } from '@angular/core';
import { AgendaTablaComponent } from './components/agenda-tabla/agenda-tabla.component';

@Component({
  selector: 'app-agenda-page',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Agenda</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="refrescar()">
            <ion-icon name="refresh"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <app-agenda-tabla
        #tablaAgenda
        [fecha]="fechaSeleccionada"
        (celdaClick)="onCeldaClick($event)">
      </app-agenda-tabla>
    </ion-content>
  `
})
export class AgendaPage {
  @ViewChild('tablaAgenda') tablaAgenda!: AgendaTablaComponent;

  fechaSeleccionada: string = '2025-01-15';

  async refrescar() {
    await this.tablaAgenda.recargar();
  }

  async onCeldaClick(celda: any) {
    // Manejar clic...

    // Después de hacer cambios, recargar la tabla
    await this.refrescar();
  }
}
```

---

## 🎨 Inputs y Outputs del Componente

### Inputs

| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `fecha` | `string` | `''` | Fecha a mostrar en formato YYYY-MM-DD |
| `diasClientePremium` | `number` | `365` | Días para considerar cliente premium |

### Outputs

| Output | Tipo | Descripción |
|--------|------|-------------|
| `celdaClick` | `EventEmitter<DatosCelda>` | Emite cuando se hace clic en una celda |
| `celdaDblClick` | `EventEmitter<DatosCelda>` | Emite cuando se hace doble clic en una celda |

### Interfaz DatosCelda

```typescript
interface DatosCelda {
  idReg: number;              // ID de la reservación
  cliente: string;            // Nombre del cliente
  tel1: string;               // Teléfono 1
  tel2: string;               // Teléfono 2
  idPersonal: number;         // ID del empleado
  notas: string;              // Notas de la cita
  hora: string;               // Hora de la cita
  spacio: number;             // Columna (espacio)
  status: string;             // Estado: Libre, Reservado, Confirmado, Cobrado, Cancelado, FueraTiempo
  idCliente: number;          // ID del cliente
  email: string;              // Email del cliente
  duracion: number;           // Duración en espacios
  notas2: string;             // Notas adicionales
  banCita: number;            // Bandera de empleado solicitado
  banLiquidCredito: number;   // Bandera de crédito liquidado
  serviciosAgenda: string;    // Servicios de la cita
  aliasPersonal: string;      // Alias del empleado
  backgroundColor: string;    // Color de fondo de la celda
  contenidoHTML: string;      // HTML renderizado de la celda
  rowspan: number;            // Número de filas que ocupa
  visible: boolean;           // Si la celda es visible
}
```

---

## 🔐 Privilegios de Usuario

### Privilegios Disponibles

| Privilegio | Descripción | Default |
|------------|-------------|---------|
| `optAgendaModFecAnt_ID` | Modificar fechas anteriores | `true` |
| `optMarkEmpCit` | Marcar empleado solicitado por cliente | `true` |
| `optAgendProx_ID` | Solo ver agenda del usuario actual | `false` |
| `optNotNewCitas_ID` | Prohibir crear nuevas citas | `false` |
| `optNotEditCitas_ID` | Prohibir editar citas existentes | `false` |
| `optVizCitCancel_ID` | Visualizar citas canceladas | `true` |
| `optNotEditCols_ID` | No editar columnas | `false` |
| `optMarkPremium` | Marcar clientes premium | `true` |
| `optHidCelCte` | Ocultar celular del cliente | `false` |

### Métodos del Servicio de Privilegios

```typescript
// Verificar privilegios
privilegiosService.tienePrivilegio('optAgendaModFecAnt_ID', true); // boolean
privilegiosService.puedeCrearCitas(); // boolean
privilegiosService.puedeEditarCitas(); // boolean
privilegiosService.soloAgendaPropia(); // boolean

// Establecer privilegios
privilegiosService.setPrivilegio('optNotNewCitas_ID', false);

// Datos de usuario
privilegiosService.guardarDatosUsuario({...});
privilegiosService.getIdUsuario(); // number
privilegiosService.getUsuario(); // string

// Limpiar
privilegiosService.limpiarPrivilegios();
```

---

## 🎨 Estados de Celdas

La tabla renderiza diferentes estados visuales según el status de cada celda:

| Status | Color | Descripción |
|--------|-------|-------------|
| `Libre` | Blanco (#FFFFFF) | Espacio disponible |
| `Reservado` | Amarillo (#FFF3CD) | Cita reservada |
| `Confirmado` | Verde (#D4EDDA) | Cita confirmada |
| `Cobrado` | Azul (#CCE5FF) | Cita cobrada |
| `Cancelado` | Rojo (#F8D7DA) | Cita cancelada |
| `FueraTiempo` | Gris (#E9ECEF) | No disponible o bloqueado |

---

## ⚙️ Métodos Públicos del Componente

### `recargar(): Promise<void>`

Recarga todos los datos de la tabla.

```typescript
await this.tablaAgenda.recargar();
```

### `cargarDatos(): Promise<void>`

Carga los datos de la agenda (se llama automáticamente en `ngOnInit`).

```typescript
await this.tablaAgenda.cargarDatos();
```

---

## 🔄 Flujo de Procesamiento de Datos

1. **Carga inicial**
   - Se establece la fecha
   - Se genera el mapa de reservaciones con `MapaAgenda()`
   - Se obtiene configuración, horarios, terapeutas

2. **Procesamiento**
   - Calcula cantidad de columnas
   - Genera encabezados
   - Crea matriz de celdas

3. **Renderizado**
   - Cada celda se procesa individualmente
   - Se aplican privilegios de usuario
   - Se genera el HTML de contenido
   - Se determina el color de fondo

4. **Interacción**
   - Click en celda emite evento `celdaClick`
   - Doble click emite evento `celdaDblClick`
   - El componente padre maneja la lógica de negocio

---

## 📱 Responsive Design

El componente es completamente responsive:

- **Móvil** (< 576px): Tabla compacta con fuentes pequeñas
- **Tablet** (768px - 1024px): Tamaño medio
- **Desktop** (> 1024px): Tabla completa con todos los detalles

---

## 🌙 Modo Oscuro

El componente soporta automáticamente modo oscuro usando:

```scss
@media (prefers-color-scheme: dark) {
  // Estilos específicos para modo oscuro
}
```

---

## 🖨️ Soporte de Impresión

Los estilos incluyen optimizaciones para impresión:

```scss
@media print {
  // Estilos optimizados para impresión
}
```

---

## ⚠️ Consideraciones Importantes

1. **Rendimiento**: Para agendas con muchas citas (>500), considera implementar virtualización

2. **Privilegios**: Los privilegios se guardan en `localStorage` - implementa sincronización con backend si es necesario

3. **Seguridad**: La tabla usa `[innerHTML]` - asegúrate de sanitizar los datos si vienen de fuentes no confiables

4. **Memoria**: Cada recarga genera una nueva matriz - considera implementar caché si recargas frecuentemente

---

## 🐛 Solución de Problemas

### La tabla no se renderiza

```typescript
// Verificar que la fecha esté en formato correcto
this.fechaSeleccionada = '2025-01-15'; // YYYY-MM-DD

// Verificar que se haya inicializado la base de datos
await this.agendaService.initDatabase();
```

### Las celdas no tienen colores

```typescript
// Verificar que la configuración se haya cargado
const config = this.agendaService.getInfoConfigAgenda();
console.log('Configuración:', config);
```

### Los privilegios no funcionan

```typescript
// Verificar que los privilegios se hayan guardado
const privilegios = this.privilegiosService.getPrivilegios();
console.log('Privilegios:', privilegios);
```

---

## 🔗 Relación con Otros Archivos

Este componente trabaja en conjunto con:

- **agenda.service.ts**: Servicio principal de lógica de negocio
- **agenda.interfaces.ts**: Definiciones de tipos
- **agenda-privilegios.service.ts**: Gestión de permisos

---

## 📝 Personalización

### Cambiar colores de estados

Edita los colores en la configuración de la agenda:

```typescript
const config = this.agendaService.getInfoConfigAgenda();
config.color_libre = '#CUSTOM_COLOR';
config.color_reservada = '#CUSTOM_COLOR';
// etc...
```

### Cambiar contenido de celdas

Modifica el método `generarContenidoCelda()` en el componente:

```typescript
private generarContenidoCelda(celda: DatosCelda): string {
  let html = '<div class="celda-contenido">';

  // Agregar tu contenido personalizado aquí

  html += '</div>';
  return html;
}
```

---

## 📚 Ejemplos Adicionales

Ver también:
- `agenda-ejemplo.component.ts` - Ejemplo completo de uso
- `AGENDA_SERVICE_README.md` - Documentación del servicio principal

---

**Versión:** 1.0.0
**Fecha:** 2025-01-13
**Traducido de:** `app/modulos/calendario/listar_calendario.php`
