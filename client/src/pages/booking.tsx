import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { TravelerDetails } from "@/components/traveler-details";
import { PaymentForm } from "@/components/payment-form";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaymentFormData } from "@/components/payment-form";
import type { Flight } from "@/types/flight";

interface BookingData {
  type: 'flight';
  itemId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  details: string;
  travelers: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    passportNumber: string;
  }>;
  payment?: PaymentFormData;
}

export default function Booking() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [bookingDetails, setBookingDetails] = useState<Flight | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  useEffect(() => {
    const storedDetails = sessionStorage.getItem('bookingDetails');
    if (!storedDetails) {
      navigate('/flights');
      return;
    }

    try {
      const details = JSON.parse(storedDetails);
      if (details.type !== 'flight') {
        throw new Error('Invalid booking type');
      }

      // Validate required fields
      if (!details.id || !details.from || !details.to || !details.departureTime || 
          !details.arrivalTime || !details.airline || !details.price) {
        throw new Error('Missing required flight details');
      }

      setBookingDetails(details);
      setBookingData({
        type: 'flight',
        itemId: details.id,
        startDate: details.departureTime,
        endDate: details.arrivalTime,
        totalPrice: details.price * (details.travelers || 1),
        status: 'pending',
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phone: '',
        details: JSON.stringify({
          from: details.from,
          to: details.to,
          airline: details.airline,
          departureTime: details.departureTime,
          arrivalTime: details.arrivalTime,
          price: details.price,
          travelers: details.travelers || 1
        }),
        travelers: []
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid booking details. Please try again.",
        variant: "destructive"
      });
      navigate('/flights');
    }
  }, [navigate, user, toast]);

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingData) => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          firstName: data.travelers[0].firstName,
          lastName: data.travelers[0].lastName,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Booking Confirmed",
        description: "Your flight has been booked successfully! Check your email for confirmation details.",
      });
      sessionStorage.removeItem('bookingDetails');
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to complete booking. Please try again.",
        variant: "destructive"
      });
    }
  });

  if (!bookingDetails || !bookingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">
            {bookingDetails.from} → {bookingDetails.to} • {bookingDetails.airline}
          </p>
        </div>

        {step === 1 && (
          <TravelerDetails
            numberOfTravelers={bookingDetails.travelers || 1}
            onSubmit={(data) => {
              setBookingData((prev) => prev ? {
                ...prev,
                travelers: data.travelers,
                firstName: data.travelers[0].firstName,
                lastName: data.travelers[0].lastName
              } : null);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <PaymentForm
            amount={bookingData.totalPrice}
            totalTravelers={bookingData.travelers.length}
            onSubmit={async (paymentData) => {
              if (!bookingData) return;

              const finalBookingData = {
                ...bookingData,
                payment: paymentData
              };
              createBookingMutation.mutate(finalBookingData);
            }}
            isSubmitting={createBookingMutation.isPending}
          />
        )}

        <div className="mt-4 text-sm text-gray-500">
          <p>Need help? Contact our support team</p>
        </div>
      </Card>
    </div>
  );
}