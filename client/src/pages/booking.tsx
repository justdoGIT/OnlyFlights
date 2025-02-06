import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const bookingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
});

type BookingData = z.infer<typeof bookingSchema>;

export default function BookingPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    // Retrieve booking details from sessionStorage
    const storedDetails = sessionStorage.getItem('bookingDetails');
    if (storedDetails) {
      try {
        const details = JSON.parse(storedDetails);
        setBookingDetails(details);
        // Clear the stored details to prevent stale data
        sessionStorage.removeItem('bookingDetails');
      } catch (error) {
        console.error('Failed to parse booking details:', error);
        toast({
          title: "Error",
          description: "Failed to load booking details",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const form = useForm<BookingData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: BookingData) => {
    if (!bookingDetails) {
      toast({
        title: "Error",
        description: "No booking details found",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userId: user?.id,
          type: bookingDetails.type,
          itemId: bookingDetails.id,
          status: "pending",
        }),
      });

      if (!response.ok) throw new Error("Failed to create booking");

      toast({
        title: "Success",
        description: "Your booking has been confirmed!",
      });

      // Redirect to home page
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">No booking details found</p>
            <Button
              className="mt-4 w-full"
              onClick={() => setLocation("/")}
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-6">Complete Your Booking</h1>

            <div className="mb-8 p-4 bg-gray-100 rounded-lg">
              <h2 className="font-semibold mb-2">Booking Summary</h2>
              {bookingDetails.type === "flight" && (
                <div>
                  <p>Flight from {bookingDetails.from} to {bookingDetails.to}</p>
                  <p>Date: {bookingDetails.departureTime}</p>
                  <p className="font-semibold mt-2">Price: ${bookingDetails.price}</p>
                </div>
              )}
              {bookingDetails.type === "hotel" && (
                <div>
                  <p>{bookingDetails.name}</p>
                  <p>Location: {bookingDetails.location}</p>
                  <p className="font-semibold mt-2">Price: ${bookingDetails.price}/night</p>
                </div>
              )}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Confirm Booking"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}