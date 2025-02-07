import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { PlaneTakeoff, Hotel, Package, Phone, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  href: string;
  label: string;
}

interface NavbarProps {
  additionalItems?: NavItem[];
}

export function Navbar({ additionalItems = [] }: NavbarProps) {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation("/");
  };

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  const mainNavItems = [
    { href: "/flights", label: "Flights", icon: PlaneTakeoff },
    { href: "/hotels", label: "Hotels", icon: Hotel },
    { href: "/packages", label: "Packages", icon: Package },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="text-2xl font-bold text-primary cursor-pointer" 
          onClick={() => handleNavigation("/")}
        >
          OnlyFlights
        </div>

        <NavigationMenu>
          <NavigationMenuList>
            {mainNavItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink
                  className={cn(
                    "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                  )}
                  onClick={() => handleNavigation(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
            {additionalItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink
                  className={cn(
                    "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                  )}
                  onClick={() => handleNavigation(item.href)}
                >
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <User className="h-4 w-4" />
                  {user.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleNavigation("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                {user.isAdmin && (
                  <DropdownMenuItem onClick={() => handleNavigation("/admin/dashboard")}>
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleNavigation("/auth")}>
                Sign In
              </Button>
              <Button onClick={() => handleNavigation("/auth")}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}