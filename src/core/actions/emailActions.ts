'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  message: string;
}

export async function sendContactEmails(formData: ContactFormData) {
  try {
    // 1. Email para los administradores de Oniria Weddings
    const adminEmail = await resend.emails.send({
      from: 'Oniria Weddings <onboarding@resend.dev>', // Usar dominio verificado de Resend en prod
      to: 'ing.fajardo89@gmail.com', // Cambiado temporalmente para pruebas Sandbox
      subject: `Nueva Consulta de Boda: ${formData.name}`,
      html: `
        <div style="font-family: sans-serif; color: #000; padding: 20px; border: 4px solid #000;">
          <h1 style="text-transform: uppercase; font-weight: 900; border-bottom: 2px solid #000; padding-bottom: 10px;">Nuevo Mensaje Recibido</h1>
          <p><strong>Nombre:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Teléfono:</strong> ${formData.phone || 'No proporcionado'}</p>
          <p><strong>Fecha del Evento:</strong> ${formData.date || 'No proporcionada'}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border: 2px solid #000;">
            <p><strong>Mensaje:</strong></p>
            <p style="white-space: pre-wrap;">${formData.message}</p>
          </div>
        </div>
      `,
    });

    if (adminEmail.error) {
      console.error('Error al enviar email al admin:', adminEmail.error);
      return { success: false, error: 'Hubo un error al notificar al equipo.' };
    }

    // 2. Email de confirmación para el cliente
    const clientEmail = await resend.emails.send({
      from: 'Oniria Weddings <onboarding@resend.dev>', // Usar dominio verificado de Resend en prod
      to: 'ing.fajardo89@gmail.com', // Cambiado temporalmente para pruebas Sandbox
      subject: 'Hemos recibido tu mensaje - Oniria Weddings',
      html: `
        <div style="font-family: sans-serif; color: #000; padding: 20px; border: 4px solid #000; max-width: 600px; margin: 0 auto;">
          <h1 style="text-transform: uppercase; font-weight: 900;">¡HOLA ${formData.name.toUpperCase()}!</h1>
          <p>Gracias por contactar a <strong>ONIRIA WEDDINGS</strong>.</p>
          <p>Hemos recibido tu solicitud exitosamente. Nuestro equipo está revisando los detalles de tu boda y nos pondremos en contacto contigo lo antes posible, generalmente dentro de las próximas 24-48 horas.</p>
          <br/>
          <p>Mientras tanto, te invitamos a seguir explorando nuestro <a href="https://oniria-weddings.com/portafolio" style="color: #000; font-weight: bold;">portafolio</a>.</p>
          <br/>
          <hr style="border: 1px solid #000;" />
          <p style="font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase; margin-top: 20px;">
            ONIRIA WEDDINGS<br/>
            Mérida, Yucatán, México
          </p>
        </div>
      `,
    });

    if (clientEmail.error) {
      console.error('Error al enviar email al cliente:', clientEmail.error);
      // Even if client email fails, admin got it, but we let the UI know.
      return { success: true, warning: 'Mensaje enviado, pero no se pudo enviar la confirmación a tu correo.' };
    }

    return { success: true };

  } catch (error) {
    console.error('Error in sendContactEmails Server Action:', error);
    return { success: false, error: 'Ocurrió un error inesperado.' };
  }
}
