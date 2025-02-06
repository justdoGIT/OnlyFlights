import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaneTakeoff, Clock, Ban } from "lucide-react";
import { useLocation } from "wouter";
import type { Flight } from "@/data/flights";

interface FlightCardProps {
  flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
  const [, setLocation] = useLocation();

  const handleBooking = () => {
    // Store booking details in sessionStorage to persist through navigation
    sessionStorage.setItem('bookingDetails', JSON.stringify({
      ...flight,
      type: 'flight'
    }));
    setLocation("/booking");
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">{flight.airline}</div>
          <div className="text-2xl font-bold text-primary">${flight.price}</div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="text-center">
            <div className="font-semibold">{flight.departureTime}</div>
            <div className="text-sm text-gray-500">{flight.from}</div>
          </div>

          <div className="flex-1 mx-4 relative">
            <div className="border-t border-gray-300 absolute w-full top-1/2"></div>
            <div className="flex justify-center">
              <div className="bg-white px-2 relative -top-3 text-sm text-gray-500 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {flight.duration}
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="font-semibold">{flight.arrivalTime}</div>
            <div className="text-sm text-gray-500">{flight.to}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {flight.stops === 0 ? (
              <>
                <Ban className="h-4 w-4" />
                Direct
              </>
            ) : (
              <>
                <PlaneTakeoff className="h-4 w-4" />
                {flight.stops} {flight.stops === 1 ? 'stop' : 'stops'}
              </>
            )}
          </div>
          <Button onClick={handleBooking}>Book Now</Button>
        </div>
      </CardContent>
    </Card>
  );
}