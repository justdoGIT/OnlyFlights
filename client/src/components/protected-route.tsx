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
  const [, setLocation] = useLocation();
  const isAdminRoute = path.startsWith('/admin');

  if (!isLoading && (!user || (isAdminRoute && !user?.isAdmin))) {
    setLocation('/auth');
    return null;
  }

  return <Route path={path} component={Component} />;
}