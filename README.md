# LUMO CAR API
## Sistema de gestión de rentas de vehículos
---
### Requisitos previos
Para poder realizar la instalación, se debe contar con las siguientes herramientas:
* NodeJS versión 24.16.0 o similar
* Base de datos SQL (recomendado MySQL o MS SERVER)
* Postman para pruebas de integración y de sistema
Además, se debe crear una base de datos con las siguientes características:
1. Un base de datos con nombre lumo_car
2. Usuario con permisos de LECTURA, ESCRITURA, MODIFICACION Y ELIMINACIÓN para dicha base de datos
3. No se debe tener tablas dentro de la base de datos

Se debe contar además con un correo electrónico con contraseña y usuario.

### Configuración del entorno
Se debe crear un archivo `.env` en la raíz del proyecto que contenga lo siguiente:
 - `DB_USER`: El nombre del **usuario** con los privilegios mencionados en la sección anterior
 - `DB_PASSWORD`: La *contraseña* del usuario usado en la base de datos
 - `DB_DATABASE`: El **nombre de la base de datos** que se usará con el sistema
 - `DB_HOST`: La **dirección IP** en la que se alojará la base de datos
 - `DB_PORT`: El *puerto* donde se expondrá la base de datos para el sistema
Esto se debe hacer tanto para los entornos de prueba (`Test`) y producción (`Production`) con cada campo del archivo `.env` con el prefijo de su entorno (TEST para prueba y PRODUCTION para produccion, o en todo caso DEV para desarrollo, si la version sin prefijo es para producción).
 - `EMAIL_HOST`: El servicio SMTP que servirá al correo.
 - `EMAIL_PORT`: El puerto dedicado para el servicio de correo (Se recomienda el `587` para SMTP)
 - `EMAIL_USER`: El correo electrónico que servira para el envío de correo a los usuarios.
 - `ÈMAIL_PASSWORD`: La contraseña de la *cuenta de correo*
Además de estas configuraciónes se debe aplicar los siguientes puntos al archivo `.env`:
 - `FILES_IN_BD` o `FILES_IN_DB`: Booleano para determinar si los archivos de imágenes irán en la carpeta `/uploads` del sistema, o si se guardarán en la base de datos.
 - `JWT_SECRET`: La llave secreta necesaria para la generación y validación de tokens
 - `NODE_ENV`: El entorno que se ejecutará al inicializar el proyecto: 'Development', 'Test' o 'Production'
 - `SERVER_PORT`: El puerto donde se expondrá la **API de servicios**

### Instrucciones para instalación
1. Clonar el repositorio
2. Ejecutar npm en la terminar en la carpeta del proyecto
3. Agregar el archivo `.env`
4. Ejecutar el proyecto con `npm run dev` para desarrollo o `npm start` para producción
5. Configurar la estructura de la base de datos descomentando la linea `35` del archivo `ìndex.js` (si se utiliza MSSERVER, se deben colocar las restricciones como `DEFAULT` O `UNIQUE`, por lo que después de ejecutar el método `sync()` **se deben de agregar manualmente las restricciones** mencionadas anteriormente).

Para utilizar los `seeders`para llenar la base de datos, se debe detener la ejecución del proyecto y ejecutar el comando `npx sequelize-cli db:seed:all` o en vez de *all* se puede colocar el archivo de seeders que se prefiera

### Seguridad y Bloqueo de intentos
Se implementó funciones de seguridad como cifrado, uso de roles, token JWT y bloqueo de inicio de sesión una vez se alcanza un número de intentos especificado, un límite de expiracíon para los token JWT.

### Bitácoras
Se implementó además un módulo de bitácora para registrar acciones de registro, modificación y eliminacíón de elementos, para registrar las acciones de los usuarios por su IP