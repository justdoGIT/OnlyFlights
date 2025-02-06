import { useState } from "react";
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
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlaneTakeoff, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { flights, popularCities } from "@/data/flights";
import { FlightCard } from "@/components/flight-card";

export function FlightSearch() {
  const [tripType, setTripType] = useState("round");
  const [departDate, setDepartDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState(flights);

  const handleSearch = () => {
    // Filter flights based on search criteria
    const results = flights.filter(
      flight => 
        (!from || flight.from.toLowerCase().includes(from.toLowerCase())) &&
        (!to || flight.to.toLowerCase().includes(to.toLowerCase()))
    );
    setSearchResults(results);
    setShowResults(true);
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="mb-6">
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
            <div>
              <Label>From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
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
                          onSelect={() => setFrom(city)}
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

            <div>
              <Label>To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
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
                          onSelect={() => setTo(city)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <Label>Departure Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !departDate && "text-muted-foreground"
                    )}
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
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {tripType === "round" && (
              <div>
                <Label>Return Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !returnDate && "text-muted-foreground"
                      )}
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <Button className="w-full mt-6" size="lg" onClick={handleSearch}>
            <PlaneTakeoff className="mr-2 h-5 w-5" />
            Search Flights
          </Button>
        </CardContent>
      </Card>

      {showResults && (
        <div className="mt-8 space-y-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Available Flights</h2>
          {searchResults.length > 0 ? (
            searchResults.map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No flights found for your search criteria.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}