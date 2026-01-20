import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonNote,
  AlertController,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  saveOutline,
  personOutline,
  callOutline,
  mailOutline,
  calendarOutline,
  transgenderOutline,
  documentTextOutline
} from 'ionicons/icons';
import { DatabaseService } from '../../../../core/services/database.service';

@Component({
  selector: 'app-cliente-form',
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonNote
  ]
})
export class ClienteFormComponent implements OnInit {
  @Input() clienteId?: number;

  clienteForm!: FormGroup;
  isEditMode = false;
  pageTitle = 'Nuevo Cliente';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private databaseService: DatabaseService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({
      arrowBackOutline,
      saveOutline,
      personOutline,
      callOutline,
      mailOutline,
      calendarOutline,
      transgenderOutline,
      documentTextOutline
    });
  }

  ngOnInit() {
    this.initForm();

    // Verificar si es modo edición
    const id = this.clienteId || this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.pageTitle = 'Editar Cliente';
      this.loadCliente(+id);
    }
  }

  /**
   * Inicializar formulario
   */
  initForm() {
    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.email]],
      fecha_nacimiento: [''],
      genero: [''],
      notas: ['']
    });
  }

  /**
   * Cargar datos del cliente para editar
   */
  async loadCliente(id: number) {
    const loading = await this.loadingController.create({
      message: 'Cargando cliente...'
    });
    await loading.present();

    try {
      const cliente = await this.databaseService.getClienteById(id);

      if (cliente) {
        this.clienteForm.patchValue({
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          telefono: cliente.telefono,
          email: cliente.email,
          fecha_nacimiento: cliente.fecha_nacimiento,
          genero: cliente.genero,
          notas: cliente.notas
        });
      } else {
        await this.showToast('Cliente no encontrado', 'danger');
        this.goBack();
      }
    } catch (error) {
      console.error('Error cargando cliente:', error);
      await this.showToast('Error al cargar cliente', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Guardar cliente (crear o actualizar)
   */
  async saveCliente() {
    if (this.clienteForm.invalid) {
      await this.showValidationErrors();
      return;
    }

    const loading = await this.loadingController.create({
      message: this.isEditMode ? 'Actualizando cliente...' : 'Creando cliente...'
    });
    await loading.present();

    try {
      const formValue = this.clienteForm.value;
      const clienteData = {
        nombre: formValue.nombre.trim(),
        apellido: formValue.apellido.trim(),
        telefono: formValue.telefono.trim(),
        email: formValue.email?.trim() || null,
        fecha_nacimiento: formValue.fecha_nacimiento || null,
        genero: formValue.genero || null,
        notas: formValue.notas?.trim() || null
      };

      if (this.isEditMode && this.clienteId) {
        await this.databaseService.updateCliente(this.clienteId, clienteData);
        await this.showToast('Cliente actualizado correctamente', 'success');
      } else {
        await this.databaseService.addCliente(clienteData);
        await this.showToast('Cliente creado correctamente', 'success');
      }

      this.goBack();
    } catch (error) {
      console.error('Error guardando cliente:', error);
      await this.showToast('Error al guardar cliente', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Mostrar errores de validación
   */
  async showValidationErrors() {
    const errors: string[] = [];

    if (this.clienteForm.get('nombre')?.hasError('required')) {
      errors.push('El nombre es obligatorio');
    }
    if (this.clienteForm.get('nombre')?.hasError('minlength')) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
    if (this.clienteForm.get('apellido')?.hasError('required')) {
      errors.push('El apellido es obligatorio');
    }
    if (this.clienteForm.get('apellido')?.hasError('minlength')) {
      errors.push('El apellido debe tener al menos 2 caracteres');
    }
    if (this.clienteForm.get('telefono')?.hasError('required')) {
      errors.push('El teléfono es obligatorio');
    }
    if (this.clienteForm.get('telefono')?.hasError('pattern')) {
      errors.push('El teléfono debe tener 10 dígitos');
    }
    if (this.clienteForm.get('email')?.hasError('email')) {
      errors.push('El email no es válido');
    }

    const alert = await this.alertController.create({
      header: 'Errores de validación',
      message: errors.join('<br>'),
      buttons: ['OK']
    });

    await alert.present();
  }

  /**
   * Confirmar cancelación si hay cambios
   */
  async confirmCancel() {
    if (this.clienteForm.dirty) {
      const alert = await this.alertController.create({
        header: 'Descartar cambios',
        message: '¿Estás seguro de que deseas descartar los cambios?',
        buttons: [
          {
            text: 'Continuar editando',
            role: 'cancel'
          },
          {
            text: 'Descartar',
            role: 'destructive',
            handler: () => {
              this.goBack();
            }
          }
        ]
      });

      await alert.present();
    } else {
      this.goBack();
    }
  }

  /**
   * Volver atrás
   */
  goBack() {
    this.router.navigate(['/clientes']);
  }

  /**
   * Mostrar toast
   */
  async showToast(message: string, color: string = 'dark') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  /**
   * Verificar si un campo tiene errores
   */
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.clienteForm.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.touched && field.hasError(errorType);
    }
    return field.touched && field.invalid;
  }

  /**
   * Obtener mensaje de error de un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.clienteForm.get(fieldName);
    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }
    if (field.hasError('pattern')) {
      if (fieldName === 'telefono') {
        return 'Debe tener 10 dígitos';
      }
    }
    if (field.hasError('email')) {
      return 'Email no válido';
    }

    return '';
  }
}
