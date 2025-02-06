import { FlightSearch } from "@/components/search/flight-search";

export default function Flights() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Find Your Flight
          </h1>
          <FlightSearch />
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6">Popular Flight Routes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { from: "New York", to: "London", price: 499 },
            { from: "Paris", to: "Tokyo", price: 799 },
            { from: "Dubai", to: "Singapore", price: 399 },
          ].map((route, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">{route.from}</p>
                  <p className="text-sm text-gray-500">to</p>
                  <p className="text-lg font-semibold">{route.to}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">from</p>
                  <p className="text-2xl font-bold text-primary">${route.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
