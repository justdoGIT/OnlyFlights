import { z } from "zod";

export const adminStatsSchema = z.object({
  totalBookings: z.number(),
  activeUsers: z.number(),
  pendingEnquiries: z.number(),
  totalRevenue: z.number()
});

export type AdminStats = z.infer<typeof adminStatsSchema>;

export type AdminLogEntry = {
  id: number;
  adminId: number;
  action: string;
  entityType: string;
  entityId: number;
  details: string;
  createdAt: Date;
};
