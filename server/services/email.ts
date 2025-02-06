import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"OnlyFlights" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

async function generateTravelerQRCode(bookingId: number, traveler: any) {
  try {
    // Create QR code data with booking and traveler information
    const qrData = JSON.stringify({
      bookingId,
      travelerId: `${bookingId}-${traveler.firstName}-${traveler.lastName}`,
      name: `${traveler.firstName} ${traveler.lastName}`,
      type: traveler.type,
      ...(traveler.passportNumber && { passportNumber: traveler.passportNumber })
    });

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 200
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}

export async function generateBookingConfirmationEmail(booking: any) {
  const bookingDetails = JSON.parse(booking.details);
  const travelers = bookingDetails.travelers || [];

  // Generate QR codes for all travelers
  const travelersWithQR = await Promise.all(
    travelers.map(async (traveler: any) => {
      const qrCode = await generateTravelerQRCode(booking.id, traveler);
      return { ...traveler, qrCode };
    })
  );

  const renderTravelersList = () => {
    if (!travelersWithQR.length) return '';

    return `
      <div style="margin-top: 20px;">
        <h3 style="color: #333;">Traveler Information</h3>
        ${travelersWithQR.map((traveler: any, index: number) => `
          <div style="margin: 10px 0; padding: 10px; background-color: ${index === 0 ? '#e6f3ff' : '#f8f9fa'}; border-radius: 5px;">
            <p><strong>${index === 0 ? 'Main Booker' : `Additional Traveler ${index}`}</strong></p>
            <p>Name: ${traveler.firstName} ${traveler.lastName}</p>
            ${traveler.email ? `<p>Email: ${traveler.email}</p>` : ''}
            ${traveler.phone ? `<p>Phone: ${traveler.phone}</p>` : ''}
            ${traveler.dateOfBirth ? `<p>Date of Birth: ${traveler.dateOfBirth}</p>` : ''}
            ${traveler.passportNumber ? `<p>Passport Number: ${traveler.passportNumber}</p>` : ''}
            ${traveler.qrCode ? `
              <div style="margin-top: 10px;">
                <p><strong>Your Unique Travel QR Code:</strong></p>
                <img src="${traveler.qrCode}" alt="Traveler QR Code" style="width: 200px; height: 200px;">
                <p style="font-size: 12px; color: #666;">Present this QR code during check-in</p>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0066cc; text-align: center;">Booking Confirmation</h1>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h2 style="color: #333;">Booking Details</h2>
        <p><strong>Booking Reference:</strong> #${booking.id}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
        ${booking.type === 'flight' ? `
          <div>
            <p><strong>Flight Details:</strong></p>
            <p>From: ${bookingDetails.from}</p>
            <p>To: ${bookingDetails.to}</p>
            <p>Date: ${bookingDetails.departureTime}</p>
            <p>Airline: ${bookingDetails.airline || 'Not specified'}</p>
            <p>Number of Travelers: ${travelers.length}</p>
          </div>
        ` : `
          <div>
            <p><strong>Hotel Details:</strong></p>
            <p>Name: ${bookingDetails.name}</p>
            <p>Location: ${bookingDetails.location}</p>
            <p>Number of Guests: ${travelers.length}</p>
          </div>
        `}
        <p><strong>Total Price:</strong> $${booking.totalPrice}</p>
      </div>
      ${renderTravelersList()}
      <div style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
        <p>Thank you for choosing OnlyFlights!</p>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    </div>
  `;
}