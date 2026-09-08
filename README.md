# ONIRIA CMS

CMS de fotografía y video de bodas: Next.js App Router, TypeScript y Supabase
alojado en `api-supabase.arody.cloud`. Español e inglés mediante `/es` y `/en`.

## Desarrollo

```sh
npm ci
cp .env.example .env.local
# Completar NEXT_PUBLIC_SUPABASE_ANON_KEY.
npm run dev
```

La clave pública corresponde a esta instancia autoalojada. Nunca colocar una
clave `service_role` en variables `NEXT_PUBLIC_*`.

```sh
npm run lint
npm test                    # Node 22.6+ para ejecutar TypeScript nativo
npm run build
```

## Administración

Entrar en `/es/login`. Las cuentas deben existir en Supabase Auth y tener un rol
asignado explícitamente en `oniria.user_roles`:

- `super_admin`: contenido, ajustes, consultas y asignación de roles.
- `admin`: contenido, ajustes y consultas.
- `editor`: blog y archivos de la carpeta `blog`.

Ser usuario de otro proyecto en esta instancia compartida no concede acceso a
ONIRIA. El Proxy, la verificación del servidor y las políticas RLS aplican el
control de acceso. Los permisos de otros esquemas y buckets se conservan.

Los proyectos y artículos admiten borradores y publicación. Los proyectos pueden
tener solo fotografías o video Vimeo. Los ajustes se sincronizan por Realtime.
Las consultas aparecen en `/es/admin/messages` con paginación y estado leído.

## Base de datos

La instancia existente contiene `oniria.settings`, `portfolio_projects`,
`blog_posts`, `messages` y `user_roles`, y el bucket público `oniria`.

`supabase/migrations/20260908202635_harden_oniria_cms.sql` corrige los permisos de
esta instalación existente. `init_oniria.sql` es el esquema inicial histórico;
no volver a ejecutarlo sobre producción. `enable_realtime_settings.sql` solo
habilita Realtime y no modifica roles ni relaja las políticas.

`supabase/tests/cms_permissions.sql` comprueba permisos reales de anónimo,
usuario sin rol, editor y administrador. Puede ejecutarse con `psql` o el MCP;
revierte todas sus escrituras mediante `ROLLBACK`.

Antes de la reparación se respaldaron los datos de ONIRIA, el esquema Storage y
la configuración PM2 en `/root/oniria-cms-backup-20260908` del VPS.

## Contacto y correo

Cada envío se valida y guarda antes de intentar notificar por Resend. Un reintento
del mismo formulario no duplica mensajes; un fallo de correo no pierde consultas.
Se limita el envío por IP y proceso (cinco solicitudes cada diez minutos), por lo
que la configuración PM2 mantiene un único proceso. Nginx debe sobrescribir
`X-Real-IP` y el servidor Next debe escuchar solamente en loopback.

La notificación utiliza `RESEND_API_KEY`, `RESEND_FROM_EMAIL` y el destinatario de
Ajustes. El correo de respuesta es el del visitante. Configuración pendiente y
registros DNS: [docs/RESEND_SETUP.md](docs/RESEND_SETUP.md).

## VPS y MCP

PM2 usa `ecosystem.config.js`, proceso `oniria-weddings`, puerto local `3017`.
Nginx publica `oniriaweddings.com`. Antes de activar una versión, ejecutar
`npm ci` y `npm run build` en su directorio y conservar la versión anterior.

El MCP de Codex es exclusivo de este proyecto: [.codex/README.md](.codex/README.md).

Versión activa después de esta revisión:
`/var/www/oniria-releases/20260908-cms`. La instalación anterior permanece en
`/var/www/oniria-portafolio-web` como respaldo; ya no es el directorio activo de
PM2. Para actualizar la versión activa, usar su directorio o preparar otra
versión, compilarla y actualizar únicamente el proceso `oniria-weddings`.
