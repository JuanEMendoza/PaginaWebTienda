# Guía de Deployment en Render

## Pasos Rápidos para Deployment

### 1. Preparar el Repositorio

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - Sistema de login administrador"

# Conectar con tu repositorio remoto (GitHub, GitLab, Bitbucket)
git remote add origin <URL-DE-TU-REPOSITORIO>
git branch -M main
git push -u origin main
```

### 2. Crear Servicio en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio Git
4. Render detectará automáticamente el `Dockerfile`

### 3. Configuración en Render

- **Name:** `pagina-web-tienda-admin` (o el nombre que prefieras)
- **Environment:** `Docker`
- **Region:** Elige la región más cercana a tus usuarios
- **Branch:** `main` (o la rama que uses)
- **Root Directory:** `.` (raíz del proyecto)
- **Dockerfile Path:** `./Dockerfile`
- **Docker Context:** `.`
- **Plan:** `Free` (o el plan que prefieras)

### 4. Variables de Entorno

Render asignará automáticamente la variable `PORT`. No necesitas configurar nada adicional.

Opcionalmente puedes agregar:
- `NODE_ENV=production` (ya está en render.yaml)

### 5. Deploy

1. Click en **"Create Web Service"**
2. Render comenzará a construir la imagen Docker
3. Espera a que el build se complete (puede tomar 5-10 minutos la primera vez)
4. Una vez completado, tu aplicación estará disponible en una URL pública

### 6. Verificar el Deployment

1. Visita la URL proporcionada por Render
2. Deberías ver la página de login
3. Prueba el login con las credenciales:
   - **Correo:** admin@railway.com
   - **Contraseña:** admin123

## Solución de Problemas

### El build falla

- Verifica que el Dockerfile esté en la raíz del proyecto
- Revisa los logs de build en Render
- Asegúrate de que `package.json` tenga las dependencias correctas

### La aplicación no inicia

- Verifica los logs en Render
- Asegúrate de que el puerto esté configurado correctamente (Render asigna el PORT automáticamente)
- Revisa que el servidor esté escuchando en `0.0.0.0`

### Error de CORS

- Las peticiones se hacen directamente desde el cliente a la API externa
- Verifica que la API `https://apijhon.onrender.com` permita peticiones desde tu dominio
- El servidor ya está configurado con los headers necesarios

### Archivos no se cargan

- Verifica que todos los archivos estén en el repositorio
- Asegúrate de que los archivos CSS y JS estén en la raíz del proyecto
- Revisa la consola del navegador para ver errores

## Comandos Útiles

### Probar localmente con Docker

```bash
# Construir la imagen
docker build -t pagina-web-tienda-admin .

# Ejecutar el contenedor
docker run -p 3000:3000 -e PORT=3000 pagina-web-tienda-admin
```

### Probar localmente con Node.js

```bash
# Instalar dependencias
npm install

# Ejecutar servidor
npm start
```

## Notas Importantes

- Render puede tardar unos minutos en activar el servicio en el plan gratuito
- Los servicios gratuitos se "duermen" después de 15 minutos de inactividad
- El primer request después de estar dormido puede tardar unos segundos
- Para producción, considera usar un plan de pago para mejor rendimiento

## Soporte

Si encuentras problemas, revisa:
1. Los logs en Render Dashboard
2. La consola del navegador
3. Los logs del servidor
4. La documentación de Render: https://render.com/docs


