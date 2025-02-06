import { useEffect } from "react";
import { useNavigate } from "wouter";
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

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Fetch user data to check admin status
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  useEffect(() => {
    if (!userLoading && (!user || !user.isAdmin)) {
      navigate('/');
    }
  }, [user, userLoading, navigate]);

  if (userLoading) {
    return <div className="p-4"><Skeleton className="h-[400px]" /></div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center space-x-4">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <h3 className="text-2xl font-bold">Loading...</h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center space-x-4">
          <CalendarDays className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Active Bookings</p>
            <h3 className="text-2xl font-bold">Loading...</h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center space-x-4">
          <MessagesSquare className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">New Enquiries</p>
            <h3 className="text-2xl font-bold">Loading...</h3>
          </div>
        </Card>
        <Card className="p-4 flex items-center space-x-4">
          <BarChart3 className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            <h3 className="text-2xl font-bold">Loading...</h3>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="flex flex-col h-full p-4">
            <h2 className="text-lg font-semibold mb-4">Navigation</h2>
            <nav className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded hover:bg-accent">
                Dashboard
              </button>
              <button className="w-full text-left px-4 py-2 rounded hover:bg-accent">
                Users
              </button>
              <button className="w-full text-left px-4 py-2 rounded hover:bg-accent">
                Bookings
              </button>
              <button className="w-full text-left px-4 py-2 rounded hover:bg-accent">
                Enquiries
              </button>
            </nav>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={75}>
          <div className="p-4">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <p className="text-muted-foreground">No recent activity to display</p>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default AdminDashboard;