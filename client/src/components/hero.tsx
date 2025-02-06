import { Button } from "@/components/ui/button";
import { PlaneTakeoff, Hotel, Package } from "lucide-react";
import { useLocation } from "wouter";

export function Hero() {
  const [, setLocation] = useLocation();

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
      <div className="relative container mx-auto px-4 py-20 text-white">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl mb-8">
            Book flights, hotels, and holiday packages at the best prices. Start your journey with us today!
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              variant="secondary" 
              className="gap-2"
              onClick={() => handleNavigation("/flights")}
            >
              <PlaneTakeoff className="h-5 w-5" />
              Find Flights
            </Button>
            <Button 
              size="lg" 
              variant="secondary" 
              className="gap-2"
              onClick={() => handleNavigation("/hotels")}
            >
              <Hotel className="h-5 w-5" />
              Book Hotels
            </Button>
            <Button 
              size="lg" 
              variant="secondary" 
              className="gap-2"
              onClick={() => handleNavigation("/packages")}
            >
              <Package className="h-5 w-5" />
              View Packages
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}