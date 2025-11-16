import { Injectable } from '@angular/core';

/**
 * Servicio de Privilegios de Agenda
 * Maneja todos los permisos y privilegios de usuario para la agenda
 * Traducido desde funciones_privilegios.php
 */
@Injectable({
  providedIn: 'root'
})
export class AgendaPrivilegiosService {

  // Configuración de privilegios del usuario actual
  private privilegios: { [key: string]: boolean } = {};

  // Datos de sesión del usuario
  private userData: any = {};

  constructor() {
    this.cargarPrivilegios();
  }

  /**
   * Carga los privilegios desde localStorage o configuración inicial
   */
  private cargarPrivilegios(): void {
    const privilegiosGuardados = localStorage.getItem('userPrivilegios');

    if (privilegiosGuardados) {
      this.privilegios = JSON.parse(privilegiosGuardados);
    } else {
      // Privilegios por defecto (todos habilitados para desarrollo)
      this.privilegios = {
        'optAgendaModFecAnt_ID': true,      // Modificar fechas anteriores
        'optMarkEmpCit': true,              // Marcar empleado solicitado por cliente
        'optAgendProx_ID': false,           // Solo ver agenda del usuario actual
        'optNotNewCitas_ID': false,         // Prohibir crear nuevas citas
        'optNotEditCitas_ID': false,        // Prohibir editar citas existentes
        'optVizCitCancel_ID': true,         // Visualizar citas canceladas
        'optNotEditCols_ID': false,         // No editar columnas
        'optMarkPremium': true,             // Marcar clientes premium
        'optHidCelCte': false               // Ocultar celular del cliente
      };
    }

    // Cargar datos de usuario
    const userDataGuardados = localStorage.getItem('userData');
    if (userDataGuardados) {
      this.userData = JSON.parse(userDataGuardados);
    }
  }

  /**
   * Guarda los privilegios en localStorage
   */
  guardarPrivilegios(): void {
    localStorage.setItem('userPrivilegios', JSON.stringify(this.privilegios));
  }

  /**
   * Guarda los datos de usuario
   */
  guardarDatosUsuario(userData: any): void {
    this.userData = userData;
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  /**
   * Verifica si el usuario tiene un privilegio específico
   * @param privilegio Clave del privilegio
   * @param returnBoolean Si true retorna boolean, si false retorna 'inline-block' o 'none'
   */
  tienePrivilegio(privilegio: string, returnBoolean: boolean = false): boolean | string {
    const tiene = this.privilegios[privilegio] === true;

    if (returnBoolean) {
      return tiene;
    }

    return tiene ? 'inline-block' : 'none';
  }

  /**
   * Establece un privilegio específico
   */
  setPrivilegio(privilegio: string, valor: boolean): void {
    this.privilegios[privilegio] = valor;
    this.guardarPrivilegios();
  }

  /**
   * Obtiene todos los privilegios
   */
  getPrivilegios(): { [key: string]: boolean } {
    return { ...this.privilegios };
  }

  /**
   * Obtiene los datos del usuario actual
   */
  getUserData(): any {
    return { ...this.userData };
  }

  /**
   * Obtiene el ID del usuario actual
   */
  getIdUsuario(): number {
    return this.userData.ID_PERSONAL || 0;
  }

  /**
   * Obtiene el nombre de usuario actual
   */
  getUsuario(): string {
    return this.userData.usuario_Sel || '';
  }

  /**
   * Obtiene el handle (ID sucursal) del usuario actual
   */
  getHandel(): number {
    return this.userData.handel || 0;
  }

  /**
   * Verifica si puede modificar fechas anteriores
   */
  puedeModificarFechasAnteriores(): boolean {
    return this.tienePrivilegio('optAgendaModFecAnt_ID', true) as boolean;
  }

  /**
   * Verifica si debe marcar empleados solicitados
   */
  debeMarcarEmpleadoSolicitado(): boolean {
    return this.tienePrivilegio('optMarkEmpCit', true) as boolean;
  }

  /**
   * Verifica si solo puede ver su propia agenda
   */
  soloAgendaPropia(): boolean {
    return this.tienePrivilegio('optAgendProx_ID', true) as boolean;
  }

  /**
   * Verifica si puede crear nuevas citas
   */
  puedeCrearCitas(): boolean {
    return !this.tienePrivilegio('optNotNewCitas_ID', true) as boolean;
  }

  /**
   * Verifica si puede editar citas existentes
   */
  puedeEditarCitas(): boolean {
    return !this.tienePrivilegio('optNotEditCitas_ID', true) as boolean;
  }

  /**
   * Verifica si puede ver citas canceladas
   */
  puedeVerCitasCanceladas(): boolean {
    return this.tienePrivilegio('optVizCitCancel_ID', true) as boolean;
  }

  /**
   * Verifica si puede editar columnas
   */
  puedeEditarColumnas(): boolean {
    return !this.tienePrivilegio('optNotEditCols_ID', true) as boolean;
  }

  /**
   * Verifica si debe marcar clientes premium
   */
  debeMarcarClientesPremium(): boolean {
    return this.tienePrivilegio('optMarkPremium', true) as boolean;
  }

  /**
   * Verifica si debe ocultar el celular del cliente
   */
  debeOcultarCelular(): boolean {
    return this.tienePrivilegio('optHidCelCte', true) as boolean;
  }

  /**
   * Limpia todos los privilegios y datos de usuario
   */
  limpiarPrivilegios(): void {
    this.privilegios = {};
    this.userData = {};
    localStorage.removeItem('userPrivilegios');
    localStorage.removeItem('userData');
  }

  /**
   * Inicializa privilegios de prueba (útil para desarrollo)
   */
  inicializarPrivilegiosPrueba(): void {
    this.privilegios = {
      'optAgendaModFecAnt_ID': true,
      'optMarkEmpCit': true,
      'optAgendProx_ID': false,
      'optNotNewCitas_ID': false,
      'optNotEditCitas_ID': false,
      'optVizCitCancel_ID': true,
      'optNotEditCols_ID': false,
      'optMarkPremium': true,
      'optHidCelCte': false
    };

    this.userData = {
      ID_PERSONAL: 1,
      usuario_Sel: 'admin',
      handel: 1,
      nombre_completo: 'Usuario de Prueba'
    };

    this.guardarPrivilegios();
    this.guardarDatosUsuario(this.userData);
  }
}
