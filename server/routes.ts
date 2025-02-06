import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertEnquirySchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

export function registerRoutes(app: Express): Server {
  // Set up authentication routes and middleware
  setupAuth(app);

  app.post('/api/bookings', async (req, res) => {
    try {
      const booking = insertBookingSchema.parse(req.body);
      const result = await storage.createBooking(booking);
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });

  app.get('/api/bookings/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (err) {
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
        res.status(400).json({ message: err.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}