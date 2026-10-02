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

Versión activa desde el despliegue del 1 de octubre de 2026:
`/var/www/oniria-releases/20261002-contact-receipts`.
Incluye imágenes OG JPG locales en `public/og`, de 1200 × 630, y el icono de ONIRIA.
La versión anterior está en `/var/www/oniria-releases/20261002-splash-size`. La instalación anterior permanece en
`/var/www/oniria-portafolio-web` como respaldo; ya no es el directorio activo de
PM2. Para actualizar la versión activa, usar su directorio o preparar otra
versión, compilarla y actualizar únicamente el proceso `oniria-weddings`.

Para restaurar la versión anterior, ejecutar por SSH como `arody`:

```sh
pm2 delete oniria-weddings
pm2 start /var/www/oniria-releases/20261002-splash-size/ecosystem.config.js --only oniria-weddings
pm2 save
```

Despliegue verificado con lint, pruebas CMS, compilación y `test:films` contra
HTTPS en producción. Nginx y `pm2-arody` tienen inicio automático habilitado.

## Vistas previas al compartir

Home, About, Films, Blog, Contact y cada artículo incluyen Open Graph,
Twitter Cards y su URL canónica en ambos idiomas. La imagen predeterminada de
Inicio es `public/og/oniria-logo-black-v1.jpg`: logotipo blanco sobre fondo negro.
El icono cuadrado reutiliza el símbolo del logotipo original.

En **Admin → Imágenes al compartir** (`/es/admin/social`) se puede elegir una página
o artículo y subir una imagen para ES, EN o ambos. Restaurar predeterminada elimina
la selección personalizada, sin cambiar las imágenes del contenido. Los artículos
nuevos aparecen automáticamente en el selector. La tabla `oniria.social_images`
guarda la selección por URL, con lectura pública y escritura solo para admins.

Las imágenes subidas se validan y convierten en JPEG de 1200 × 630 sin recortar,
con fondo negro. Se sirven desde `/og/custom/<uuid>.jpg` sin autenticación ni acceso
a Storage durante la descarga. `ONIRIA_OG_IMAGE_DIR` apunta en PM2 a
`/var/www/oniria-shared/og`, fuera de los releases; incluir esta carpeta junto a la
base de datos en los respaldos. En desarrollo se usa `.data/og` (ignorada por Git).
Cada carga genera otra URL. Se conservan archivos anteriores porque las redes
pueden seguir solicitándolos desde su caché. No hace falta recompilar al cambiarlos.

Las imágenes predeterminadas de las otras páginas mantienen las copias locales
anteriores: About usa su imagen; Films la primera portada; Contact la segunda
imagen del collage; Blog la portada de un artículo publicado. Cada artículo usa
su portada, con respaldo cuando falta. `npm run sync:og` actualiza esas copias en
`public/og` y el manifiesto al compilar. Las selecciones del administrador tienen
prioridad sobre estas imágenes predeterminadas.

Comprobaciones:
- `node --experimental-strip-types --test tests/social-images.test.ts`
- `psql ... -f supabase/tests/social_images.sql` (transacción revertida)
- `METADATA_TEST_URL=https://oniriaweddings.com npm run test:metadata`

Nginx permite cuerpos de hasta 6 MB únicamente para ONIRIA; la carga admite
imágenes JPEG, PNG o WebP de hasta 5 MB. Las redes pueden conservar vistas previas
en caché; el diseño final depende de cada aplicación.

## Sitio bilingüe

El selector es / en aparece entre Blog y Contacto, también en el menú
móvil. Conserva la ruta, los parámetros y el ancla, y recuerda la elección durante
un año para los enlaces sin idioma. El idioma de la URL siempre tiene prioridad.

Los textos públicos y las vistas previas sociales usan el idioma seleccionado.
Ajustes, films y artículos tienen una sección «Traducciones · Español / English»
para editar los textos de ambos idiomas. Las traducciones tienen prioridad sobre
el texto original; «Usar original» elimina la traducción. Los nombres, las URLs,
las portadas y los videos son compartidos. El panel de administración conserva
su interfaz de edición actual. El contenido nuevo requiere su traducción en el CMS.

Migración aplicada: `supabase/migrations/20260909033110_bilingual_content.sql`.
Comprobación: `I18N_TEST_URL=https://oniriaweddings.com npm run test:i18n`.

## Pausa editorial 1

Configuración permite guardar hasta cinco enlaces Vimeo. Cada carga elige un video
al azar; cuando hay varios, evita el anterior en la misma pestaña (sessionStorage).
El video existente se conserva como primera opción. Borrar la frase o firma base
las oculta en ambos idiomas, incluso si quedan traducciones guardadas. Una pausa
sin textos conserva la imagen/video sin adornos ni una columna de texto vacía.

Migración aplicada: `supabase/migrations/20261002013409_interlude_video_rotation.sql`.
Pruebas de selección y textos vacíos: `npm test`.

La página exclusiva de Films muestra cada video publicado una sola vez, en su orden,
y termina en el último. Conserva la animación de entrada y usa el scroll normal de la página.

## Comentarios de clientes

`/es/admin/comments` permite crear, editar y eliminar comentarios sin un límite
de registros impuesto por el CMS. Cada comentario incluye nombre, de 1 a 5 estrellas,
texto y foto opcional (se muestra la inicial si no hay foto). La traducción inglesa
es opcional; de faltar, se muestra el comentario original. Las fotos se comprimen
y se almacenan en `oniria/testimonials/`; al reemplazarlas o eliminar un comentario
se limpian las fotos sin referencias.

Los comentarios aparecen al final de Home y About, antes del footer, del más nuevo
al más antiguo. La sección no se muestra mientras esté vacía. Las operaciones requieren
un administrador tanto en las acciones del servidor como mediante RLS en Supabase.

Migración: `supabase/migrations/20261002014853_testimonials.sql`.
Validación: `npm test`; CRUD y permisos: `tests/testimonials.sql` con psql como propietario
de la base de datos (la prueba usa una transacción que siempre termina con rollback).
