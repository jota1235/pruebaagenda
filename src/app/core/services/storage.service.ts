import { Injectable } from '@angular/core';

/**
 * Servicio simple de almacenamiento usando localStorage
 * Reemplaza SQLite por ser más simple y confiable
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PREFIX = 'agenda_';

  constructor() {}

  /**
   * Guarda datos en localStorage
   */
  set(key: string, value: any): void {
    try {
      const fullKey = this.PREFIX + key;
      localStorage.setItem(fullKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Error guardando ${key}:`, error);
    }
  }

  /**
   * Obtiene datos de localStorage
   */
  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const fullKey = this.PREFIX + key;
      const item = localStorage.getItem(fullKey);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error leyendo ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Elimina un item de localStorage
   */
  remove(key: string): void {
    try {
      const fullKey = this.PREFIX + key;
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error(`Error eliminando ${key}:`, error);
    }
  }

  /**
   * Limpia todos los datos de la agenda
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error limpiando storage:', error);
    }
  }

  /**
   * Verifica si existe un key
   */
  has(key: string): boolean {
    const fullKey = this.PREFIX + key;
    return localStorage.getItem(fullKey) !== null;
  }
}
