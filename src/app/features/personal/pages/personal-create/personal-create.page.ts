import { Component } from '@angular/core';
import { PersonalFormComponent } from '../../components/personal-form/personal-form.component';

@Component({
  selector: 'app-personal-create',
  template: '<app-personal-form></app-personal-form>',
  standalone: true,
  imports: [PersonalFormComponent]
})
export class PersonalCreatePage {}
