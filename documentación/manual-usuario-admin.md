# Manual de Usuario: Panel Administrativo (IA Booking Central)

Este documento sirve como guía completa para el personal de recepción y administración del hotel de cápsulas **Cápsula Condesa**. Explica el uso del panel de control para gestionar reservas, verificar pagos por transferencia, realizar check-ins y modificar tarifas.

---

## 🔐 1. Acceso y Seguridad

El panel de administración está completamente aislado del portal público del cliente para evitar accesos no autorizados.

* **Dirección de Acceso**: Ingresa manualmente en la barra de direcciones de tu navegador:  
  `http://tu-dominio.com/admin` (o `http://localhost:3000/admin` en desarrollo).
* **Credenciales de Acceso**:
  * **Usuario**: `Capsule-admin26`
  * **Contraseña**: `BDrtzD@jk91lL8_SNm53`
* **Persistencia de Sesión**: Al iniciar sesión con éxito, la sesión se guardará activamente en la pestaña de tu navegador (`sessionStorage`). Si cierras la pestaña o el navegador, la sesión se cerrará de forma automática por seguridad.
* **Cierre de Sesión Manual**: Puedes hacer clic en el botón **Cerrar Sesión** en la parte inferior del menú lateral izquierdo en cualquier momento para bloquear el panel.

---

## 🌐 2. Selector de Idioma (Español / Inglés)

El panel es completamente bilingüe. En la esquina superior derecha del encabezado, encontrarás el botón selector de idioma (`🌐 ES / EN`). 
Al hacer clic en él, toda la interfaz del panel (textos, descripciones, tablas, estados de pago e incluso los nombres de los días en las gráficas) se traducirá instantáneamente al idioma elegido.

---

## 📊 3. Módulo 1: Dashboard (Métricas y Reportes)

Esta pestaña te ofrece una vista analítica en tiempo real del estado del hotel:

1. **Tarjetas de Métricas Clave**:
   * **Ingresos Confirmados**: Dinero total acumulado por reservaciones ya pagadas.
   * **Reservas Confirmadas**: Cantidad de cápsulas o habitaciones reservadas y totalmente pagadas.
   * **Por Verificar (Transferencias)**: Cantidad de reservaciones bloqueadas temporalmente a la espera de que revises su comprobante de pago.
   * **Clientes Únicos**: Número total de personas registradas en la base de datos de fidelidad.
2. **Gráficos de Desempeño**:
   * **Tasa de Ocupación Mensual**: Barra porcentual de la demanda de hospedaje en base al total de 42 unidades del hotel.
   * **Ingresos Mensuales**: Gráfico comparativo de ingresos acumulados en pesos mexicanos.
   * **Días de Mayor Demanda**: Gráfico de barras indicando qué días de la semana registran la mayor cantidad de Check-Ins, ideal para optimizar tarifas.
   * **Distribución**: Resumen numérico sobre la preferencia de métodos de pago (PayPal vs Transferencias) y tipos de hospedaje (Cápsulas vs Cuartos Privados).

---

## 📅 4. Módulo 2: Gestión de Reservas (Operaciones Diarias)

Este es el módulo central de trabajo de la recepción. Muestra todas las reservaciones en orden cronológico inverso (la más nueva primero).

### A. Buscador y Filtros
* **Buscador**: Puedes escribir en la barra superior el nombre del huésped, su correo, teléfono o el código de reserva (`CB-XXXXX`) para filtrar de forma inmediata.
* **Selector de Estados**: Filtra las reservas por:
  * *Todos los Estados*
  * *Por Verificar Pago* (Reservas por transferencia con comprobante pendiente de revisar).
  * *Confirmados* (Reservas pagadas listas para su llegada).
  * *Check-in Realizado* (Huéspedes activos en cápsulas).
  * *Cancelados*

### B. Ciclo de Vida de una Reserva por Transferencia Bancaria
1. **Registro del Cliente**: El cliente reserva en el frontend y sube su imagen o PDF de transferencia. La reserva entra al sistema con estado **Pendiente** y **Bloqueada** (el cupo queda asegurado permanentemente para evitar sobreventas).
2. **Verificación de Comprobante**:
   * En la tabla de reservas, localiza la reserva y haz clic en el botón del **Ojo (Eye)**.
   * Si es una imagen (PNG/JPG), se renderizará en pantalla. Si es un archivo PDF, se mostrará un botón de descarga para que puedas abrirlo y revisarlo en tu computadora.
3. **Aprobación del Pago**:
   * Una vez que verifiques el ingreso del dinero en la banca del hotel, haz clic en el botón **Aprobar Depósito** (dentro del visor) o en el botón del **Check (Confirmar)** en la tabla de acciones.
   * La reserva pasará a estado **Confirmado** (color cian) y **se enviará automáticamente un correo electrónico de confirmación** al huésped con sus datos de ingreso.
4. **Check-In (Asignación FIFO)**:
   * Cuando el huésped llegue al hotel, localízalo en el buscador y haz clic en el botón de la **Llave (Check-in)**.
   * Se abrirá un modal donde deberás ingresar el número de la cabina física que ocupará (ej. del 1 al 40 para cápsulas; o 1 para cuartos).
   * Al hacer clic en **Asignar Cabina**, la reserva quedará marcada como **Activa en Pod** con el número asignado en la tabla.
5. **Cancelación**:
   * Si detectas un comprobante falso o el cliente cancela, haz clic en el botón de la **X (Cancelar)**. El sistema liberará ese cupo inmediatamente en el catálogo para que pueda volver a ser reservado por otro cliente.

---

## 👥 5. Módulo 3: Clientes Frecuentes (CRM de Fidelidad)

El sistema agrupa automáticamente a los huéspedes recurrentes comparando su número telefónico y correo electrónico.
En esta tabla puedes consultar:
* El nombre del huésped.
* Su contacto (móvil y email).
* La **cantidad de visitas** realizadas.
* El **monto acumulado pagado** al hotel (ideal para ofrecer descuentos o programas de puntos).
* La fecha de su último Check-in.

---

## ⚙️ 6. Módulo 4: Tarifas del Catálogo

Permite al administrador reaccionar a la temporada alta/baja modificando las tarifas base en segundos:

1. Ve a la pestaña **Tarifas Catálogo**.
2. Identifica el tipo de cabina que deseas modificar:
   * *Cápsula Individual (Pod)*
   * *Habitación con Baño Privado*
   * *Habitación sin Baño Privado*
3. Haz clic en **Modificar Tarifa**.
4. Escribe el nuevo precio en pesos mexicanos y haz clic en **Guardar** (o *Cancelar* si te arrepientes).
5. El cambio se aplicará instantáneamente a todas las cotizaciones futuras que hagan los clientes en el portal público.

---

## 💡 7. Mantenimiento Automático (Auto-Limpieza)

El sistema cuenta con un limpiador automático incorporado. Cada vez que cargas el panel administrativo o que un cliente consulta disponibilidad en la web principal, el servidor elimina de forma automática aquellas reservas temporales con estado `blocked` que hayan superado los 10 minutos de gracia sin que el cliente completara su pago. Esto garantiza que el inventario de cápsulas siempre esté actualizado y libre de bloqueos fantasma.
