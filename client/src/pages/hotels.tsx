import { HotelSearch } from "@/components/search/hotel-search";
import { HotelCard } from "@/components/hotel-card";
import { hotels } from "@/data/hotels";

export default function Hotels() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Find Perfect Hotels
          </h1>
          <HotelSearch />
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6">Featured Hotels</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <HotelCard key={hotel.id} {...hotel} />
          ))}
        </div>
      </div>
    </div>
  );
}
