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
import { Loader2, CreditCard } from "lucide-react";

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be 16 digits").max(16),
  expiryDate: z.string().min(5, "Invalid expiry date").max(5),
  cvv: z.string().min(3, "CVV must be 3 digits").max(3),
});

const bookingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
});

type BookingData = z.infer<typeof bookingSchema>;
type PaymentData = z.infer<typeof paymentSchema>;

export default function BookingPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const storedDetails = sessionStorage.getItem('bookingDetails');
    if (storedDetails) {
      try {
        const details = JSON.parse(storedDetails);
        setBookingDetails(details);
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

  const paymentForm = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const processPayment = async (paymentData: PaymentData) => {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock validation - accept only if card number ends with '4242'
    if (!paymentData.cardNumber.endsWith('4242')) {
      throw new Error('Payment failed. Use a card number ending in 4242 for testing.');
    }

    return true;
  };

  const onBookingSubmit = async (data: BookingData) => {
    setShowPayment(true);
  };

  const onPaymentSubmit = async (paymentData: PaymentData) => {
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
      // Process payment first
      await processPayment(paymentData);

      // If payment successful, create booking
      const bookingData = {
        ...bookingForm.getValues(),
        userId: user?.id,
        type: bookingDetails.type,
        itemId: bookingDetails.id || 1,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        totalPrice: String(bookingDetails.price),
        status: "confirmed",
        details: JSON.stringify({
          ...bookingDetails,
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
                    Proceed to Payment
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...paymentForm}>
                <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
                  <div className="flex items-center gap-2 text-primary mb-4">
                    <CreditCard className="h-5 w-5" />
                    <h2 className="font-semibold">Payment Details</h2>
                  </div>

                  <FormField
                    control={paymentForm.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 16))}
                            placeholder="1234 5678 9012 4242"
                            maxLength={16}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={paymentForm.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              value={field.value}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length >= 2) {
                                  value = value.slice(0, 2) + '/' + value.slice(2);
                                }
                                field.onChange(value.slice(0, 5));
                              }}
                              placeholder="MM/YY"
                              maxLength={5}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentForm.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVV</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 3))}
                              type="password"
                              placeholder="123"
                              maxLength={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Pay $${bookingDetails.price}`
                    )}
                  </Button>

                  <p className="text-sm text-gray-500 text-center mt-4">
                    For testing, use a card number ending in 4242
                  </p>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}