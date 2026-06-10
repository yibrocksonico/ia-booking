# Guía de Despliegue (Local vs Producción en Google Cloud)

Esta guía detalla los pasos para configurar el entorno **Local** de desarrollo y el entorno de **Producción** (Google Cloud Platform con Cloud SQL + Cloud Run) del sistema **IA Booking**.

---

## 🏗️ Requisitos Previos (Para Producción)

1. Una cuenta de Google Cloud y un proyecto creado (ej. `ia-booking-prod`).
2. Google Cloud CLI (`gcloud`) instalado y autenticado localmente:
   ```bash
   gcloud auth login
   gcloud config set project ID_DE_TU_PROYECTO_PROD
   ```
3. Docker instalado y en ejecución localmente.

---

## 🗄️ Paso 1: Configurar la Base de Datos en Google Cloud SQL

Utilizaremos **Cloud SQL (PostgreSQL)** como motor de base de datos para producción.

1. **Habilitar la API de Cloud SQL**:
   ```bash
   gcloud services enable sqladmin.googleapis.com
   ```
2. **Crear la Instancia de PostgreSQL**:
   Reemplaza `ia-booking-db` por el nombre que prefieras y define una contraseña segura para el usuario por defecto (`postgres`):
   ```bash
   gcloud sql instances create ia-booking-db \
     --database-version=POSTGRES_15 \
     --tier=db-f1-micro \
     --region=us-central1 \
     --root-password="TU_CONTRASEÑA_SUPER_SEGURA"
   ```
   *Nota: La máquina `db-f1-micro` es la más económica y es ideal para el inicio del proyecto en producción; si la demanda escala, se puede cambiar de nivel de hardware fácilmente desde la consola de GCP.*

3. **Crear la Base de Datos**:
   Crea la base de datos llamada `iabooking`:
   ```bash
   gcloud sql databases create iabooking --instance=ia-booking-db
   ```

---

## 🐳 Paso 2: Compilación y Almacenamiento de Contenedores

Utilizaremos **Google Artifact Registry** para hospedar nuestras imágenes Docker.

1. **Habilitar las APIs de Artifact Registry y Cloud Run**:
   ```bash
   gcloud services enable artifactregistry.googleapis.com run.googleapis.com
   ```
2. **Crear un Repositorio en Artifact Registry**:
   Crea un repositorio de Docker en la misma región que tus servicios:
   ```bash
   gcloud artifacts repositories create ia-booking-repo \
     --repository-format=docker \
     --location=us-central1 \
     --description="Repositorio de imágenes Docker para IA Booking"
   ```
3. **Configurar Docker para Autenticarse con GCP**:
   ```bash
   gcloud auth configure-docker us-central1-docker.pkg.dev
   ```
4. **Construir y Subir la Imagen Docker**:
   Compila la imagen localmente usando el Dockerfile y súbela al repositorio:
   ```bash
   # Construir la imagen para arquitectura linux/amd64 (requerida por Cloud Run)
   docker build --platform linux/amd64 -t us-central1-docker.pkg.dev/ID_DE_TU_PROYECTO/ia-booking-repo/app:latest .

   # Subir la imagen a Artifact Registry
   docker push us-central1-docker.pkg.dev/ID_DE_TU_PROYECTO/ia-booking-repo/app:latest
   ```

---

## ☁️ Paso 3: Desplegar en Google Cloud Run

**Cloud Run** hospedará la aplicación Next.js y expondrá el frontend y el backend de forma segura bajo HTTPS.

1. **Obtener el nombre de conexión de la instancia de Cloud SQL**:
   ```bash
   gcloud sql instances describe ia-booking-db --format="value(connectionName)"
   # El resultado tendrá el formato: NOMBRE_PROYECTO:REGIO:NOMBRE_INSTANCIA
   ```
2. **Formatear la URL de Conexión de Base de Datos para Producción**:
   Prisma requiere una URL de conexión de PostgreSQL. En Cloud Run, la conexión se realiza a través de un socket Unix local montado automáticamente por GCP. La estructura de la URL de conexión debe ser:
   ```text
   postgresql://postgres:TU_CONTRASEÑA_SUPER_SEGURA@localhost/iabooking?host=/cloudsql/NOMBRE_PROYECTO:REGION:NOMBRE_INSTANCIA
   ```
   *(Reemplaza el nombre de conexión al final exactamente como lo obtuviste en el paso anterior).*

3. **Desplegar el Contenedor en Cloud Run**:
   Ejecuta el comando de despliegue inyectando la variable de entorno `DATABASE_URL` y asociando la conexión Cloud SQL:
   ```bash
   gcloud run deploy ia-booking-service \
     --image=us-central1-docker.pkg.dev/ID_DE_TU_PROYECTO/ia-booking-repo/app:latest \
     --region=us-central1 \
     --add-cloudsql-instances=NOMBRE_PROYECTO:REGION:NOMBRE_INSTANCIA \
     --set-env-vars="DATABASE_URL=postgresql://postgres:TU_CONTRASEÑA_SUPER_SEGURA@localhost/iabooking?host=/cloudsql/NOMBRE_PROYECTO:REGION:NOMBRE_INSTANCIA" \
     --allow-unauthenticated
   ```

---

## 🔄 Paso 4: Ejecutar Migraciones y Semilla de Base de Datos en Producción

Para inicializar las tablas y tarifas de cápsula/cuarto en la base de datos de Cloud SQL, debemos aplicar las migraciones de Prisma. La forma más sencilla y segura de hacerlo es desde tu máquina local mediante el **Cloud SQL Auth Proxy**.

1. **Descargar e Instalar Cloud SQL Auth Proxy**:
   Sigue las instrucciones oficiales de GCP según tu sistema operativo. En Windows, puedes descargarlo e iniciarlo en una terminal separada:
   ```bash
   ./cloud-sql-proxy NOMBRE_PROYECTO:REGION:NOMBRE_INSTANCIA
   ```
   Esto creará un túnel seguro que expone la base de datos de producción en `127.0.0.1:5432`.

2. **Modificar temporalmente tu archivo `.env` local**:
   Cambia tu variable `DATABASE_URL` local temporalmente para apuntar a la base de datos remota de producción a través del proxy:
   ```text
   DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA_SUPER_SEGURA@127.0.0.1:5432/iabooking?schema=public"
   ```

3. **Ejecutar Migración de Producción**:
   Aplica el esquema y las tablas en el Cloud SQL de producción:
   ```bash
   npx prisma migrate deploy
   ```

4. **Ejecutar Semilla de Catálogo en Producción**:
   Dado que en producción la base de datos es PostgreSQL, debemos asegurarnos de que la semilla se aplique. Modifica el archivo `prisma/schema.prisma` para cambiar temporalmente el `provider = "sqlite"` a `provider = "postgresql"` antes de correr la semilla de producción (opcional, o simplemente mantén un archivo de esquema alternativo para producción).
   
   Ejecuta la semilla:
   ```bash
   node prisma/seed.js
   ```

5. **Restaurar el archivo `.env` local**:
   Regresa tu archivo `.env` local a la configuración de SQLite de desarrollo:
   ```text
   DATABASE_URL="file:./dev.db"
   ```

¡Felicidades! Tu aplicación ya estará activa en Cloud Run con base de datos en Cloud SQL. El comando de despliegue te proporcionará una URL pública tipo `https://ia-booking-service-xxxx-uc.a.run.app/` donde podrás acceder a la aplicación en vivo.
