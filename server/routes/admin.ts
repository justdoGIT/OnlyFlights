import { Router } from "express";
import { storage } from "../storage";
import type { Request } from "express";

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
}

// Middleware to check if user is admin
const isAdmin = (req: AuthenticatedRequest, res: any, next: any) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  next();
};

// Get admin dashboard stats
router.get("/stats", isAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const [users, bookings, enquiries] = await Promise.all([
      storage.getAllUsers(),
      storage.getAllBookings(),
      storage.getAllEnquiries()
    ]);

    const stats = {
      totalUsers: users.length,
      activeBookings: bookings.filter(b => b.status === "active").length,
      newEnquiries: enquiries.filter(e => e.status === "new").length,
      monthlyRevenue: bookings
        .filter(b => {
          const bookingDate = new Date(b.createdAt);
          const now = new Date();
          return bookingDate.getMonth() === now.getMonth() && 
                 bookingDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, booking) => sum + parseFloat(booking.totalPrice), 0)
        .toFixed(2)
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});

export default router;