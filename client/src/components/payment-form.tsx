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
  cardholderName: z.string().min(1, "Cardholder name is required")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  cardNumber: z.string()
    .min(16, "Card number must be 16 digits")
    .max(16)
    .regex(/^[0-9]+$/, "Card number must contain only numbers")
    .refine((num) => {
      // Basic Luhn algorithm check
      const digits = num.split('').map(Number);
      let sum = 0;
      let isEven = false;
      for (let i = digits.length - 1; i >= 0; i--) {
        let d = digits[i];
        if (isEven) {
          d *= 2;
          if (d > 9) d -= 9;
        }
        sum += d;
        isEven = !isEven;
      }
      return sum % 10 === 0;
    }, "Invalid card number"),
  expiryDate: z.string()
    .min(5, "Invalid expiry date")
    .max(5)
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Must be in MM/YY format")
    .refine((date) => {
      const [month, year] = date.split('/').map(Number);
      const now = new Date();
      const expiry = new Date(2000 + year, month - 1);
      return expiry > now;
    }, "Card has expired"),
  cvv: z.string()
    .min(3, "CVV must be 3 digits")
    .max(3)
    .regex(/^[0-9]+$/, "CVV must contain only numbers"),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  amount: number;
  totalTravelers?: number;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function PaymentForm({ amount, totalTravelers = 1, onSubmit, isSubmitting }: PaymentFormProps) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
        <div className="flex items-center gap-2 text-primary mb-4">
          <CreditCard className="h-5 w-5" />
          <h2 className="font-semibold">Payment Details</h2>
        </div>

        <FormField
          control={form.control}
          name="cardholderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cardholder Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="John Doe"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cardNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="4242 4242 4242 4242"
                  maxLength={16}
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  disabled={isSubmitting}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    field.onChange(value);
                  }}
                  value={field.value.replace(/(\d{4})(?=\d)/g, '$1 ')}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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

        {totalTravelers > 1 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
            <p className="text-sm text-gray-600 font-medium">Price breakdown:</p>
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Per traveler:</span>
                <span>${(amount/totalTravelers).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium border-t mt-1 pt-1">
                <span>Total ({totalTravelers} travelers):</span>
                <span>${amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing payment...
            </>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </Button>

        <p className="text-sm text-gray-500 text-center mt-4">
          For testing, use card number 4242 4242 4242 4242 with any future expiry date and CVV
        </p>
      </form>
    </Form>
  );
}