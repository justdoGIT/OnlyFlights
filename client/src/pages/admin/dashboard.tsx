import { Suspense, lazy, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
  BarChart3
} from "lucide-react";

// Lazy load tables and charts
const BookingsTable = lazy(() => import("@/components/admin/bookings-table"));
const EnquiriesTable = lazy(() => import("@/components/admin/enquiries-table"));

// Memoized stat card component
const StatCard = React.memo(({ icon: Icon, label, value }: { 
  icon: any, 
  label: string, 
  value: string | number 
}) => (
  <Card className="p-4 flex items-center space-x-4">
    <Icon className="w-8 h-8 text-primary" />
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </Card>
));

interface AdminStats {
  totalUsers: number;
  activeBookings: number;
  newEnquiries: number;
  monthlyRevenue: number;
}

interface User {
  isAdmin: boolean;
}

const AdminDashboard = () => {
  const [, navigate] = useLocation();

  // Optimized queries with proper types and caching
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    staleTime: 30000,
    retry: 1
  });

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    staleTime: 60000,
    refetchInterval: 300000,
    retry: 2
  });

  useEffect(() => {
    if (!userLoading && (!user || !user.isAdmin)) {
      navigate('/');
    }
  }, [user, userLoading, navigate]);

  // Memoize navigation handlers
  const handleNavigation = useCallback((route: string) => {
    navigate(`/admin/${route}`);
  }, [navigate]);

  // Memoize stats data
  const statsData = useMemo(() => ({
    totalUsers: stats?.totalUsers ?? 'Loading...',
    activeBookings: stats?.activeBookings ?? 'Loading...',
    newEnquiries: stats?.newEnquiries ?? 'Loading...',
    monthlyRevenue: stats?.monthlyRevenue ? `$${stats.monthlyRevenue}` : 'Loading...'
  }), [stats]);

  if (userLoading) {
    return <div className="p-4"><Skeleton className="h-[400px]" /></div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats Overview with loading states */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array(4).fill(null).map((_, i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))
        ) : (
          <>
            <StatCard icon={Users} label="Total Users" value={statsData.totalUsers} />
            <StatCard icon={CalendarDays} label="Active Bookings" value={statsData.activeBookings} />
            <StatCard icon={MessagesSquare} label="New Enquiries" value={statsData.newEnquiries} />
            <StatCard icon={BarChart3} label="Monthly Revenue" value={statsData.monthlyRevenue} />
          </>
        )}
      </div>

      {/* Main Content Area with Suspense boundaries */}
      <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="flex flex-col h-full p-4">
            <h2 className="text-lg font-semibold mb-4">Navigation</h2>
            <nav className="space-y-2">
              {['dashboard', 'users', 'bookings', 'enquiries'].map((route) => (
                <button
                  key={route}
                  onClick={() => handleNavigation(route)}
                  className="w-full text-left px-4 py-2 rounded hover:bg-accent capitalize"
                >
                  {route}
                </button>
              ))}
            </nav>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={75}>
          <Suspense fallback={<div className="p-4"><Skeleton className="h-[400px]" /></div>}>
            <div className="p-4">
              <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                {statsLoading ? (
                  <Skeleton className="h-[200px]" />
                ) : (
                  <>
                    <BookingsTable />
                    <EnquiriesTable />
                  </>
                )}
              </Card>
            </div>
          </Suspense>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default AdminDashboard;