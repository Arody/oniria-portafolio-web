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

Remitente previsto: `Oniria Weddings <hello@oniriaweddings.com>`.
Destinatario configurado en `oniria.settings.contact_email`: `hello@oniriaweddings.com`.

La consulta DNS del dominio principal no devolvió registros MX. Antes de usar
esa dirección como destinatario debe configurarse su recepción (un buzón de
correo o recepción de Resend con el flujo correspondiente). Verificar el dominio
para enviar no crea por sí solo una bandeja de correo convencional.

Hasta completar esos requisitos, las consultas se guardan en la bandeja del CMS.
No se enviaron correos de prueba a clientes.
