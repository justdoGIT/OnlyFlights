import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";

export function ProtectedRoute({ 
  path, 
  component: Component 
}: { 
  path: string; 
  component: React.ComponentType 
}) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const isAdminRoute = location.startsWith('/admin');

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user || (isAdminRoute && !user.isAdmin)) {
          setLocation("/auth");
          return null;
        }

        return <Component />;
      }}
    </Route>
  );
}
