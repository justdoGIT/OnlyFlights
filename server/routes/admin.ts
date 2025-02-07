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

// Get bookings with pagination
router.get("/bookings", isAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const bookings = await storage.getBookings(limit, offset);
    const totalBookings = await storage.getBookingsCount();
    
    res.json({
      bookings,
      hasMore: offset + bookings.length < totalBookings
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// Update booking status
router.patch("/bookings/:id", isAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await storage.updateBookingStatus(parseInt(id), status);
    res.json({ message: "Booking updated successfully" });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Failed to update booking" });
  }
});

// Get admin dashboard stats with caching
// Get users with pagination
router.get("/users", isAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const users = await storage.getUsers(limit, offset);
    const totalUsers = await storage.getUsersCount();
    
    res.json({
      users,
      hasMore: offset + users.length < totalUsers
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Update user role
router.patch("/users/:id", isAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { isAdmin: makeAdmin } = req.body;

    await storage.updateUserRole(parseInt(id), makeAdmin);
    res.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

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
      totalUsers: users?.length || 0,
      activeBookings: bookings?.filter(b => b.status === "active")?.length || 0,
      newEnquiries: enquiries?.filter(e => e.status === "new")?.length || 0,
      monthlyRevenue: bookings
        ?.filter(b => {
          const bookingDate = new Date(b.createdAt);
          return bookingDate.getMonth() === currentMonth && 
                 bookingDate.getFullYear() === currentYear;
        })
        ?.reduce((sum, booking) => sum + (parseFloat(booking.totalPrice) || 0), 0)
        ?.toFixed(2) || "0.00"
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