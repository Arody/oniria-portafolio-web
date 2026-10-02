# Resend — oniriaweddings.com

Dominio agregado a la cuenta `arodev` el 8 de septiembre de 2026:
https://resend.com/domains/add/62b785f5-6c34-497a-bb71-7321d556d352

Pendiente de verificación DNS. Los servidores autoritativos son
`ns75.domaincontrol.com` y `ns76.domaincontrol.com` (GoDaddy).

| Tipo | Nombre | Valor | Prioridad |
| --- | --- | --- | --- |
| TXT | resend._domainkey | p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDHqv0saJ7mbBoU5lqWiYf3VKIP0uovyngQrSuAETmaHEx3HmoNctFrkSQOCwHOVmAbC2OXynibp31wIE1rNynACPfsJkwPyk1ZzcqDxaPpZ3L8py8TsBguZfnaRhbxREOeKi4NsJ0a/svoSrWskFMGpO1b3+VpGg/smF8bWdRqvwIDAQAB | — |
| MX | send | feedback-smtp.us-east-1.amazonses.com | 10 |
| TXT | send | v=spf1 include:amazonses.com ~all | — |

TTL: el predeterminado del proveedor. Estos registros corresponden al envío;
no reemplazan los MX de recepción del dominio principal.

También falta proporcionar `RESEND_API_KEY`. La clave anterior de Resend existe,
pero su valor completo no está disponible en la interfaz ni en los archivos de
entorno del proyecto/VPS. Preferir una clave de envío limitada a este dominio.

Remitente: `Oniria Weddings <hello@oniriaweddings.com>` en `RESEND_FROM_EMAIL`.
No se necesita un buzón para esta dirección: Resend envía desde el dominio verificado.

En **Administrador → Ajustes → Contacto y Enrutamiento**, guardar el Gmail del
equipo en `oniria.settings.contact_email` (pendiente de que el propietario lo indique).
Actualmente sigue configurado `hello@oniriaweddings.com`, que no tiene recepción.
El flujo implementado es:

1. Guardar la consulta en Mensajes del CMS.
2. Enviar al Gmail una notificación con los datos; «Responder» apunta al cliente.
3. Enviar al cliente un acuse en el idioma del formulario (es/en), desde `hello`;
   «Responder» apunta al Gmail. El Gmail será visible en la cabecera Reply-To.

Los dos envíos tienen claves de idempotencia independientes. Un fallo de correo
no elimina la consulta ni impide intentar el otro envío. No se reenvían automáticamente
consultas históricas ni correos fallidos. Si el destinatario está vacío, solo se guarda
la consulta. Sin clave y dominio verificado, no se puede confirmar entrega por correo.

Para activarlo: verificar los registros que muestre Resend, configurar la clave de
envío en el entorno del release activo, guardar el Gmail y reiniciar únicamente
`oniria-weddings` con PM2. Probar con una dirección propia y comprobar ambos correos,
sus direcciones de respuesta y la consulta en el administrador.

Conservar los registros A, CNAME, NS y DMARC actuales. El MX de `send` sirve al envío
y no crea recepción para `hello`; escribir directamente a `hello` requiere otro flujo.
No se enviaron correos de prueba a clientes.
