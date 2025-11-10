import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonButtons,
  IonNote,
  IonItemDivider,
  IonSelect,
  IonSelectOption,
  IonRange
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  moonOutline,
  notificationsOutline,
  languageOutline,
  volumeMediumOutline,
  lockClosedOutline,
  downloadOutline,
  trashOutline,
  informationCircleOutline,
  chevronBackOutline,
  checkmarkOutline,
  mailOutline,
  helpCircleOutline,
  documentTextOutline
} from 'ionicons/icons';

interface SettingOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  value: boolean;
}

@Component({
  selector: 'app-settings-main',
  templateUrl: './settings-main.page.html',
  styleUrls: ['./settings-main.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonButtons,
    IonNote,
    IonItemDivider,
    IonSelect,
    IonSelectOption,
    IonRange
  ]
})
export class SettingsMainPage implements OnInit {
  // Modo oscuro
  isDarkMode: boolean = false;

  // Notificaciones
  notificationSettings = {
    push: true,
    email: false,
    sms: true,
    reminders: true
  };

  // Idioma seleccionado
  selectedLanguage: string = 'es';

  // Volumen de notificaciones
  notificationVolume: number = 70;

  // Versión de la app
  appVersion: string = '1.0.0';

  // Tamaño de caché
  cacheSize: string = '45 MB';

  constructor(private router: Router) {
    // Registrar iconos
    addIcons({
      moonOutline,
      notificationsOutline,
      languageOutline,
      volumeMediumOutline,
      lockClosedOutline,
      downloadOutline,
      trashOutline,
      informationCircleOutline,
      chevronBackOutline,
      checkmarkOutline,
      mailOutline,
      helpCircleOutline,
      documentTextOutline
    });
  }

  ngOnInit() {
    // Cargar preferencias desde localStorage
    this.loadDarkModePreference();
    this.loadVolumePreference();
    this.loadNotificationPreferences();
    this.loadLanguagePreference();
  }

  /**
   * Cargar preferencia de modo oscuro
   */
  loadDarkModePreference() {
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode === 'true';
    this.applyDarkMode(this.isDarkMode);
  }

  /**
   * Cargar preferencia de volumen
   */
  loadVolumePreference() {
    const savedVolume = localStorage.getItem('notificationVolume');
    if (savedVolume !== null) {
      this.notificationVolume = parseInt(savedVolume, 10);
    }
  }

  /**
   * Cargar preferencias de notificaciones
   */
  loadNotificationPreferences() {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings !== null) {
      this.notificationSettings = JSON.parse(savedSettings);
    }
  }

  /**
   * Guardar preferencias de notificaciones
   */
  saveNotificationPreferences() {
    localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
  }

  /**
   * Cargar preferencia de idioma
   */
  loadLanguagePreference() {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage !== null) {
      this.selectedLanguage = savedLanguage;
    }
  }

  /**
   * Toggle de modo oscuro
   */
  toggleDarkMode(event: any) {
    this.isDarkMode = event.detail.checked;
    this.applyDarkMode(this.isDarkMode);

    // Guardar preferencia
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  /**
   * Aplicar o remover modo oscuro
   */
  applyDarkMode(isDark: boolean) {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  /**
   * Toggle de notificaciones push
   */
  togglePushNotifications(event: any) {
    this.notificationSettings.push = event.detail.checked;
    this.saveNotificationPreferences();
    console.log('Push notifications:', this.notificationSettings.push);
    // TODO: Implementar habilitación/deshabilitación de push
  }

  /**
   * Toggle de notificaciones por email
   */
  toggleEmailNotifications(event: any) {
    this.notificationSettings.email = event.detail.checked;
    this.saveNotificationPreferences();
    console.log('Email notifications:', this.notificationSettings.email);
  }

  /**
   * Toggle de notificaciones SMS
   */
  toggleSmsNotifications(event: any) {
    this.notificationSettings.sms = event.detail.checked;
    this.saveNotificationPreferences();
    console.log('SMS notifications:', this.notificationSettings.sms);
  }

  /**
   * Toggle de recordatorios
   */
  toggleReminders(event: any) {
    this.notificationSettings.reminders = event.detail.checked;
    this.saveNotificationPreferences();
    console.log('Reminders:', this.notificationSettings.reminders);
  }

  /**
   * Cambiar idioma
   */
  onLanguageChange(event: any) {
    this.selectedLanguage = event.detail.value;

    // Guardar preferencia
    localStorage.setItem('selectedLanguage', this.selectedLanguage);

    console.log('Idioma seleccionado:', this.selectedLanguage);
    // TODO: Implementar cambio de idioma en la app
  }

  /**
   * Cambiar volumen
   */
  onVolumeChange(event: any) {
    this.notificationVolume = event.detail.value;

    // Guardar preferencia en localStorage
    localStorage.setItem('notificationVolume', this.notificationVolume.toString());

    console.log('Volumen guardado:', this.notificationVolume);
  }

  /**
   * Limpiar caché
   */
  clearCache() {
    console.log('Limpiando caché...');
    // Simular limpieza
    setTimeout(() => {
      this.cacheSize = '0 MB';
      console.log('Caché limpiado');
    }, 500);
    // TODO: Implementar limpieza real de caché
  }

  /**
   * Borrar datos locales
   */
  clearLocalData() {
    console.log('Advertencia: Esta acción borrará todos los datos locales');
    // TODO: Mostrar confirmación y borrar datos
  }

  /**
   * Ver política de privacidad
   */
  viewPrivacyPolicy() {
    console.log('Abriendo política de privacidad...');
    // TODO: Navegar a página de privacidad o abrir URL
  }

  /**
   * Ver términos de servicio
   */
  viewTerms() {
    console.log('Abriendo términos de servicio...');
    // TODO: Navegar a página de términos o abrir URL
  }

  /**
   * Contactar soporte
   */
  contactSupport() {
    console.log('Abriendo soporte...');
    // TODO: Abrir email o chat de soporte
  }

  /**
   * Ver información de la app
   */
  viewAppInfo() {
    console.log('Información de la app');
    // TODO: Mostrar modal con información detallada
  }

  /**
   * Volver al menú
   */
  goBack() {
    this.router.navigate(['/menu']);
  }
}
