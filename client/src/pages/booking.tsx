import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { TravelerDetails } from "@/components/traveler-details";
import { PaymentForm } from "@/components/payment-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { PaymentFormData } from "@/components/payment-form";
import type { Flight } from "@/types/flight";

interface BookingData {
  type: 'flight';
  itemId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  details: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
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

    const details = JSON.parse(storedDetails);
    if (details.type !== 'flight') {
      navigate('/flights');
      return;
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
        travelers: details.travelers || 1
      }),
      travelers: []
    });
  }, [navigate, user]);

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
        title: "Success",
        description: "Booking confirmed successfully!"
      });
      sessionStorage.removeItem('bookingDetails');
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete booking",
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
      <Card className="max-w-2xl mx-auto">
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
      </Card>
    </div>
  );
}