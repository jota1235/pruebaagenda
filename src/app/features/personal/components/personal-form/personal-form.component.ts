import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonButtons,
  IonBackButton,
  IonToggle,
  IonIcon,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { DatabaseService } from '../../../../core/services/database.service';

interface Personal {
  id?: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  especialidad: string;
  activo: number;
  fecha_contratacion?: string;
}

@Component({
  selector: 'app-personal-form',
  templateUrl: './personal-form.component.html',
  styleUrls: ['./personal-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonButtons,
    IonBackButton,
    IonToggle,
    IonIcon
  ]
})
export class PersonalFormComponent implements OnInit {
  @Input() personalId?: number;

  personalForm!: FormGroup;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;

  especialidadesOpciones = [
    'Estilista',
    'Barbero',
    'Colorista',
    'Manicurista',
    'Pedicurista',
    'Masajista',
    'Esteticista',
    'Maquillador/a',
    'Terapeuta',
    'Recepcionista',
    'Gerente',
    'Otro'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private db: DatabaseService,
    private toastController: ToastController
  ) {
    addIcons({ saveOutline, closeOutline });
  }

  ngOnInit() {
    this.initForm();
    this.checkMode();
  }

  private initForm() {
    this.personalForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.email]],
      especialidad: ['', [Validators.required]],
      activo: [true],
      fecha_contratacion: ['']
    });
  }

  private async checkMode() {
    // Si se pasa personalId como @Input, usar ese
    let id = this.personalId;

    // Si no, intentar obtenerlo de la ruta
    if (!id) {
      const routeId = this.route.snapshot.paramMap.get('id');
      if (routeId) {
        id = parseInt(routeId, 10);
      }
    }

    if (id) {
      this.isEditMode = true;
      await this.loadPersonal(id);
    }
  }

  private async loadPersonal(id: number) {
    try {
      const personal = await this.db.getPersonalById(id);
      if (personal) {
        this.personalForm.patchValue({
          nombre: personal.nombre,
          apellido: personal.apellido,
          telefono: personal.telefono,
          email: personal.email || '',
          especialidad: personal.especialidad,
          activo: personal.activo === 1,
          fecha_contratacion: personal.fecha_contratacion || ''
        });
      }
    } catch (error) {
      console.error('Error cargando personal:', error);
      await this.showToast('Error al cargar los datos del empleado', 'danger');
    }
  }

  async onSubmit() {
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      await this.showToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    this.isSubmitting = true;

    try {
      const formValue = this.personalForm.value;
      const personalData: Personal = {
        nombre: formValue.nombre.trim(),
        apellido: formValue.apellido.trim(),
        telefono: formValue.telefono.trim(),
        email: formValue.email?.trim() || '',
        especialidad: formValue.especialidad,
        activo: formValue.activo ? 1 : 0,
        fecha_contratacion: formValue.fecha_contratacion || new Date().toISOString().split('T')[0]
      };

      if (this.isEditMode && this.personalId) {
        await this.db.updatePersonal(this.personalId, personalData);
        await this.showToast('Empleado actualizado correctamente', 'success');
      } else {
        await this.db.addPersonal(personalData);
        await this.showToast('Empleado agregado correctamente', 'success');
      }

      this.router.navigate(['/personal']);
    } catch (error) {
      console.error('Error guardando personal:', error);
      await this.showToast('Error al guardar el empleado', 'danger');
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel() {
    this.router.navigate(['/personal']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.personalForm.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es requerido';
    }
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['pattern']) {
      if (fieldName === 'telefono') {
        return 'Ingresa un teléfono válido de 10 dígitos';
      }
    }
    if (control.errors['email']) {
      return 'Ingresa un correo electrónico válido';
    }

    return '';
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
