import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart3,
  Users,
  CalendarRange,
  MessageSquare,
  Menu
} from "lucide-react";
import { BookingsTable } from "@/components/admin/bookings-table";
import { EnquiriesTable } from "@/components/admin/enquiries-table";
import { UsersTable } from "@/components/admin/users-table";
import { AdminActivityLog } from "@/components/admin/activity-log";
import { useQuery } from "@tanstack/react-query";
import type { AdminStats } from "@shared/types/admin";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.isAdmin) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        {/* Sidebar for larger screens */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={20} className="hidden md:block">
          <AdminSidebar />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Content */}
        <ResizablePanel defaultSize={80}>
          <div className="h-full flex flex-col">
            {/* Top Bar */}
            <header className="border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Mobile menu */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    <AdminSidebar />
                  </SheetContent>
                </Sheet>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.username}
                </span>
              </div>
            </header>

            {/* Dashboard Content */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatsCard 
                    title="Total Bookings" 
                    value={String(stats?.totalBookings || 0)}
                    icon={<BarChart3 className="h-4 w-4" />}
                  />
                  <StatsCard 
                    title="Active Users" 
                    value={String(stats?.activeUsers || 0)}
                    icon={<Users className="h-4 w-4" />}
                  />
                  <StatsCard 
                    title="Upcoming Bookings" 
                    value={String(stats?.upcomingBookings || 0)}
                    icon={<MessageSquare className="h-4 w-4" />}
                  />
                  <StatsCard 
                    title="New Enquiries" 
                    value={String(stats?.newEnquiries || 0)}
                    icon={<BarChart3 className="h-4 w-4" />}
                  />
                </div>

                {/* Main dashboard content */}
                <div className="rounded-lg border bg-card p-6">
                  <Tabs defaultValue="bookings" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="bookings">Bookings</TabsTrigger>
                      <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
                      <TabsTrigger value="users">Users</TabsTrigger>
                      <TabsTrigger value="activity">Activity Log</TabsTrigger>
                    </TabsList>
                    <TabsContent value="bookings">
                      <BookingsTable />
                    </TabsContent>
                    <TabsContent value="enquiries">
                      <EnquiriesTable />
                    </TabsContent>
                    <TabsContent value="users">
                      <UsersTable />
                    </TabsContent>
                    <TabsContent value="activity">
                      <AdminActivityLog />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function StatsCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function AdminSidebar() {
  const [, setLocation] = useLocation();

  return (
    <div className="h-full border-r bg-background">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setLocation("/admin")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setLocation("/admin/users")}
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setLocation("/admin/bookings")}
            >
              <CalendarRange className="mr-2 h-4 w-4" />
              Bookings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setLocation("/admin/enquiries")}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Enquiries
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}