import { Component } from '@angular/core';
import { ServicioFormComponent } from '../../components/servicio-form/servicio-form.component';

@Component({
  selector: 'app-servicio-edit',
  template: '<app-servicio-form></app-servicio-form>',
  standalone: true,
  imports: [ServicioFormComponent]
})
export class ServicioEditPage {}
