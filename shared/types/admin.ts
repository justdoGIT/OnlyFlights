import { z } from "zod";

// Dashboard statistics schema
export const adminStatsSchema = z.object({
  totalBookings: z.number(),
  activeUsers: z.number(),
  upcomingBookings: z.number(),
  newEnquiries: z.number(),
  recentActivity: z.array(z.object({
    id: z.number(),
    type: z.enum(['booking', 'enquiry', 'user']),
    action: z.string(),
    timestamp: z.date(),
  })).optional(),
});

export type AdminStats = z.infer<typeof adminStatsSchema>;

// Admin log entry type
export type AdminLogEntry = {
  id: number;
  adminId: number;
  action: string;
  entityType: string;
  entityId: number;
  details: string;
  createdAt: Date;
};

// Admin routes type
export type AdminRoute = {
  path: string;
  label: string;
  icon: string;
};