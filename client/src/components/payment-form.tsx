import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, CreditCard } from "lucide-react";

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be 16 digits").max(16),
  expiryDate: z.string().min(5, "Invalid expiry date").max(5),
  cvv: z.string().min(3, "CVV must be 3 digits").max(3),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  amount: number;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function PaymentForm({ amount, onSubmit, isSubmitting }: PaymentFormProps) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-2 text-primary mb-4">
          <CreditCard className="h-5 w-5" />
          <h2 className="font-semibold">Payment Details</h2>
        </div>

        <FormField
          control={form.control}
          name="cardNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="1234 5678 9012 4242"
                  maxLength={16}
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    field.onChange(value);
                  }}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="MM/YY"
                    maxLength={5}
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2);
                      }
                      field.onChange(value.slice(0, 5));
                    }}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cvv"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CVV</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="123"
                    maxLength={3}
                    type="password"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                    value={field.value}
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
            `Pay $${amount}`
          )}
        </Button>

        <p className="text-sm text-gray-500 text-center mt-4">
          For testing, use a card number ending in 4242
        </p>
      </form>
    </Form>
  );
}
