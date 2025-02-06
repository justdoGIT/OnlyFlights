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
import { PaymentForm } from "@/components/payment-form";
import { TravelerDetails } from "@/components/traveler-details";

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
  const [showPayment, setShowPayment] = useState(false);
  const [showTravelerDetails, setShowTravelerDetails] = useState(false);
  const [travelersData, setTravelersData] = useState<any>(null);

  useEffect(() => {
    const storedDetails = sessionStorage.getItem('bookingDetails');
    if (storedDetails) {
      try {
        const details = JSON.parse(storedDetails);
        setBookingDetails(details);
        if (details.travelers > 1) {
          setShowTravelerDetails(true);
        }
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

  const bookingForm = useForm<BookingData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: user?.email || "",
      phone: "",
    },
  });

  const onTravelerDetailsSubmit = (data: any) => {
    setTravelersData(data);
    setShowTravelerDetails(false);
    setShowPayment(true);
  };

  const onBookingSubmit = async (data: BookingData) => {
    if (bookingDetails?.travelers > 1 && !travelersData) {
      setShowTravelerDetails(true);
    } else {
      setShowPayment(true);
    }
  };

  const onPaymentSubmit = async (paymentData: any) => {
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
      // Mock payment validation
      if (!paymentData.cardNumber.endsWith('4242')) {
        throw new Error('Payment failed. Use a card number ending in 4242 for testing.');
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // If payment successful, create booking
      const bookingData = {
        ...bookingForm.getValues(),
        userId: user?.id,
        type: bookingDetails.type,
        itemId: bookingDetails.id || 1,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        totalPrice: String(bookingDetails.price * bookingDetails.travelers),
        status: "confirmed",
        details: JSON.stringify({
          ...bookingDetails,
          travelers: travelersData,
          price: String(bookingDetails.price)
        })
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create booking");
      }

      toast({
        title: "Success",
        description: "Payment successful and booking confirmed!",
      });

      setLocation("/dashboard");
    } catch (error) {
      console.error('Payment/Booking error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Payment failed. Please try again.",
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

  if (showTravelerDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold mb-6">Traveler Details</h1>
              <TravelerDetails
                numberOfTravelers={bookingDetails.travelers}
                onSubmit={onTravelerDetailsSubmit}
              />
            </CardContent>
          </Card>
        </div>
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
                  <p>Number of Travelers: {bookingDetails.travelers}</p>
                  <p className="font-semibold mt-2">Price per person: ${bookingDetails.price}</p>
                  <p className="font-semibold">Total price: ${bookingDetails.price * bookingDetails.travelers}</p>
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

            {!showPayment ? (
              <Form {...bookingForm}>
                <form onSubmit={bookingForm.handleSubmit(onBookingSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={bookingForm.control}
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
                      control={bookingForm.control}
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
                    control={bookingForm.control}
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
                    control={bookingForm.control}
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

                  <Button type="submit" className="w-full">
                    {bookingDetails.travelers > 1 ? "Add Traveler Details" : "Proceed to Payment"}
                  </Button>
                </form>
              </Form>
            ) : (
              <PaymentForm 
                amount={bookingDetails.price * bookingDetails.travelers}
                totalTravelers={bookingDetails.travelers}
                onSubmit={onPaymentSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}