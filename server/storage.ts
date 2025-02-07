import { 
  users, type User, type InsertUser,
  bookings, type Booking, type InsertBooking,
  enquiries, type Enquiry, type InsertEnquiry,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User>;
  getAdminUsers(): Promise<User[]>;

  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getAllBookings(limit?: number, offset?: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  updateBooking(id: number, data: Partial<InsertBooking>): Promise<Booking>; //Added here

  // Enquiry operations
  createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry>;
  getAllEnquiries(limit?: number, offset?: number): Promise<Enquiry[]>;
  updateEnquiryStatus(id: number, status: string): Promise<Enquiry>;
  getEnquiry(id: number): Promise<Enquiry | undefined>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error getting user by username:", error);
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const [created] = await db.insert(users).values({
        username: user.username,
        password: user.password,
        email: user.email,
        isAdmin: user.isAdmin ?? false,
        created_at: new Date(),
        updated_at: new Date()
      }).returning();

      if (!created) {
        throw new Error("Failed to create user");
      }

      return created;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    try {
      const [updated] = await db
        .update(users)
        .set({
          ...data,
          updated_at: new Date()
        })
        .where(eq(users.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  async getAdminUsers(): Promise<User[]> {
    try {
      return await db.select().from(users).where(eq(users.isAdmin, true));
    } catch (error) {
      console.error("Error getting admin users:", error);
      throw error;
    }
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    try {
      const [created] = await db.insert(bookings).values({
        ...booking,
        created_at: new Date(),
        updated_at: new Date()
      }).returning();
      return created;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    try {
      return await db
        .select()
        .from(bookings)
        .where(eq(bookings.userId, userId))
        .orderBy(desc(bookings.created_at));
    } catch (error) {
      console.error("Error getting bookings by user:", error);
      throw error;
    }
  }

  async getAllBookings(limit = 10, offset = 0): Promise<Booking[]> {
    try {
      return await db
        .select()
        .from(bookings)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(bookings.created_at));
    } catch (error) {
      console.error("Error getting all bookings:", error);
      throw error;
    }
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    try {
      const [updated] = await db
        .update(bookings)
        .set({
          status,
          updated_at: new Date()
        })
        .where(eq(bookings.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw error;
    }
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    try {
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
      return booking;
    } catch (error) {
      console.error("Error getting booking:", error);
      throw error;
    }
  }

  async updateBooking(id: number, data: Partial<InsertBooking>): Promise<Booking> { //Added here
    try {
      const [updated] = await db
        .update(bookings)
        .set({
          ...data,
          updated_at: new Date()
        })
        .where(eq(bookings.id, id))
        .returning();

      if (!updated) {
        throw new Error("Booking not found");
      }

      return updated;
    } catch (error) {
      console.error("Error updating booking:", error);
      throw error;
    }
  }

  // Enquiry operations
  async createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry> {
    try {
      const [created] = await db.insert(enquiries).values({
        ...enquiry,
        created_at: new Date(),
        updated_at: new Date()
      }).returning();
      return created;
    } catch (error) {
      console.error("Error creating enquiry:", error);
      throw error;
    }
  }

  async getAllEnquiries(limit = 10, offset = 0): Promise<Enquiry[]> {
    try {
      return await db
        .select()
        .from(enquiries)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(enquiries.created_at));
    } catch (error) {
      console.error("Error getting all enquiries:", error);
      throw error;
    }
  }

  async updateEnquiryStatus(id: number, status: string): Promise<Enquiry> {
    try {
      const [updated] = await db
        .update(enquiries)
        .set({
          status,
          updated_at: new Date()
        })
        .where(eq(enquiries.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating enquiry status:", error);
      throw error;
    }
  }

  async getEnquiry(id: number): Promise<Enquiry | undefined> {
    try {
      const [enquiry] = await db.select().from(enquiries).where(eq(enquiries.id, id));
      return enquiry;
    } catch (error) {
      console.error("Error getting enquiry:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();