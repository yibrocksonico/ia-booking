# Roadmap del Sistema IA Booking - Cápsula Condesa

Este documento define el mapa de ruta (roadmap) para el desarrollo, despliegue y mantenimiento del sistema **IA Booking** del hotel de cápsulas ubicado en la Colonia Condesa, CDMX.

---

## 🚀 Fase 1: Arquitectura y Configuración del Entorno (Completado)
- [x] **Estructura del Proyecto**: Inicializar el proyecto con Next.js (TypeScript) y configurar el sistema de diseño basado en `ESTILO IA BOOKING.md` (Vanilla CSS, variables personalizadas, fuentes de Google: Space Grotesk, Inter, JetBrains Mono).
- [x] **Modelo de Base de Datos**: Diseñar y configurar la base de datos (SQLite localmente para desarrollo rápido; PostgreSQL para Cloud SQL en producción) usando **Prisma ORM**.
- [x] **Definición de Entornos**: Configurar archivos `.env.development` y `.env.production` para la separación de entornos.
- [x] **Dockerización**: Crear el `Dockerfile` para la portabilidad y el despliegue en Google Cloud Run.

---

## 🏨 Fase 2: Portal de Reservaciones del Cliente (Front-End & Backend Core) (Completado)
- [x] **Página Principal de Alto Impacto**:
  - Landing page con estética futurista (cyberpunk/espacial) usando la paleta de colores (Cian Neón, Azul Eléctrico, Índigo Profundo, Negro Medianoche).
  - Indicador dinámico de disponibilidad en tiempo real (Pods y Cuartos Privados) para el día actual y rangos de fecha seleccionados.
  - Sección de beneficios (Coworking, Relax) utilizando los acentos Oro/Ámbar y Magenta Neón.
- [x] **Motor de Reservación Interactiva**:
  - Selector de fechas (Check-in / Check-out).
  - Formulario de datos mínimos: Nombre completo, email, móvil (WhatsApp).
  - Cálculo dinámico de tarifas usando el catálogo de precios de la base de datos.
- [x] **Bloqueo Temporal de Reservas**:
  - Implementación de bloqueo de cupo (10 minutos) durante el proceso de pago para evitar la sobreventa.

---

## 💳 Fase 3: Pasarelas de Pago e Integración (Completado)
- [x] **Checkout Dinámico**:
  - Integración de pago con **PayPal** (Botón inteligente de PayPal Sandbox/Producción).
  - Integración de **Transferencia Bancaria** (Despliegue de datos CLABE, formulario para subir comprobante de pago).
- [x] **Confirmación y Envío de Comprobante**:
  - Generación de código de reservación único con formato monoespaciado (`CB-XXXXX`).
  - Envío automático de correo de confirmación de reserva (PayPal de forma inmediata; transferencia al confirmarse el pago por el admin en `/admin`).
  - Enlaces dinámicos de WhatsApp para contacto y soporte.
  - Integración del logotipo oficial `logo-hotel-capsula-condesa-horiz.webp` en las cabeceras de ambos portales y como favicon de pestaña.

---

## 📊 Fase 4: Panel de Control Administrativo (Back-Office) (Completado)
- [x] **Dashboard Principal**:
  - Vista general de reservaciones activas, ingresos mensuales y tasa de ocupación actual.
- [x] **Gestión de Reservas y Clientes**:
  - Buscador de clientes con historial de visitas (frecuencia de reserva) y detalles de contacto.
  - Control de check-in manual (asignación FIFO al llegar) y cambio de estado de reserva.
- [x] **Catálogo de Precios**:
  - Interfaz de edición rápida para los precios de cápsulas individuales y cuartos privados.
- [x] **Módulo de Reportes Sugeridos**:
  - Reportes mensuales de ingresos y ocupación.
  - Distribución de métodos de pago (PayPal vs Transferencia).
  - Análisis de días de mayor demanda (para optimización de tarifas).

---

## ☁️ Fase 5: Infraestructura en Google Cloud (DevOps) (Completado)
- [x] **Configuración de Google Cloud SQL**:
  - Instancia de PostgreSQL en Cloud SQL.
  - Configuración de backups y accesos seguros mediante Cloud SQL Auth Proxy.
- [x] **Configuración de Google Cloud Run**:
  - Despliegue del contenedor Docker de desarrollo y producción.
  - Configuración de variables de entorno y secretos en Secret Manager.
- [x] **Manual de Despliegue**:
  - Crear guías paso a paso para la replicación del entorno.

---

## ⚡ Fase 6: Verificación y Lanzamiento en Producción (Completado)
- [x] **Prueba de Conexión Segura**: Configurar la variable `DATABASE_URL` codificando los caracteres especiales de la contraseña y la ruta de conexión del socket de Cloud SQL.
- [x] **Prueba de Extremo a Extremo en Producción**: Validar que la aplicación en Cloud Run se conecte exitosamente a la base de datos de producción (PostgreSQL en Cloud SQL) y permita el registro de reservas.

---

## 🔒 Fase 7: Seguridad y Localización (Bilingüe) (Completado)
- [x] **Aislamiento y Login del Administrador**: Proteger el portal administrativo `/admin` mediante un panel de inicio de sesión con credenciales específicas y almacenamiento seguro de la sesión.
- [x] **Soporte Bilingüe (Español / Inglés)**: Implementar internacionalización (i18n) completa mediante diccionario dinámico (`translations.ts`) y selector de idioma en el menú superior.
- [x] **Manual de Operación**: Crear y documentar el manual de usuario de administración en [documentación/manual-usuario-admin.md](file:///d:/PROYECTOS/CAPSULA%20CONDESA/IA-BOOKING/documentación/manual-usuario-admin.md).



