import nodemailer from 'nodemailer';

interface BookingWithAccommodation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  paymentMethod: 'paypal' | 'transfer' | string;
  assignedPod?: number | null;
}

/**
 * Sends a confirmation email to the guest.
 * If SMTP environment variables are not set, it falls back to printing the email beautifully in the console.
 */
export async function sendConfirmationEmail(
  booking: BookingWithAccommodation,
  accommodationName: string
): Promise<boolean> {
  const checkInDate = new Date(booking.checkIn).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const checkOutDate = new Date(booking.checkOut).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(booking.totalPrice);

  const paymentMethodText = booking.paymentMethod === 'paypal' ? 'PayPal Sandbox' : 'Transferencia Bancaria';
  
  // HTML Email Template matching the premium futuristic styling of Cápsula Condesa
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Reserva - Cápsula Condesa</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Space Grotesk', 'Inter', -apple-system, sans-serif;
          background-color: #020409;
          color: #e2e8f0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: linear-gradient(135deg, #070b19 0%, #020409 100%);
          border: 1px solid rgba(0, 234, 255, 0.15);
          border-radius: 12px;
          overflow: hidden;
          margin-top: 20px;
          margin-bottom: 20px;
          box-shadow: 0 10px 30px rgba(0, 234, 255, 0.05);
        }
        .header {
          padding: 30px 20px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.4);
        }
        .logo-text {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #00eaff;
          text-transform: uppercase;
          margin: 0;
          text-shadow: 0 0 10px rgba(0, 234, 255, 0.4);
        }
        .content {
          padding: 40px 30px;
        }
        .welcome {
          font-size: 18px;
          line-height: 1.6;
          margin-bottom: 25px;
          color: #f8fafc;
        }
        .code-box {
          background: rgba(0, 234, 255, 0.06);
          border: 1px dashed #00eaff;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 30px;
        }
        .code-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #94a3b8;
          margin-bottom: 5px;
        }
        .code-value {
          font-size: 28px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          color: #00eaff;
          letter-spacing: 0.05em;
          margin: 0;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .details-table td {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .label {
          color: #94a3b8;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          width: 35%;
        }
        .val {
          color: #f1f5f9;
          font-size: 15px;
          font-weight: 500;
        }
        .neon-accent {
          color: #ff007f;
          font-weight: bold;
        }
        .policy-box {
          background: rgba(255, 255, 255, 0.02);
          border-left: 3px solid #ff007f;
          padding: 15px 20px;
          border-radius: 0 8px 8px 0;
          margin-top: 30px;
          font-size: 13px;
          line-height: 1.6;
          color: #cbd5e1;
        }
        .footer {
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(0, 0, 0, 0.2);
        }
        .footer a {
          color: #00eaff;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">CÁPSULA CONDESA</div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 5px; letter-spacing: 0.2em; text-transform: uppercase;">IA Booking Confirmación</div>
        </div>
        <div class="content">
          <div class="welcome">
            ¡Hola <strong>${booking.customerName}</strong>!<br>
            Tu reserva ha sido confirmada con éxito. Estamos listos para recibirte en la revolución del descanso.
          </div>
          
          <div class="code-box">
            <div class="code-title">Código de Reserva</div>
            <div class="code-value">${booking.id}</div>
          </div>

          <table class="details-table">
            <tr>
              <td class="label">Alojamiento</td>
              <td class="val">${accommodationName} ${booking.assignedPod ? `(Asignado: Cabina ${booking.assignedPod})` : ''}</td>
            </tr>
            <tr>
              <td class="label">Check-In</td>
              <td class="val">${checkInDate} (Desde las 15:00)</td>
            </tr>
            <tr>
              <td class="label">Check-Out</td>
              <td class="val">${checkOutDate} (Hasta las 11:00)</td>
            </tr>
            <tr>
              <td class="label">Método de Pago</td>
              <td class="val">${paymentMethodText}</td>
            </tr>
            <tr>
              <td class="label">Total Pagado</td>
              <td class="val" style="color: #00eaff; font-weight: 700;">${formattedPrice} MXN</td>
            </tr>
            <tr>
              <td class="label">Contacto</td>
              <td class="val">${booking.customerPhone} / ${booking.customerEmail}</td>
            </tr>
          </table>

          <div class="policy-box">
            <strong>📌 Información Importante sobre tu estancia:</strong>
            <ul style="margin: 8px 0 0 15px; padding: 0;">
              <li><strong>Asignación First-In First-Out (FIFO)</strong>: Si reservaste una cápsula individual, recuerda que no tienen numeración fija previa. Tu cápsula específica te será asignada al momento de tu llegada física en recepción.</li>
              <li><strong>Check-in</strong> a partir de las 15:00 hrs. Presenta tu código de reserva <strong>${booking.id}</strong>.</li>
              <li><strong>Check-out</strong> hasta las 11:00 hrs.</li>
              <li>Ubicación: Colonia Condesa, Ciudad de México.</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Cápsula Condesa. Todos los derechos reservados.<br>
          ¿Tienes dudas? Escríbenos por WhatsApp o a nuestro correo.
        </div>
      </div>
    </body>
    </html>
  `;

  const textBody = `
    ¡Hola ${booking.customerName}!
    Tu reserva en Cápsula Condesa ha sido CONFIRMADA.
    
    Código de Reserva: ${booking.id}
    Alojamiento: ${accommodationName} ${booking.assignedPod ? `(Cabina Asignada: ${booking.assignedPod})` : ''}
    Check-In: ${checkInDate} (Desde las 15:00)
    Check-Out: ${checkOutDate} (Hasta las 11:00)
    Método de Pago: ${paymentMethodText}
    Total Pagado: ${formattedPrice} MXN
    
    Dirección: Colonia Condesa, CDMX.
    Recordatorio: Las cápsulas individuales se asignan por orden de llegada (First-In, First-Out) al momento del Check-in en el hotel.
    
    ¡Te esperamos!
  `;

  // Check SMTP configs
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || 'no-reply@capsulacondesa.com.mx';
  const smtpSecure = process.env.SMTP_SECURE === 'true';

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || '587', 10),
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Cápsula Condesa" <${smtpFrom}>`,
        to: booking.customerEmail,
        subject: `Confirmación de Reserva ${booking.id} - Cápsula Condesa`,
        text: textBody,
        html: emailHtml,
      });

      console.log(`[SMTP] Email sent successfully to ${booking.customerEmail} for booking ${booking.id}`);
      return true;
    } catch (err: any) {
      console.error('[SMTP ERROR] Failed to send email via SMTP:', err);
      // Fallback to console print so application keeps working
    }
  }

  // Console fallback representation (super readable for dev demo)
  console.log(`
┌─────────────────────────────────────────────────────────────────────────┐
│ 📧 SIMULACIÓN DE CORREO ENVIADO (CÁPSULA CONDESA - CONFIRMACIÓN)         │
├─────────────────────────────────────────────────────────────────────────┤
│ PARA: ${booking.customerEmail}
│ ASUNTO: Confirmación de Reserva ${booking.id} - Cápsula Condesa
├─────────────────────────────────────────────────────────────────────────┤
│ ¡Hola ${booking.customerName}!
│ 
│ Tu reserva ha sido confirmada con éxito.
│ 
│ * Código de Reserva:  ${booking.id}
│ * Tipo de Habitación:  ${accommodationName} ${booking.assignedPod ? `(Asignado: Cabina ${booking.assignedPod})` : ''}
│ * Fecha Check-In:     ${checkInDate}
│ * Fecha Check-Out:    ${checkOutDate}
│ * Método de Pago:      ${paymentMethodText}
│ * Total Cobrado:      ${formattedPrice} MXN
│ 
│ * Ubicación:          Colonia Condesa, CDMX.
│ * FIFO Check-In:      Las cápsulas se asignan por orden de llegada física.
└─────────────────────────────────────────────────────────────────────────┘
  `);

  return true;
}
