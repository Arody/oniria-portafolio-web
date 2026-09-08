'use server';

import { headers } from 'next/headers';
import { allowContact } from '@/core/utils/contactRateLimit';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/core/services/settingsService';
import { formatContactMessage, validateContact } from '@/core/utils/contactValidation';
import { getDictionary } from '@/lib/dictionaries';

export async function submitContactMessage(input: unknown) {
  let data;
  let message;
  try {
    data = validateContact(input);
    message = formatContactMessage(data, (await getDictionary('es')).contact.form);
  }
  catch { return { success: false, error: 'invalid' as const }; }
  if (data.website) return { success: true };
  const ip = (await headers()).get('x-real-ip') || 'local';
  if (!allowContact(ip)) return { success: false, error: 'rate' as const };

  const supabase = await createClient();
  const { error } = await supabase.from('messages').insert({
    id: data.id, full_name: data.name, email: data.email,
    phone: data.phone, event_date: data.date, message,
    is_read: false,
  });
  // Retries of the same form cannot create duplicate messages or emails.
  if (error?.code === '23505') return { success: true };
  if (error) {
    console.error('Contact could not be saved:', error.code);
    return { success: false, error: 'save' as const };
  }

  try {
    const settings = await getSettings();
    const from = process.env.RESEND_FROM_EMAIL;
    if (process.env.RESEND_API_KEY && from && settings.contact_email) {
      const { error: emailError } = await new Resend(process.env.RESEND_API_KEY).emails.send({
        from, to: settings.contact_email, replyTo: data.email,
        subject: `Consulta ONIRIA: ${data.name}`,
        text: `Nombre: ${data.name}\nEmail: ${data.email}\nTeléfono: ${data.phone}\nFecha: ${data.date}\n\n${message}`,
      }, { idempotencyKey: `contact/${data.id}` });
      if (emailError) console.error('Contact saved; email notification failed:', emailError.message);
    }
  } catch (error) {
    console.error('Contact saved; email notification unavailable:', error instanceof Error ? error.message : 'Unknown error');
  }
  return { success: true };
}
