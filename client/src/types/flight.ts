import { z } from "zod";

export const flightSchema = z.object({
  id: z.number(),
  from: z.string(),
  to: z.string(),
  airline: z.string(),
  price: z.number(),
  stops: z.number(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  duration: z.string(),
  travelers: z.number().optional(),
});

export type Flight = z.infer<typeof flightSchema>;
