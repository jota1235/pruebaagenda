import { Component } from '@angular/core';
import { ClienteFormComponent } from '../../components/cliente-form/cliente-form.component';

@Component({
  selector: 'app-cliente-edit',
  template: '<app-cliente-form></app-cliente-form>',
  standalone: true,
  imports: [ClienteFormComponent]
})
export class ClienteEditPage {}
