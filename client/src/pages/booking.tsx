import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { TravelerDetails } from "@/components/traveler-details";
import { PaymentForm } from "@/components/payment-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Booking() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({});

  const handleBookingSubmit = async () => {
    try {
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
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        {step === 1 && (
          <TravelerDetails
            onSubmit={(data) => {
              setBookingData({ ...bookingData, ...data });
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <PaymentForm
            onSubmit={(data) => {
              setBookingData({ ...bookingData, ...data });
              handleBookingSubmit();
            }}
          />
        )}
      </Card>
    </div>
  );
}