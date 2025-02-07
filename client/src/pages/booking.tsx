import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { TravelerDetails } from "@/components/traveler-details";
import { PaymentForm } from "@/components/payment-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { PaymentFormData } from "@/components/payment-form";

interface BookingData {
  numberOfTravelers: number;
  totalPrice: number;
  payment?: PaymentFormData;
}

export default function Booking() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    numberOfTravelers: 1,
    totalPrice: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBookingSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Success",
        description: "Booking confirmed successfully!"
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete booking",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        {step === 1 && (
          <TravelerDetails
            numberOfTravelers={bookingData.numberOfTravelers}
            onSubmit={(data) => {
              setBookingData({ ...bookingData, ...data });
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <PaymentForm
            amount={bookingData.totalPrice}
            totalTravelers={bookingData.numberOfTravelers}
            onSubmit={async (data) => {
              setBookingData({ ...bookingData, payment: data });
              await handleBookingSubmit();
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </Card>
    </div>
  );
}