import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

// Middleware to check if user is admin
const isAdmin = (req: any, res: any, next: any) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  next();
};

// Get admin dashboard stats
router.get("/stats", isAdmin, async (req, res) => {
  try {
    const [users, bookings, enquiries] = await Promise.all([
      storage.getAllUsers(),
      storage.getAllBookings(),
      storage.getAllEnquiries()
    ]);

    const stats = {
      totalBookings: bookings.length,
      activeUsers: users.length,
      pendingEnquiries: enquiries.filter(e => e.status === "new").length,
      totalRevenue: bookings.reduce((acc, booking) => acc + Number(booking.totalPrice), 0)
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});

// Get all users
router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Update user role
router.patch("/users/:id", isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const isAdmin = z.boolean().parse(req.body.isAdmin);

    const user = await storage.updateUser(id, { isAdmin });

    // Log admin action
    await storage.createAdminLog({
      adminId: req.user.id,
      action: "update_user_role",
      entityType: "users",
      entityId: id,
      details: JSON.stringify({ isAdmin })
    });

    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Get paginated bookings
router.get("/bookings", isAdmin, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const bookings = await storage.getAllBookings(limit, offset);
    const hasMore = bookings.length === limit;

    res.json({ bookings, hasMore });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// Update booking status
router.patch("/bookings/:id", isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = z.string().parse(req.body.status);

    const booking = await storage.updateBookingStatus(id, status);

    // Log admin action
    await storage.createAdminLog({
      adminId: req.user!.id,
      action: "update_booking_status",
      entityType: "bookings",
      entityId: id,
      details: JSON.stringify({ status })
    });

    res.json(booking);
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Failed to update booking" });
  }
});

// Get paginated enquiries
router.get("/enquiries", isAdmin, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const enquiries = await storage.getAllEnquiries(limit, offset);
    const hasMore = enquiries.length === limit;

    res.json({ enquiries, hasMore });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    res.status(500).json({ message: "Failed to fetch enquiries" });
  }
});

// Update enquiry status
router.patch("/enquiries/:id", isAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = z.string().parse(req.body.status);

    const enquiry = await storage.updateEnquiryStatus(id, status);

    // Log admin action
    await storage.createAdminLog({
      adminId: req.user!.id,
      action: "update_enquiry_status",
      entityType: "enquiries",
      entityId: id,
      details: JSON.stringify({ status })
    });

    res.json(enquiry);
  } catch (error) {
    console.error("Error updating enquiry:", error);
    res.status(500).json({ message: "Failed to update enquiry" });
  }
});

// Get admin activity logs
router.get("/logs", isAdmin, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const logs = await storage.getAdminLogs(limit, offset);
    const hasMore = logs.length === limit;

    res.json({ logs, hasMore });
  } catch (error) {
    console.error("Error fetching admin logs:", error);
    res.status(500).json({ message: "Failed to fetch admin logs" });
  }
});

export default router;