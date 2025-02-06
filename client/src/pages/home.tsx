import { Hero } from "@/components/hero";
import { DestinationCard } from "@/components/destination-card";
import { HotelCard } from "@/components/hotel-card";
import { ActivityCard } from "@/components/activity-card";
import { destinations } from "@/data/destinations";
import { hotels } from "@/data/hotels";
import { activities } from "@/data/activities";

export default function Home() {
  return (
    <div>
      <Hero />
      
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Popular Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.slice(0, 4).map((destination) => (
            <DestinationCard key={destination.id} {...destination} />
          ))}
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Hotels</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hotels.slice(0, 3).map((hotel) => (
              <HotelCard key={hotel.id} {...hotel} />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Popular Activities</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} {...activity} />
          ))}
        </div>
      </div>
    </div>
  );
}
