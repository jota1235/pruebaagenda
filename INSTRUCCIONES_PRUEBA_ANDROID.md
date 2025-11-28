# 📱 INSTRUCCIONES PARA PROBAR EN ANDROID

## 🔧 PASOS PARA ABRIR EN ANDROID STUDIO

1. **Abre Android Studio manualmente**

2. **Selecciona "Open" y navega a:**
   ```
   c:\clon\agenda\android
   ```

3. **Espera a que Gradle sincronice el proyecto**
   - Puede tardar unos minutos la primera vez
   - Verifica que no haya errores de sincronización

4. **Conecta tu dispositivo Android o inicia el emulador**

5. **Click en el botón "Run" (▶️) para compilar y ejecutar**

---

## ✅ PRUEBAS A REALIZAR EN ANDROID

### 📋 CHECKLIST DE PRUEBAS

#### ✅ 1. VERIFICAR CITAS EXISTENTES
- [ ] Abre la app
- [ ] Navega a la pestaña "Agenda"
- [ ] Verifica que aparezcan las citas creadas previamente
- [ ] Busca en Logcat: `MapaAgenda` para ver los logs del algoritmo

**Logs esperados:**
```
✓ 📱 MapaAgenda() iniciado para fecha: YYYY-MM-DD
✓ 📊 FASE 1: Mapeando citas normales...
✓ ✅ MapaAgenda() completado: N citas mapeadas
```

---

#### ✅ 2. CREAR NUEVA CITA
- [ ] Click en el botón "+" (agregar cita)
- [ ] Selecciona un cliente
- [ ] Selecciona personal
- [ ] Cambia a pestaña "Conceptos"
- [ ] Agrega un servicio (prueba con servicio personalizado)
- [ ] Verifica cálculo automático de duración
- [ ] Guarda la cita
- [ ] Verifica que aparezca en la agenda

**Logs esperados:**
```
✓ 💾 Creando cita en tagenda...
✓ 📍 calcularSpacio() → id_personal: X, spacio: Y
✓ ✅ Cita creada con ID: Z
```

---

#### ✅ 3. VER DETALLE DE CITA
- [ ] Click en una cita de la agenda
- [ ] Verifica que se muestre el modal de detalle
- [ ] Verifica todos los datos:
  - Cliente
  - Personal
  - Fecha formateada
  - Hora formateada
  - Duración
  - Servicios
  - Costo total
  - Notas
- [ ] Verifica que los botones "Editar" y "Eliminar" estén visibles

---

#### ✅ 4. EDITAR CITA
- [ ] Desde el detalle, click en "Editar"
- [ ] Verifica que el formulario se pre-llene con los datos actuales
- [ ] Cambia algún dato (ejemplo: agregar un servicio)
- [ ] Guarda los cambios
- [ ] Verifica que la cita se actualice en la agenda

**Logs esperados:**
```
✓ ✏️ Actualizando cita ID: X
✓ 🔄 Eliminando servicios antiguos de tagenda_aux...
✓ 💾 Guardando N servicios en tagenda_aux...
✓ ✅ Cita actualizada exitosamente
```

---

#### ✅ 5. ELIMINAR CITA
- [ ] Desde el detalle, click en "Eliminar"
- [ ] Verifica que aparezca el diálogo de confirmación
- [ ] Confirma la eliminación
- [ ] Verifica que la cita desaparezca de la agenda
- [ ] Verifica que sea soft delete (activo=0)

**Logs esperados:**
```
✓ 🗑️ Eliminando cita ID: X
✓ ✅ Cita eliminada correctamente
✓ ✅ Cita eliminada, recargando agenda...
```

---

#### ✅ 6. VERIFICAR ALGORITMO MapaAgenda()
- [ ] Crea varias citas con el mismo personal en diferentes horarios
- [ ] Verifica que no se solapen
- [ ] Crea una cita que ocupe varios slots (ej: 60 min)
- [ ] Verifica que ocupe el espacio correcto
- [ ] Busca en Logcat los logs de cada fase

**Logs del algoritmo:**
```
✓ FASE 1: Mapeando citas normales
✓ FASE 2: Mapeando en columnas auxiliares
✓ FASE 3: Mapeando bloqueos
✓ FASE 4: Ajustando canceladas
✓ FASE 5: Bloqueando días inhábiles
✓ FASE 6: Aplicando restricciones
```

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### ❌ PROBLEMA: Las citas no aparecen
**✅ SOLUCIÓN:**
- Verifica la fecha seleccionada (debe tener citas)
- Busca en Logcat: `readReservas` o `getCitasTagenda`
- Verifica que haya datos en tagenda

### ❌ PROBLEMA: Error al crear cita
**✅ SOLUCIÓN:**
- Verifica que hayas seleccionado cliente Y personal
- Verifica que hayas agregado al menos un servicio
- Busca el error en Logcat

### ❌ PROBLEMA: Error al editar/eliminar
**✅ SOLUCIÓN:**
- Verifica que la cita tenga id_agenda válido
- Busca el error específico en Logcat

---

## 📊 DATOS DE PRUEBA SUGERIDOS

Para pruebas completas, crea:

### 1. Cita corta (30 min)
- **Cliente:** Cualquiera
- **Personal:** Terapeuta 1
- **Servicio:** "Corte simple" - 30 min - $100

### 2. Cita larga (90 min)
- **Cliente:** Otro
- **Personal:** Terapeuta 1
- **Servicios múltiples:**
  * "Corte" - 30 min - $150
  * "Tinte" - 60 min - $400

### 3. Citas simultáneas (diferentes terapeutas)
- Misma hora, diferentes terapeutas
- Verifica que MapaAgenda() los coloque en columnas diferentes

### 4. Servicio personalizado
- Escribe un nombre que no existe: "Tratamiento especial"
- Define precio: $500
- Duración: 45 min

---

## 📸 EVIDENCIAS RECOMENDADAS

Toma capturas de pantalla de:
1. Lista de citas en agenda
2. Modal de detalle de cita
3. Formulario de edición pre-llenado
4. Confirmación de eliminación
5. Logcat mostrando logs de MapaAgenda()

Esto nos ayudará a verificar que todo funciona correctamente.

---

## 🎯 VERIFICACIÓN FINAL

Una vez completadas todas las pruebas:

- [ ] Todas las citas se muestran correctamente
- [ ] Crear citas funciona sin errores
- [ ] Ver detalle muestra todos los datos
- [ ] Editar actualiza correctamente
- [ ] Eliminar hace soft delete
- [ ] MapaAgenda() ejecuta las 6 fases
- [ ] No hay errores en Logcat
- [ ] La app no se crashea

Si todas las pruebas pasan ✅, el sistema está listo para el siguiente paso:
**Implementación de la UI de carrusel de agenda con matriz visual**
