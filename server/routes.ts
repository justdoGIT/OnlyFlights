import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertEnquirySchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";
import { sendEmail, generateBookingConfirmationEmail } from "./services/email";
import adminRoutes from "./routes/admin";
import type { Request, Response, NextFunction } from "express";
import { User } from "@shared/schema";

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Middleware to ensure user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

export function registerRoutes(app: Express): Server {
  // Set up authentication routes and middleware
  setupAuth(app);

  // Register admin routes with authentication
  app.use('/api/admin', isAuthenticated, adminRoutes);

  // Protected booking routes
  app.get('/api/bookings', isAuthenticated, async (req, res) => {
    try {
      const bookings = await storage.getBookingsByUser(req.user!.id);
      res.json(bookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req, res) => {
    try {
      const booking = insertBookingSchema.parse(req.body);
      const result = await storage.createBooking(booking);

      // Send confirmation email
      const emailTo = req.user!.email;
      try {
        await sendEmail({
          to: emailTo,
          subject: 'Your OnlyFlights Booking Confirmation',
          html: await generateBookingConfirmationEmail(result)
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
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

  // Public enquiry route
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