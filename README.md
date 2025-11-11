# Sistema de Login Administrador - Tienda Web

Sistema profesional de autenticación y panel de administración para gestión de usuarios.

## Características

- ✅ Login seguro para administradores
- ✅ Validación de credenciales mediante API REST
- ✅ Dashboard con estadísticas de usuarios
- ✅ Gestión de sesiones con localStorage
- ✅ Interfaz moderna y responsive
- ✅ Manejo de errores robusto

## Estructura del Proyecto

```
PaginaWebTienda/
├── index.html          # Página de login
├── login.js            # Lógica de autenticación
├── styles.css          # Estilos del login
├── dashboard.html      # Panel de administración
├── dashboard.js        # Lógica del dashboard
├── dashboard.css       # Estilos del dashboard
├── server.js           # Servidor Express
├── package.json        # Dependencias Node.js
├── Dockerfile          # Configuración Docker
├── render.yaml         # Configuración Render
├── .dockerignore       # Archivos ignorados en Docker
├── .gitignore          # Archivos ignorados en Git
└── README.md           # Documentación
```

## Instalación y Uso Local

### Opción 1: Con Node.js (Recomendado)

1. Instala las dependencias:
```bash
npm install
```

2. Inicia el servidor:
```bash
npm start
```

3. Abre tu navegador en `http://localhost:3000`

### Opción 2: Sin servidor (Desarrollo)

1. Abre el archivo `index.html` directamente en tu navegador
2. Nota: Algunas funciones pueden no funcionar correctamente sin servidor

## Deployment en Render con Docker

### Prerrequisitos

- Cuenta en [Render](https://render.com)
- Repositorio Git (GitHub, GitLab, o Bitbucket)

### Pasos para Deployment

1. **Preparar el repositorio:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <tu-repositorio-url>
   git push -u origin main
   ```

2. **En Render:**
   - Ve a tu dashboard de Render
   - Click en "New +" → "Web Service"
   - Conecta tu repositorio Git
   - Render detectará automáticamente el `Dockerfile`
   - O puedes usar el archivo `render.yaml` para configuración automática

3. **Configuración en Render:**
   - **Name:** pagina-web-tienda-admin (o el que prefieras)
   - **Environment:** Docker
   - **Dockerfile Path:** ./Dockerfile
   - **Docker Context:** .
   - **Plan:** Free (o el plan que prefieras)
   - **Health Check Path:** /

4. **Variables de entorno (opcionales):**
   - `NODE_ENV=production` (ya está en render.yaml)
   - `PORT` será asignado automáticamente por Render

5. **Deploy:**
   - Click en "Create Web Service"
   - Render construirá la imagen Docker y desplegará la aplicación
   - Una vez completado, tendrás una URL pública

### Deployment Manual con Docker

Si prefieres probar localmente con Docker:

```bash
# Construir la imagen
docker build -t pagina-web-tienda-admin .

# Ejecutar el contenedor
docker run -p 3000:3000 -e PORT=3000 pagina-web-tienda-admin
```

Luego accede a `http://localhost:3000`

## Uso del Sistema

1. Accede a la URL de tu aplicación desplegada
2. Ingresa las credenciales del administrador:
   - **Correo:** admin@railway.com
   - **Contraseña:** admin123
3. Accede al panel de administración

## Credenciales de Administrador

- **Correo:** admin@railway.com
- **Contraseña:** admin123
- **Rol:** administrador

## Funcionalidades

### Login
- Validación de campos en tiempo real
- Mostrar/ocultar contraseña
- Manejo de errores de conexión
- Validación de credenciales contra la API
- Sesión persistente (24 horas)

### Dashboard
- Visualización de estadísticas de usuarios
- Listado completo de usuarios registrados
- Actualización manual y automática de datos
- Información de sesión del administrador
- Cierre de sesión seguro

## API Endpoint

El sistema se conecta a la siguiente API:
```
https://apijhon.onrender.com/api/usuarios
```

## Tecnologías Utilizadas

### Frontend
- HTML5
- CSS3 (Variables CSS, Flexbox, Grid)
- JavaScript (ES6+)
- Fetch API
- LocalStorage API

### Backend/Deployment
- Node.js
- Express.js
- Docker
- Render (Plataforma de deployment)

## Notas de Seguridad

- Las contraseñas se validan contra la API pero no se almacenan localmente
- La sesión expira automáticamente después de 24 horas
- Validación de sesión en cada carga de página
- Manejo seguro de errores sin exponer información sensible

## Compatibilidad

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Responsive design para móviles y tablets
- Node.js 18+ para el servidor
- Docker para containerización

## Seguridad

- Headers de seguridad configurados (X-Content-Type-Options, X-Frame-Options, etc.)
- CORS configurado correctamente
- Validación de sesiones
- Manejo seguro de errores
- Sin exposición de información sensible

## Troubleshooting

### Error de CORS
Si encuentras errores de CORS, verifica que:
- La API externa (`https://apijhon.onrender.com`) permita peticiones desde tu dominio
- El servidor esté configurado correctamente con los headers adecuados

### Error de conexión
- Verifica que la API esté disponible y accesible
- Revisa los logs del servidor en Render
- Comprueba que el puerto esté configurado correctamente

### Problemas en Render
- Verifica que el Dockerfile esté en la raíz del proyecto
- Asegúrate de que el puerto esté configurado para usar `process.env.PORT`
- Revisa los logs de build en Render para ver errores específicos

## Autor

Sistema desarrollado para gestión de tienda web.

