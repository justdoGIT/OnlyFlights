import { Button } from "@/components/ui/button";
import { PlaneTakeoff, Hotel, Package } from "lucide-react";

export function Hero() {
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
            <Button size="lg" variant="secondary" className="gap-2">
              <PlaneTakeoff className="h-5 w-5" />
              Find Flights
            </Button>
            <Button size="lg" variant="secondary" className="gap-2">
              <Hotel className="h-5 w-5" />
              Book Hotels
            </Button>
            <Button size="lg" variant="secondary" className="gap-2">
              <Package className="h-5 w-5" />
              View Packages
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
