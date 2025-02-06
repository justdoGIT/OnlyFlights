import { FlightSearch } from "@/components/search/flight-search";

export default function Flights() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Find Your Perfect Flight
          </h1>
          <FlightSearch />
        </div>
      </div>
    </div>
  );
}