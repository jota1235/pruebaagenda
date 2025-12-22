import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  chevronForwardOutline,
  closeOutline,
  todayOutline
} from 'ionicons/icons';

/**
 * Interface para representar un día en el calendario
 */
export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  hasAppointments: boolean;
  appointmentCount: number;
}

@Component({
  selector: 'app-calendar-inline',
  templateUrl: './calendar-inline.component.html',
  styleUrls: ['./calendar-inline.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon
  ]
})
export class CalendarInlineComponent implements OnInit {
  // Eventos de salida
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() close = new EventEmitter<void>();

  // Fecha actual y seleccionada
  today: Date = new Date();
  currentDate: Date = new Date();
  selectedDate: Date = new Date();

  // Mes y año que se está mostrando
  displayMonth!: number;
  displayYear!: number;

  // Días de la semana
  weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Meses del año
  monthNames: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Semanas del mes (array de días)
  weeks: CalendarDay[][] = [];

  // Mock de citas (días con citas)
  // TODO: Reemplazar con datos reales desde el servicio
  appointmentDates: Set<string> = new Set([
    this.formatDate(new Date()), // Hoy
    this.formatDate(new Date(2025, 10, 12)), // 12 de noviembre
    this.formatDate(new Date(2025, 10, 15)), // 15 de noviembre
    this.formatDate(new Date(2025, 10, 20)), // 20 de noviembre
    this.formatDate(new Date(2025, 10, 25)), // 25 de noviembre
  ]);

  constructor() {
    // Registrar iconos
    addIcons({
      chevronBackOutline,
      chevronForwardOutline,
      closeOutline,
      todayOutline
    });
  }

  ngOnInit() {
    // Inicializar con el mes actual
    this.displayMonth = this.currentDate.getMonth();
    this.displayYear = this.currentDate.getFullYear();
    this.selectedDate = new Date(this.currentDate);

    // Generar calendario
    this.generateCalendar();
  }

  /**
   * Generar el calendario del mes actual
   */
  generateCalendar() {
    this.weeks = [];

    // Primer día del mes
    const firstDay = new Date(this.displayYear, this.displayMonth, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Domingo, 6 = Sábado

    // Último día del mes
    const lastDay = new Date(this.displayYear, this.displayMonth + 1, 0);
    const lastDayOfMonth = lastDay.getDate();

    // Último día del mes anterior
    const lastDayPrevMonth = new Date(this.displayYear, this.displayMonth, 0).getDate();

    let week: CalendarDay[] = [];

    // Días del mes anterior (para completar la primera semana)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = lastDayPrevMonth - i;
      const date = new Date(this.displayYear, this.displayMonth - 1, dayNum);
      week.push(this.createCalendarDay(date, dayNum, false));
    }

    // Días del mes actual
    for (let day = 1; day <= lastDayOfMonth; day++) {
      const date = new Date(this.displayYear, this.displayMonth, day);
      week.push(this.createCalendarDay(date, day, true));

      // Si completamos una semana (7 días), agregamos a weeks y creamos nueva semana
      if (week.length === 7) {
        this.weeks.push(week);
        week = [];
      }
    }

    // Días del mes siguiente (para completar la última semana)
    if (week.length > 0) {
      let day = 1;
      while (week.length < 7) {
        const date = new Date(this.displayYear, this.displayMonth + 1, day);
        week.push(this.createCalendarDay(date, day, false));
        day++;
      }
      this.weeks.push(week);
    }
  }

  /**
   * Crear objeto CalendarDay
   */
  createCalendarDay(date: Date, dayNumber: number, isCurrentMonth: boolean): CalendarDay {
    const dateStr = this.formatDate(date);
    const todayStr = this.formatDate(this.today);
    const selectedStr = this.formatDate(this.selectedDate);

    return {
      date: date,
      dayNumber: dayNumber,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedStr,
      isCurrentMonth: isCurrentMonth,
      hasAppointments: this.appointmentDates.has(dateStr),
      appointmentCount: this.appointmentDates.has(dateStr) ? Math.floor(Math.random() * 5) + 1 : 0
    };
  }

  /**
   * Formatear fecha a string YYYY-MM-DD
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Navegar al mes anterior
   */
  previousMonth() {
    if (this.displayMonth === 0) {
      this.displayMonth = 11;
      this.displayYear--;
    } else {
      this.displayMonth--;
    }
    this.generateCalendar();
  }

  /**
   * Navegar al mes siguiente
   */
  nextMonth() {
    if (this.displayMonth === 11) {
      this.displayMonth = 0;
      this.displayYear++;
    } else {
      this.displayMonth++;
    }
    this.generateCalendar();
  }

  /**
   * Ir al mes actual (hoy)
   */
  goToToday() {
    this.displayMonth = this.today.getMonth();
    this.displayYear = this.today.getFullYear();
    this.selectedDate = new Date(this.today);
    this.generateCalendar();
  }

  /**
   * Seleccionar un día
   */
  selectDay(day: CalendarDay) {
    // Solo permitir seleccionar días del mes actual
    if (!day.isCurrentMonth) {
      return;
    }

    this.selectedDate = new Date(day.date);
    this.generateCalendar();

    // Emitir fecha seleccionada
    this.dateSelected.emit(day.date);
  }

  /**
   * Cerrar el calendario
   */
  closeCalendar() {
    this.close.emit();
  }

  /**
   * Obtener el título del mes/año
   */
  getMonthYearTitle(): string {
    return `${this.monthNames[this.displayMonth]} ${this.displayYear}`;
  }
}
