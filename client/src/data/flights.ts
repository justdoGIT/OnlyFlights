import type { Flight } from "@/types/flight";

export const flights: Flight[] = [
  {
    id: 1,
    from: "New York",
    to: "London",
    departureTime: "10:00 AM",
    arrivalTime: "10:30 PM",
    airline: "British Airways",
    price: 499,
    duration: "7h 30m",
    stops: 0
  },
  {
    id: 2,
    from: "London",
    to: "Paris",
    departureTime: "2:00 PM",
    arrivalTime: "3:30 PM",
    airline: "Air France",
    price: 199,
    duration: "1h 30m",
    stops: 0
  },
  {
    id: 3,
    from: "Paris",
    to: "Dubai",
    departureTime: "11:00 PM",
    arrivalTime: "8:30 AM",
    airline: "Emirates",
    price: 599,
    duration: "6h 30m",
    stops: 1
  },
  {
    id: 4,
    from: "Dubai",
    to: "Singapore",
    departureTime: "3:00 AM",
    arrivalTime: "3:30 PM",
    airline: "Singapore Airlines",
    price: 399,
    duration: "7h 30m",
    stops: 0
  },
  {
    id: 5,
    from: "Singapore",
    to: "Tokyo",
    departureTime: "9:00 AM",
    arrivalTime: "5:30 PM",
    airline: "Japan Airlines",
    price: 299,
    duration: "7h 30m",
    stops: 0
  }
];

export const popularCities = [
  "New York",
  "London",
  "Paris",
  "Dubai",
  "Singapore",
  "Tokyo",
  "Hong Kong",
  "Sydney"
];