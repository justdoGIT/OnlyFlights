import { pgTable, text, serial, integer, date, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // flight, hotel, package
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalPrice: decimal("total_price").notNull(),
  status: text("status").notNull(),
  details: text("details").notNull(),
});

export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  userId: true,
  type: true,
  startDate: true,
  endDate: true,
  totalPrice: true,
  status: true,
  details: true,
});

export const insertEnquirySchema = createInsertSchema(enquiries).pick({
  name: true,
  email: true,
  message: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertEnquiry = z.infer<typeof insertEnquirySchema>;
export type User = typeof users.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
