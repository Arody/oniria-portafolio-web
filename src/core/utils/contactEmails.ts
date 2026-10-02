import type { Dictionary } from '@/lib/dictionaries';
import type { validateContact } from './contactValidation';

export function contactEmails(data: ReturnType<typeof validateContact>, message: string, from: string, inbox: string, copy: Dictionary['contact']) {
  return [
    {
      idempotencyKey: `contact/${data.id}`,
      email: {
        from, to: inbox, replyTo: data.email,
        subject: `Consulta ONIRIA: ${data.name.replace(/[\r\n]/g, ' ')}`,
        text: `Nombre: ${data.name}\nEmail: ${data.email}\nTeléfono: ${data.phone}\nFecha: ${data.date}\n\n${message}`,
      },
    },
    {
      idempotencyKey: `contact-receipt/${data.id}`,
      email: {
        from, to: data.email, replyTo: inbox,
        subject: copy.receipt_subject,
        // Keep the public autoresponder free of visitor-supplied text or links.
        text: copy.receipt_text,
        headers: { 'Auto-Submitted': 'auto-replied' },
      },
    },
  ];
}
