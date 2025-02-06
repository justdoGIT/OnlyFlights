import { 
  users, type User, type InsertUser,
  bookings, type Booking, type InsertBooking,
  enquiries, type Enquiry, type InsertEnquiry 
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookings: Map<number, Booking>;
  private enquiries: Map<number, Enquiry>;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.enquiries = new Map();
    this.currentId = { users: 1, bookings: 1, enquiries: 1 };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentId.bookings++;
    const booking = { ...insertBooking, id };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId,
    );
  }

  async createEnquiry(insertEnquiry: InsertEnquiry): Promise<Enquiry> {
    const id = this.currentId.enquiries++;
    const enquiry = { ...insertEnquiry, id };
    this.enquiries.set(id, enquiry);
    return enquiry;
  }
}

export const storage = new MemStorage();
