# Servicio de Agenda para Ionic + Angular + sql.js

Traducción completa de la clase PHP `agenda` a TypeScript para aplicaciones móviles Android con Ionic + Angular y base de datos local SQLite usando sql.js.

## 📋 Descripción

Este servicio replica toda la funcionalidad del archivo PHP `.ht-agenda.php` permitiendo:

- ✅ Gestión completa de agenda de citas
- ✅ Visualización de horarios y terapeutas/empleados
- ✅ Mapeo de reservas y disponibilidad
- ✅ Cálculo automático de espacios y duraciones
- ✅ Control de asistencia
- ✅ Reportes y listados
- ✅ Base de datos SQLite local (offline-first)
- ✅ Exportación/importación de datos

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install sql.js
npm install @types/sql.js --save-dev
```

### 2. Descargar el archivo WASM

Descarga `sql-wasm.wasm` desde el repositorio de sql.js y colócalo en:

```
src/assets/sql-wasm.wasm
```

### 3. Copiar los archivos

Copia los archivos generados en tu proyecto Ionic:

```
src/app/services/agenda.service.ts
src/app/interfaces/agenda.interfaces.ts
```

### 4. Configurar Angular

Asegúrate de que Angular pueda servir archivos `.wasm`. En `angular.json`:

```json
{
  "projects": {
    "app": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              "src/assets",
              {
                "glob": "**/*.wasm",
                "input": "node_modules/sql.js/dist/",
                "output": "assets/"
              }
            ]
          }
        }
      }
    }
  }
}
```

## 📖 Uso Básico

### 1. Importar el servicio

```typescript
import { Component, OnInit } from '@angular/core';
import { AgendaService } from './services/agenda.service';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html'
})
export class AgendaPage implements OnInit {

  constructor(private agendaService: AgendaService) {}

  async ngOnInit() {
    // Esperar a que la base de datos se inicialice
    await this.agendaService.initDatabase();
  }
}
```

### 2. Configurar la agenda

```typescript
// Establecer sucursal
this.agendaService.setHandel(1);
this.agendaService.setEmpresaBase(1);

// Establecer fecha de operación
this.agendaService.setFechaAg('2025-01-15');

// Configurar incrementos de tiempo (minutos)
this.agendaService.setMinutosIncremento(30);

// Minutos de antelación para reservas
this.agendaService.setMinutosAntelacion(15);
```

### 3. Leer configuración de la agenda

```typescript
// Leer configuración completa
const config = await this.agendaService.readConfigAgenda('2025-01-15');

if (config) {
  const configData = this.agendaService.getInfoConfigAgenda();
  console.log('Hora inicio:', configData.hora_inicio);
  console.log('Hora fin:', configData.hora_fin);
  console.log('Terapeutas:', configData.arrTerapeutas);
  console.log('Número de columnas:', configData.num_columnas);
}
```

### 4. Obtener horarios de la agenda

```typescript
// Leer horarios disponibles
this.agendaService.readHorariosAgenda();

// Obtener lista de horarios
const horariosCompletos = this.agendaService.getInfoHorarios(true);
// Resultado: [{ militar: "09:00", regular: "09:00 am", mark: true }, ...]

const horariosSimples = this.agendaService.getInfoHorarios(false);
// Resultado: ["09:00", "09:30", "10:00", ...]
```

### 5. Leer terapeutas/empleados

```typescript
// Leer información de terapeutas
const tieneTerapeutas = this.agendaService.ReadColsTerapeutas();

if (tieneTerapeutas) {
  const terapeutas = this.agendaService.getInfoColsTerapeutas();

  terapeutas.forEach(terapeuta => {
    console.log(`${terapeuta.alias}: ${terapeuta.nombre}`);
  });
}
```

### 6. Leer reservas/citas del día

```typescript
// Leer todas las reservas de una fecha
const tieneReservas = this.agendaService.readReservas('2025-01-15');

if (tieneReservas) {
  const reservas = this.agendaService.getInfoReservas();

  reservas.forEach(reserva => {
    console.log(`Cita ${reserva.id_agenda}:`);
    console.log(`  Cliente: ${reserva.cliente}`);
    console.log(`  Hora: ${reserva.hora}`);
    console.log(`  Status: ${reserva.status}`);
    console.log(`  Terapeuta: ${reserva.nombre_personal}`);
  });
}
```

### 7. Generar mapa de ocupación

```typescript
// Generar mapa completo de la agenda
this.agendaService.setFechaAg('2025-01-15');
const citasProcesadas = this.agendaService.MapaAgenda(true);

// Obtener mapa de ocupación
const mapa = this.agendaService.getArrMapa();

// mapa[columna][fila] contiene:
// '' = espacio libre
// 'número' = ID de la cita
// 'X' = continuación de cita
// 'i' = día inhábil
// 'd' = columna deshabilitada
```

### 8. Verificar disponibilidad

```typescript
// Calcular espacios requeridos para servicios
const idsServicios = '1|2|3'; // IDs separados por |
const espaciosRequeridos = this.agendaService.CalcEspaciosListServicios(idsServicios, 1);

// Verificar si un espacio está disponible
const filaInicial = 5;  // Fila (horario)
const columna = 2;      // Columna (terapeuta)

const disponible = this.agendaService.isDisponible(filaInicial, columna, espaciosRequeridos);

if (disponible) {
  console.log('El espacio está disponible');
} else {
  console.log('El espacio está ocupado');
}
```

### 9. Bloquear espacios temporalmente

```typescript
// Agregar bloqueo temporal (útil durante el proceso de reserva)
this.agendaService.setArrCita([
  {
    id_agenda: '-1',
    id_cliente: '-1',
    id_atiende: '5',
    hora: '10:00',
    espacios_duracion: 2,
    columna: 1,
    notas: 'Espacio bloqueado temporalmente',
    alias_atiende: 'TEMP',
    nombre_atiende: 'Bloqueo temporal'
  }
]);

// Luego generar el mapa
this.agendaService.MapaAgenda(false);
```

### 10. Calcular horarios

```typescript
// Calcular hora de fin de una cita
const horaInicio = '09:00';
const espacios = 3; // Duración en espacios

const horaFin = this.agendaService.calcHorario(horaInicio, espacios);
console.log(`De ${horaInicio} a ${horaFin}`);
// Resultado: "De 09:00 a 10:30 am" (si incremento es 30 min)
```

## 🎯 Ejemplos de Uso Avanzado

### Ejemplo 1: Mostrar agenda en una tabla

```typescript
export class AgendaPage implements OnInit {
  horarios: any[] = [];
  terapeutas: any[] = [];
  mapa: string[][] = [];

  constructor(private agendaService: AgendaService) {}

  async ngOnInit() {
    await this.cargarAgenda('2025-01-15');
  }

  async cargarAgenda(fecha: string) {
    // Configurar servicio
    this.agendaService.setFechaAg(fecha);
    this.agendaService.setHandel(1);

    // Leer configuración
    await this.agendaService.readConfigAgenda(fecha);

    // Generar mapa
    this.agendaService.MapaAgenda(false);

    // Obtener datos para visualización
    this.horarios = this.agendaService.getInfoHorarios(true) as any[];
    this.terapeutas = this.agendaService.getInfoColsTerapeutas();
    this.mapa = this.agendaService.getArrMapa();
  }

  getCeldaClass(columna: number, fila: number): string {
    const valor = this.mapa[columna][fila];

    if (valor === '') return 'libre';
    if (valor === 'X') return 'ocupado';
    if (valor === 'i') return 'inhabil';
    if (valor === 'd') return 'deshabilitado';

    return 'reservado';
  }

  getCitaId(columna: number, fila: number): number | null {
    const valor = this.mapa[columna][fila];
    const numero = parseInt(valor);
    return isNaN(numero) ? null : numero;
  }
}
```

HTML correspondiente:

```html
<ion-content>
  <table class="agenda-table">
    <thead>
      <tr>
        <th>Hora</th>
        <th *ngFor="let terapeuta of terapeutas">
          {{ terapeuta.alias }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let horario of horarios; let fila = index">
        <td class="hora-cell">{{ horario.regular }}</td>
        <td *ngFor="let terapeuta of terapeutas; let columna = index"
            [class]="getCeldaClass(columna, fila)"
            (click)="onCeldaClick(columna, fila)">
          <span *ngIf="getCitaId(columna, fila)">
            {{ getCitaId(columna, fila) }}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</ion-content>
```

### Ejemplo 2: Buscar primera disponibilidad

```typescript
buscarPrimeraDisponibilidad(espaciosRequeridos: number): any {
  const horarios = this.agendaService.getInfoHorarios(false) as string[];
  const numColumnas = this.agendaService.readNCols();
  const mapa = this.agendaService.getArrMapa();

  for (let fila = 0; fila < horarios.length; fila++) {
    for (let columna = 0; columna < numColumnas; columna++) {
      if (this.agendaService.isDisponible(fila, columna, espaciosRequeridos)) {
        return {
          encontrado: true,
          fila: fila,
          columna: columna,
          hora: horarios[fila],
          terapeuta: this.agendaService.ColIdUser(columna)
        };
      }
    }
  }

  return { encontrado: false };
}
```

### Ejemplo 3: Exportar/Importar base de datos

```typescript
// Exportar base de datos
exportarBaseDatos() {
  const blob = this.agendaService.exportDatabase();

  if (blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agenda_${new Date().getTime()}.sqlite`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Importar base de datos
async importarBaseDatos(event: any) {
  const file = event.target.files[0];

  if (file) {
    const success = await this.agendaService.importDatabase(file);

    if (success) {
      console.log('Base de datos importada exitosamente');
    } else {
      console.error('Error al importar base de datos');
    }
  }
}
```

## 🔧 Métodos Disponibles

### Setters (Configuración)

| Método | Descripción |
|--------|-------------|
| `setHandel(id)` | Establece ID de sucursal |
| `setEmpresaBase(id)` | Establece ID de empresa base |
| `setMinutosIncremento(min)` | Establece incremento de tiempo en minutos |
| `setFechaAg(fecha)` | Establece fecha de operación |
| `setIdCliente(id)` | Establece ID de cliente |
| `setMinutosAntelacion(min)` | Establece minutos de antelación para reservas |
| `setSucursal(alcance)` | Define alcance: 'suc_act' o 'all_eb' |
| `setPeriodo(f1, f2)` | Establece rango de fechas |
| `setValidHorario(bool)` | Permite agregar horarios dinámicamente |
| `setExcludeIdAgenda(id)` | Excluye una cita del mapeo |
| `setArrCita(array)` | Agrega citas simuladas al mapa |
| `setDisponyCols(config)` | Configura columnas disponibles |

### Getters (Obtención de datos)

| Método | Descripción |
|--------|-------------|
| `getInfoConfigAgenda()` | Obtiene configuración completa |
| `getInfoColsTerapeutas()` | Obtiene lista de terapeutas |
| `getInfoHorarios(all?)` | Obtiene horarios (simple o completo) |
| `getInfoReservas()` | Obtiene lista de reservas |
| `getArrMapa()` | Obtiene mapa de ocupación |
| `getMaxColAg()` | Obtiene máxima columna visible |
| `getFechaAg()` | Obtiene fecha actual de operación |
| `getIdsFueraTiempo()` | Obtiene IDs de bloqueos |
| `getPosColums()` | Obtiene posiciones de columnas |

### Métodos de lectura de datos

| Método | Descripción |
|--------|-------------|
| `readConfigAgenda(fecha?)` | Lee configuración de la agenda |
| `readReservas(fecha?)` | Lee reservas de un día |
| `readHorariosAgenda(h1, h2, inc?, sav?)` | Lee horarios disponibles |
| `ReadColsTerapeutas()` | Lee información de terapeutas |
| `ReadMediosInformativos()` | Lee medios promocionales |

### Métodos de cálculo y validación

| Método | Descripción |
|--------|-------------|
| `MapaAgenda(update?)` | Genera mapa completo de ocupación |
| `isDisponible(fila, col, esp)` | Verifica disponibilidad de espacio |
| `calcHorario(inicio, esp, fmt?)` | Calcula hora de fin |
| `CalcEspaciosListServicios(ids, def?)` | Calcula espacios para servicios |
| `hora_inicio_reservas(valida?)` | Obtiene primera hora reservable |
| `IdentificaColumna(id, col?)` | Identifica columna de empleado |
| `IdentificaFila(hora)` | Identifica fila de horario |
| `isTimeInRange(time, start, end)` | Verifica si hora está en rango |

### Métodos de columnas auxiliares

| Método | Descripción |
|--------|-------------|
| `ActualizaColsAux(n, fecha?)` | Actualiza columnas auxiliares |
| `addColAux(fecha)` | Añade columna auxiliar |
| `subColAux(fecha)` | Quita columna auxiliar |
| `readNCols(incluirAux?)` | Lee número total de columnas |

### Métodos de base de datos

| Método | Descripción |
|--------|-------------|
| `initDatabase()` | Inicializa base de datos |
| `exportDatabase()` | Exporta BD como Blob |
| `importDatabase(file)` | Importa BD desde archivo |
| `clearDatabase()` | Limpia completamente la BD |

## 📊 Estructura de Datos

### ConfigAgenda

```typescript
{
  puesto_servicio: string;
  hora_inicio: number;
  hora_fin: number;
  minutos_incremento: number;
  color_libre: string;
  color_reservada: string;
  color_confirmada: string;
  color_cancelada: string;
  color_cobrado: string;
  rangoManual: boolean;
  vizNombreTerapeuta: boolean;
  col_aux: number;
  arrTerapeutas: Terapeuta[];
  arrLisTerapeutas: number[];
  disponibilidad: {
    hora_inicio: number;
    hora_fin: number;
    dia_habil: boolean;
  };
}
```

### Reserva

```typescript
{
  id_agenda: number;
  id_cliente: number;
  id_personal: number;
  hora: string;
  status: 'Cobrado' | 'Confirmado' | 'Reservado' | 'Cancelado' | 'FueraTiempo';
  duracion: number;
  columna: number;
  cliente: string;
  notas: string;
  alias_personal: string;
  nombre_personal: string;
}
```

## 🎨 Estados del Mapa

El mapa de ocupación (`getArrMapa()`) retorna una matriz donde cada celda puede tener:

| Valor | Significado |
|-------|-------------|
| `''` (vacío) | Espacio libre/disponible |
| Número (ej: `'123'`) | ID de la cita que ocupa ese espacio |
| `'X'` | Continuación de una cita (ocupa varios espacios) |
| `'i'` | Día inhábil (cerrado) |
| `'d'` | Columna deshabilitada |

## ⚠️ Consideraciones Importantes

1. **Inicialización**: Siempre espera a que `initDatabase()` se complete antes de usar el servicio.

2. **Persistencia**: Los datos se guardan automáticamente en `localStorage`. Para cambios críticos, considera implementar sincronización con servidor.

3. **Rendimiento**: Para agendas con muchas columnas y horarios, el método `MapaAgenda()` puede tardar. Considera usar loading indicators.

4. **Validación**: El servicio no valida datos de entrada. Implementa validaciones en tus componentes.

5. **Memoria**: sql.js carga toda la BD en memoria. Para bases de datos grandes (>50MB), considera alternativas como Capacitor SQLite.

## 🐛 Solución de Problemas

### La base de datos no se inicializa

```typescript
// Asegúrate de que el archivo WASM esté en la ruta correcta
async initDatabase() {
  try {
    this.SQL = await initSqlJs({
      locateFile: file => `assets/${file}` // Ajusta la ruta según tu configuración
    });
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Los datos no persisten

```typescript
// Verifica que saveDatabase() se llame después de cada cambio
private saveDatabase(): void {
  if (!this.db) return;

  const data = this.db.export();
  const buffer = JSON.stringify(Array.from(data));
  localStorage.setItem('agendaDB', buffer);

  console.log('BD guardada, tamaño:', buffer.length); // Debug
}
```

### Errores de SQL

```typescript
// Activa el modo debug en executeQuery
private executeQuery(query: string, params: any[] = []): any[] {
  console.log('Query:', query);
  console.log('Params:', params);

  // ... resto del código
}
```

## 📝 Licencia

Este código es una traducción del sistema original PHP y mantiene la misma funcionalidad y estructura.

## 🤝 Contribuciones

Para reportar errores o sugerir mejoras, por favor crea un issue en el repositorio.

## 📞 Soporte

Para preguntas sobre el uso del servicio, consulta la documentación o contacta al equipo de desarrollo.
