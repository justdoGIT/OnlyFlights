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

// Cache for stats data (5 minutes expiry)
let statsCache: any = null;
let statsCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get admin dashboard stats with caching
router.get("/stats", isAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const now = Date.now();

    // Return cached data if valid
    if (statsCache && (now - statsCacheTime) < CACHE_DURATION) {
      return res.json(statsCache);
    }

    // Fetch new data with optimized queries
    const [users, bookings, enquiries] = await Promise.all([
      storage.getAllUsers(),
      storage.getAllBookings(100), // Limit to recent bookings
      storage.getAllEnquiries(50)  // Limit to recent enquiries
    ]);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const stats = {
      totalUsers: users.length,
      activeBookings: bookings.filter(b => b.status === "active").length,
      newEnquiries: enquiries.filter(e => e.status === "new").length,
      monthlyRevenue: bookings
        .filter(b => {
          const bookingDate = new Date(b.createdAt);
          return bookingDate.getMonth() === currentMonth && 
                 bookingDate.getFullYear() === currentYear;
        })
        .reduce((sum, booking) => sum + parseFloat(booking.totalPrice), 0)
        .toFixed(2)
    };

    // Update cache
    statsCache = stats;
    statsCacheTime = now;

    res.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});

export default router;