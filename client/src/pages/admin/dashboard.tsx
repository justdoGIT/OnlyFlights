import React, { Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  CalendarDays,
  MessagesSquare,
  Loader2
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";

// Lazy load tables
const BookingsTable = lazy(() => import("@/components/admin/bookings-table"));
const EnquiriesTable = lazy(() => import("@/components/admin/enquiries-table"));
const UsersTable = lazy(() => import("@/components/admin/users-table"));

interface AdminStats {
  totalUsers: number;
  activeBookings: number;
  newEnquiries: number;
  monthlyRevenue: string;
}

interface Analytics {
  overview: {
    totalRevenue: number;
    totalBookings: number;
    totalUsers: number;
    totalEnquiries: number;
    avgBookingValue: number;
  };
  trends: {
    revenue: Array<{
      date: string;
      revenue: number;
    }>;
    userGrowth: Array<{
      date: string;
      count: number;
    }>;
    bookingStatus: {
      pending: number;
      confirmed: number;
      cancelled: number;
    };
    popularTypes: {
      [key: string]: number;
    };
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Memoized StatCard component
const StatCard = React.memo(({ icon: Icon, label, value }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) => (
  <Card className="p-4 flex items-center space-x-4">
    <Icon className="w-8 h-8 text-primary" />
    <div className="flex-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </Card>
));

const AdminDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = React.useState<'7d' | '30d' | '90d' | '1y'>('7d');
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    staleTime: 60000,
    refetchInterval: 300000,
    retry: 3,
  });

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery<Analytics>({
    queryKey: ['/api/admin/analytics', timeframe],
    staleTime: 60000,
    refetchInterval: 300000,
    retry: 3,
  });

  React.useEffect(() => {
    if (!user?.isAdmin) {
      setLocation('/auth');
      return;
    }
  }, [user, setLocation]);

  if (!user?.isAdmin) return null;

  if (statsError || analyticsError) {
    const errorMessage = statsError?.message || analyticsError?.message || "Failed to load dashboard data";
    toast({
      title: "Error loading dashboard data",
      description: errorMessage,
      variant: "destructive"
    });
    return (
      <div className="container mx-auto p-4">
        <div className="bg-destructive/15 rounded-lg p-4">
          <p className="text-destructive">Error loading dashboard. Please try again later.</p>
          <p className="text-sm text-destructive/80 mt-2">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Select value={timeframe} onValueChange={(value: typeof timeframe) => setTimeframe(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array(4).fill(null).map((_, i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))
        ) : stats && (
          <>
            <StatCard
              icon={Loader2}
              label="Monthly Revenue"
              value={`$${stats.monthlyRevenue}`}
            />
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.totalUsers}
            />
            <StatCard
              icon={CalendarDays}
              label="Active Bookings"
              value={stats.activeBookings}
            />
            <StatCard
              icon={MessagesSquare}
              label="New Enquiries"
              value={stats.newEnquiries}
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
        <ResizablePanel defaultSize={25}>
          <div className="p-4 h-full">
            <h2 className="text-lg font-semibold mb-4">Booking Status</h2>
            {!analyticsLoading && analytics ? (
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={Object.entries(analytics.trends.bookingStatus).map(([name, value]) => ({
                      name,
                      value
                    }))}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[300px]" />
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={75}>
          <div className="p-4 h-full">
            <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
            {!analyticsLoading && analytics ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.trends.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[300px]" />
            )}

            <h2 className="text-lg font-semibold my-4">User Growth</h2>
            {!analyticsLoading && analytics ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.trends.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[300px]" />
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Tables Section */}
      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">User Management</h2>
            <UsersTable />
          </Card>
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
            <BookingsTable />
          </Card>
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Recent Enquiries</h2>
            <EnquiriesTable />
          </Card>
        </div>
      </Suspense>
    </div>
  );
};

export default AdminDashboard;