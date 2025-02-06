import { DestinationCard } from "@/components/destination-card";
import { ActivityCard } from "@/components/activity-card";
import { destinations } from "@/data/destinations";
import { activities } from "@/data/activities";

export default function Packages() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Holiday Packages</h1>
          <p className="text-xl">Discover our curated holiday experiences</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6">Popular Packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {destinations.slice(0, 6).map((destination) => (
            <DestinationCard key={destination.id} {...destination} />
          ))}
        </div>

        <h2 className="text-2xl font-bold mt-16 mb-6">Featured Activities</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} {...activity} />
          ))}
        </div>
      </div>
    </div>
  );
}
