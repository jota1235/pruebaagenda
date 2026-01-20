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
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonNote,
  AlertController,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  saveOutline,
  cutOutline,
  documentTextOutline,
  cashOutline,
  timeOutline,
  listOutline
} from 'ionicons/icons';
import { DatabaseService } from '../../../../core/services/database.service';

@Component({
  selector: 'app-servicio-form',
  templateUrl: './servicio-form.component.html',
  styleUrls: ['./servicio-form.component.scss'],
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
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonNote
  ]
})
export class ServicioFormComponent implements OnInit {
  @Input() servicioId?: number;

  servicioForm!: FormGroup;
  isEditMode = false;
  pageTitle = 'Nuevo Servicio';

  // Configuración de espacios (15 minutos por espacio)
  minutosPerEspacio = 15;

  // Opciones de duración (en espacios)
  duracionOpciones = [
    { value: 1, label: '15 min' },
    { value: 2, label: '30 min' },
    { value: 3, label: '45 min' },
    { value: 4, label: '1 hora' },
    { value: 6, label: '1h 30min' },
    { value: 8, label: '2 horas' },
    { value: 12, label: '3 horas' }
  ];

  // Categorías predefinidas
  categorias = [
    'Corte',
    'Color',
    'Tratamiento',
    'Manicure',
    'Pedicure',
    'Maquillaje',
    'Masaje',
    'Facial',
    'Depilación',
    'Otro'
  ];

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
      cutOutline,
      documentTextOutline,
      cashOutline,
      timeOutline,
      listOutline
    });
  }

  ngOnInit() {
    this.initForm();

    // Verificar si es modo edición
    const id = this.servicioId || this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.pageTitle = 'Editar Servicio';
      this.loadServicio(+id);
    }
  }

  /**
   * Inicializar formulario
   */
  initForm() {
    this.servicioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      duracion: [2, [Validators.required, Validators.min(1)]], // 2 espacios = 30 min por defecto
      categoria: ['']
    });
  }

  /**
   * Cargar datos del servicio para editar
   */
  async loadServicio(id: number) {
    const loading = await this.loadingController.create({
      message: 'Cargando servicio...'
    });
    await loading.present();

    try {
      const servicio = await this.databaseService.getServicioById(id);

      if (servicio) {
        this.servicioForm.patchValue({
          nombre: servicio.nombre,
          descripcion: servicio.descripcion,
          precio: servicio.precio,
          duracion: servicio.duracion,
          categoria: servicio.categoria
        });
      } else {
        await this.showToast('Servicio no encontrado', 'danger');
        this.goBack();
      }
    } catch (error) {
      console.error('Error cargando servicio:', error);
      await this.showToast('Error al cargar servicio', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Guardar servicio (crear o actualizar)
   */
  async saveServicio() {
    if (this.servicioForm.invalid) {
      await this.showValidationErrors();
      return;
    }

    const loading = await this.loadingController.create({
      message: this.isEditMode ? 'Actualizando servicio...' : 'Creando servicio...'
    });
    await loading.present();

    try {
      const formValue = this.servicioForm.value;
      const servicioData = {
        nombre: formValue.nombre.trim(),
        descripcion: formValue.descripcion?.trim() || '',
        precio: parseFloat(formValue.precio),
        duracion: parseInt(formValue.duracion),
        categoria: formValue.categoria || null
      };

      if (this.isEditMode && this.servicioId) {
        await this.databaseService.updateServicio(this.servicioId, servicioData);
        await this.showToast('Servicio actualizado correctamente', 'success');
      } else {
        await this.databaseService.addServicio(servicioData);
        await this.showToast('Servicio creado correctamente', 'success');
      }

      this.goBack();
    } catch (error) {
      console.error('Error guardando servicio:', error);
      await this.showToast('Error al guardar servicio', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Mostrar errores de validación
   */
  async showValidationErrors() {
    const errors: string[] = [];

    if (this.servicioForm.get('nombre')?.hasError('required')) {
      errors.push('El nombre es obligatorio');
    }
    if (this.servicioForm.get('nombre')?.hasError('minlength')) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    }
    if (this.servicioForm.get('precio')?.hasError('required')) {
      errors.push('El precio es obligatorio');
    }
    if (this.servicioForm.get('precio')?.hasError('min')) {
      errors.push('El precio debe ser mayor o igual a 0');
    }
    if (this.servicioForm.get('duracion')?.hasError('required')) {
      errors.push('La duración es obligatoria');
    }
    if (this.servicioForm.get('duracion')?.hasError('min')) {
      errors.push('La duración debe ser al menos 1 espacio (15 min)');
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
    if (this.servicioForm.dirty) {
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
    this.router.navigate(['/servicios']);
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
    const field = this.servicioForm.get(fieldName);
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
    const field = this.servicioForm.get(fieldName);
    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }
    if (field.hasError('min')) {
      const min = field.getError('min').min;
      return `El valor debe ser mayor o igual a ${min}`;
    }

    return '';
  }

  /**
   * Obtener label de duración seleccionada
   */
  getDuracionLabel(): string {
    const duracion = this.servicioForm.get('duracion')?.value;
    if (!duracion) return '';

    const opcion = this.duracionOpciones.find(o => o.value === parseInt(duracion));
    return opcion ? opcion.label : `${duracion * this.minutosPerEspacio} min`;
  }
}
