This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server (configured on port 3017):

```bash
pnpm dev -p 3017
```

Open [http://localhost:3017](http://localhost:3017) with your browser to see the result.

---

## Despliegue en VPS (PM2 + Nginx)

Esta guía detalla la configuración necesaria para desplegar la aplicación en producción en un servidor VPS usando **PM2** (gestor de procesos) y **Nginx** (servidor web/proxy inverso) escuchando en el puerto **3017**.

### 1. Preparación en el Servidor VPS

Asegúrate de tener instalado Node.js, pnpm (o tu gestor de paquetes de preferencia), PM2 y Nginx.

```bash
# Instalar PM2 globalmente (si no está instalado)
npm install -g pm2
```

### 2. Configurar PM2

Para iniciar y mantener la aplicación corriendo en segundo plano en el puerto `3017`, puedes crear un archivo de configuración para PM2 llamado `ecosystem.config.js` en la raíz del proyecto, o ejecutarlo directamente desde la consola:

#### Opción A: Archivo `ecosystem.config.js` (Recomendada)
Crea el archivo [ecosystem.config.js](file:///Users/arodyparedesfajardo/Documents/GitHub/oniria-portafolio-web/ecosystem.config.js) en la raíz con el siguiente contenido:

```javascript
module.exports = {
  apps: [
    {
      name: 'oniria-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        PORT: 3017,
        NODE_ENV: 'production'
      }
    }
  ]
};
```

Luego, construye e inicia la aplicación con:
```bash
# Construir la aplicación para producción
pnpm build

# Iniciar con PM2
pm2 start ecosystem.config.js

# Guardar la lista de procesos para que se reinicien con el sistema
pm2 save
pm2 startup
```

#### Opción B: Ejecución directa por consola
Si prefieres no usar el archivo de configuración:
```bash
pnpm build
PORT=3017 pm2 start pnpm --name "oniria-web" -- start
pm2 save
```

---

### 3. Configuración de Nginx (Proxy Inverso)

Para mapear las solicitudes públicas (puerto 80 / 443) al puerto local `3017` de Next.js, crea o edita la configuración de tu sitio en Nginx:

```bash
sudo nano /etc/nginx/sites-available/oniria-portafolio
```

Pega la siguiente configuración (reemplaza `tu-dominio.com` por el tuyo):

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:3017;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Cabeceras para conservar IPs reales de los usuarios
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Habilita el sitio y reinicia Nginx:
```bash
# Crear enlace simbólico para activar la configuración
sudo ln -s /etc/nginx/sites-available/oniria-portafolio /etc/nginx/sites-enabled/

# Verificar la sintaxis de Nginx
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 4. Configurar SSL con Certbot (Let's Encrypt)

Para configurar HTTPS de manera rápida y gratuita:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

Certbot actualizará automáticamente la configuración de Nginx para redirigir todo el tráfico HTTP a HTTPS de manera segura.

