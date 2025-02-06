import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertEnquirySchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";
import { sendEmail, generateBookingConfirmationEmail } from "./services/email";
import adminRoutes from "./routes/admin";

export function registerRoutes(app: Express): Server {
  // Set up authentication routes and middleware
  setupAuth(app);

  // Register admin routes
  app.use('/api/admin', adminRoutes);

  app.post('/api/bookings', async (req, res) => {
    try {
      const booking = insertBookingSchema.parse(req.body);
      const result = await storage.createBooking(booking);

      // Parse booking details to get the main contact email
      const bookingDetails = JSON.parse(result.details);
      const emailTo = bookingDetails.mainContactEmail || booking.email;

      // Send confirmation email
      const emailSent = await sendEmail({
        to: emailTo,
        subject: 'Your OnlyFlights Booking Confirmation',
        html: await generateBookingConfirmationEmail(result)
      });

      if (!emailSent) {
        console.warn('Failed to send confirmation email for booking:', result.id);
      }

      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        console.error('Booking creation error:', err);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });

  app.get('/api/bookings', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      const bookings = await storage.getBookingsByUser(req.user.id);
      res.json(bookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/enquiries', async (req, res) => {
    try {
      const enquiry = insertEnquirySchema.parse(req.body);
      const result = await storage.createEnquiry(enquiry);
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        console.error('Enquiry creation error:', err);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}