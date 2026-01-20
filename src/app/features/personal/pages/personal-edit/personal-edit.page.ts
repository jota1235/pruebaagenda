import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PersonalFormComponent } from '../../components/personal-form/personal-form.component';

@Component({
  selector: 'app-personal-edit',
  template: '<app-personal-form [personalId]="personalId"></app-personal-form>',
  standalone: true,
  imports: [PersonalFormComponent]
})
export class PersonalEditPage implements OnInit {
  personalId?: number;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.personalId = parseInt(id, 10);
    }
  }
}
