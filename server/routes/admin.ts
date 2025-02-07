import { Router } from "express";
import { storage } from "../storage";
import type { Request, Response, NextFunction } from "express";
import { User } from "@shared/schema";

const router = Router();

interface AdminRequest extends Request {
  user?: User;
}

// Middleware to check if user is admin
const isAdmin = (req: AdminRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Unauthorized - Admin access required" });
  }
  next();
};

// Apply admin middleware to all routes
router.use(isAdmin);

// Cache for stats data (5 minutes expiry)
interface StatsCache {
  data: any;
  timestamp: number;
}

let statsCache: StatsCache | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get users with pagination, search, and role filtering
router.get("/users", async (req: AdminRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const offset = (page - 1) * limit;

    const users = await storage.getAllUsers();

    // Apply filters
    let filteredUsers = users;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    if (role === 'admin') {
      filteredUsers = filteredUsers.filter(user => user.isAdmin);
    } else if (role === 'user') {
      filteredUsers = filteredUsers.filter(user => !user.isAdmin);
    }

    // Sort users by creation date (newest first)
    filteredUsers.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const totalUsers = filteredUsers.length;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    res.json({
      users: paginatedUsers,
      hasMore: offset + limit < totalUsers,
      total: totalUsers
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Update user role
router.patch("/users/:id", async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isAdmin: makeAdmin } = req.body;

    // Prevent removing admin role from the last admin
    if (!makeAdmin) {
      const adminUsers = await storage.getAdminUsers();
      if (adminUsers.length === 1 && adminUsers[0].id === parseInt(id)) {
        return res.status(400).json({
          message: "Cannot remove admin role from the last admin user"
        });
      }
    }

    const updatedUser = await storage.updateUser(parseInt(id), { isAdmin: makeAdmin });
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Get bookings with pagination
router.get("/bookings", async (req: AdminRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const bookings = await storage.getAllBookings(limit);
    const totalBookings = bookings.length;

    res.json({
      bookings: bookings.slice(offset, offset + limit),
      hasMore: offset + limit < totalBookings
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// Update booking status
router.patch("/bookings/:id", async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await storage.updateBooking(parseInt(id), { status });
    res.json(updated);
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Failed to update booking" });
  }
});

// Get detailed analytics stats
router.get("/analytics", async (req: AdminRequest, res: Response) => {
  try {
    const timeframe = req.query.timeframe as string || '7d'; // 7d, 30d, 90d, 1y
    const now = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setDate(now.getDate() - 365);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const [users, bookings, enquiries] = await Promise.all([
      storage.getAllUsers(),
      storage.getAllBookings(1000), // Get more bookings for better analytics
      storage.getAllEnquiries(1000)
    ]);

    // Filter data based on timeframe
    const filteredBookings = bookings.filter(b => new Date(b.created_at) >= startDate);
    const filteredUsers = users.filter(u => new Date(u.created_at) >= startDate);
    const filteredEnquiries = enquiries.filter(e => new Date(e.created_at) >= startDate);

    // Calculate revenue trends
    const revenueTrend = new Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayBookings = filteredBookings.filter(b => {
        const bookingDate = new Date(b.created_at);
        return bookingDate.toDateString() === date.toDateString();
      });
      return {
        date: date.toISOString().split('T')[0],
        revenue: dayBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice), 0)
      };
    }).reverse();

    // Calculate booking status distribution
    const bookingStatusDistribution = {
      pending: filteredBookings.filter(b => b.status === 'pending').length,
      confirmed: filteredBookings.filter(b => b.status === 'confirmed').length,
      cancelled: filteredBookings.filter(b => b.status === 'cancelled').length
    };

    // Calculate user growth trend
    const userGrowthTrend = new Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        count: filteredUsers.filter(u => {
          const userDate = new Date(u.created_at);
          return userDate.toDateString() === date.toDateString();
        }).length
      };
    }).reverse();

    // Popular booking types
    const bookingTypes = filteredBookings.reduce((acc: { [key: string]: number }, booking) => {
      acc[booking.type] = (acc[booking.type] || 0) + 1;
      return acc;
    }, {});

    const analytics = {
      overview: {
        totalRevenue: filteredBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice), 0),
        totalBookings: filteredBookings.length,
        totalUsers: filteredUsers.length,
        totalEnquiries: filteredEnquiries.length,
        avgBookingValue: filteredBookings.length ?
          (filteredBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice), 0) / filteredBookings.length) : 0
      },
      trends: {
        revenue: revenueTrend,
        userGrowth: userGrowthTrend,
        bookingStatus: bookingStatusDistribution,
        popularTypes: bookingTypes
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

// Get stats with caching
router.get("/stats", async (req: AdminRequest, res: Response) => {
  try {
    const now = Date.now();
    // Return cached data if valid
    if (statsCache && (now - statsCache.timestamp) < CACHE_DURATION) {
      return res.json(statsCache.data);
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
      activeBookings: bookings?.filter(b => b.status === "confirmed")?.length || 0,
      newEnquiries: enquiries?.filter(e => e.status === "new")?.length || 0,
      monthlyRevenue: bookings
        ?.filter(b => {
          const bookingDate = new Date(b.created_at);
          return bookingDate.getMonth() === currentMonth &&
            bookingDate.getFullYear() === currentYear;
        })
        ?.reduce((sum, booking) => sum + (parseFloat(booking.totalPrice) || 0), 0)
        ?.toFixed(2) || "0.00"
    };

    // Update cache
    statsCache = {
      data: stats,
      timestamp: now
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});

export default router;