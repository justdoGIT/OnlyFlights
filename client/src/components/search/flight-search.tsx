import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlaneTakeoff, Check, Filter, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { popularCities } from "@/data/flights";
import { FlightCard } from "@/components/flight-card";
import type { Flight } from "@/types/flight";
import { useQuery } from "@tanstack/react-query";

export function FlightSearch() {
  const [tripType, setTripType] = useState("round");
  const [departDate, setDepartDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedAirline, setSelectedAirline] = useState<string>("any");
  const [maxStops, setMaxStops] = useState<string>("any");
  const [showFilters, setShowFilters] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { data: flights = [], isLoading, isError } = useQuery<Flight[]>({
    queryKey: ['/api/flights'],
    enabled: showResults,
  });

  const airlines = useMemo(() => {
    return Array.from(new Set(flights.map(flight => flight.airline)));
  }, [flights]);

  const maxPrice = useMemo(() => {
    return Math.max(...flights.map(flight => flight.price));
  }, [flights]);

  useEffect(() => {
    if (flights.length > 0) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice, flights]);

  const validateSearch = () => {
    if (!from) {
      setSearchError("Please select a departure city");
      return false;
    }
    if (!to) {
      setSearchError("Please select an arrival city");
      return false;
    }
    if (!departDate) {
      setSearchError("Please select a departure date");
      return false;
    }
    if (tripType === "round" && !returnDate) {
      setSearchError("Please select a return date");
      return false;
    }
    if (tripType === "round" && returnDate && departDate > returnDate) {
      setSearchError("Return date must be after departure date");
      return false;
    }
    if (travelers < 1 || travelers > 9) {
      setSearchError("Number of travelers must be between 1 and 9");
      return false;
    }
    setSearchError(null);
    return true;
  };

  const [searchResults, setSearchResults] = useState<Flight[]>([]);

  const handleSearch = () => {
    if (!validateSearch()) {
      return;
    }

    const results = flights.filter(flight => {
      const matchesRoute = (!from || flight.from.toLowerCase().includes(from.toLowerCase())) &&
        (!to || flight.to.toLowerCase().includes(to.toLowerCase()));

      const matchesPrice = flight.price >= priceRange[0] && flight.price <= priceRange[1];

      const matchesAirline = selectedAirline === "any" || flight.airline === selectedAirline;

      const matchesStops = maxStops === "any" ||
        (maxStops === "0" && flight.stops === 0) ||
        (maxStops === "1" && flight.stops <= 1) ||
        (maxStops === "2+" && flight.stops >= 2);

      return matchesRoute && matchesPrice && matchesAirline && matchesStops;
    });

    setSearchResults(results);
    setShowResults(true);
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="space-y-6">
            {searchError && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {searchError}
              </div>
            )}

            <div>
              <RadioGroup
                defaultValue="round"
                onValueChange={setTripType}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="round" id="round" />
                  <Label htmlFor="round">Round Trip</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="one" id="one" />
                  <Label htmlFor="one">One Way</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between h-10",
                        !from && "text-muted-foreground"
                      )}
                    >
                      {from || "Select departure city"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search cities..." />
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup>
                        {popularCities.map((city) => (
                          <CommandItem
                            key={city}
                            onSelect={() => {
                              setFrom(city);
                              setSearchError(null);
                            }}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                from === city ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {city}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between h-10",
                        !to && "text-muted-foreground"
                      )}
                    >
                      {to || "Select arrival city"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search cities..." />
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup>
                        {popularCities.map((city) => (
                          <CommandItem
                            key={city}
                            onSelect={() => {
                              setTo(city);
                              setSearchError(null);
                            }}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                to === city ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {city}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Departure Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left h-10",
                        !departDate && "text-muted-foreground"
                      )}
                      onClick={() => setSearchError(null)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {departDate ? format(departDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={departDate}
                      onSelect={setDepartDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {tripType === "round" && (
                <div className="space-y-2">
                  <Label>Return Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left h-10",
                          !returnDate && "text-muted-foreground"
                        )}
                        onClick={() => setSearchError(null)}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {returnDate ? format(returnDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={setReturnDate}
                        disabled={(date) => date < (departDate || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div className="space-y-2">
                <Label>Number of Travelers</Label>
                <Input
                  type="number"
                  min="1"
                  max="9"
                  value={travelers}
                  onChange={(e) => {
                    setTravelers(parseInt(e.target.value) || 1);
                    setSearchError(null);
                  }}
                  className="h-10"
                />
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>

            {showFilters && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>Price Range (${priceRange[0]} - ${priceRange[1]})</Label>
                  <Slider
                    min={0}
                    max={maxPrice || 1000}
                    step={50}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Airline</Label>
                  <Select
                    value={selectedAirline}
                    onValueChange={setSelectedAirline}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Any Airline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Airline</SelectItem>
                      {airlines.map((airline) => (
                        <SelectItem key={airline} value={airline}>
                          {airline}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Maximum Stops</Label>
                  <Select value={maxStops} onValueChange={setMaxStops}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Any number of stops" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any number of stops</SelectItem>
                      <SelectItem value="0">Non-stop only</SelectItem>
                      <SelectItem value="1">1 stop or less</SelectItem>
                      <SelectItem value="2+">2+ stops</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <PlaneTakeoff className="mr-2 h-5 w-5" />
                  Search Flights
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showResults && (
        <div className="mt-8 space-y-4 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Available Flights</h2>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isError ? (
              <p className="text-sm text-red-500">Error fetching flights.</p>
            ) : (
              <p className="text-sm text-gray-500">
                {searchResults.length} {searchResults.length === 1 ? 'flight' : 'flights'} found
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-24 bg-gray-200 rounded-md" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card>
              <CardContent className="p-6 text-center text-red-500">
                Error fetching flights. Please try again later.
              </CardContent>
            </Card>
          ) : searchResults.length > 0 ? (
            searchResults.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={{ ...flight, travelers }}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No flights found matching your search criteria.
                Try adjusting your filters or search parameters.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}