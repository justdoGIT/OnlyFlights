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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const travelerSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
  lastName: z.string()
    .min(1, "Last name is required")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
  dateOfBirth: z.string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const minAge = new Date();
      minAge.setFullYear(today.getFullYear() - 2); // Minimum age of 2 years
      const maxAge = new Date();
      maxAge.setFullYear(today.getFullYear() - 120); // Maximum age of 120 years
      return birthDate <= minAge && birthDate >= maxAge;
    }, "Invalid date of birth. Traveler must be between 2 and 120 years old"),
  passportNumber: z.string()
    .min(1, "Passport number is required")
    .regex(/^[A-Z0-9]+$/, "Passport number must contain only uppercase letters and numbers")
    .min(6, "Passport number must be at least 6 characters")
    .max(15, "Passport number must not exceed 15 characters"),
});

const travelersFormSchema = z.object({
  travelers: z.array(travelerSchema)
});

type TravelerForm = z.infer<typeof travelersFormSchema>;

interface TravelerDetailsProps {
  numberOfTravelers: number;
  onSubmit: (data: TravelerForm) => void;
}

export function TravelerDetails({ numberOfTravelers, onSubmit }: TravelerDetailsProps) {
  const form = useForm<TravelerForm>({
    resolver: zodResolver(travelersFormSchema),
    defaultValues: {
      travelers: Array(numberOfTravelers).fill({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        passportNumber: ""
      })
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {Array.from({ length: numberOfTravelers }).map((_, index) => (
          <Card key={index} className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {index === 0 ? "Main Traveler" : `Additional Traveler ${index + 1}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`travelers.${index}.firstName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name (as in passport)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="John"
                          autoCapitalize="words"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`travelers.${index}.lastName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name (as in passport)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="Doe"
                          autoCapitalize="words"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`travelers.${index}.dateOfBirth`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`travelers.${index}.passportNumber`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passport Number</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="AB1234567"
                          autoCapitalize="characters"
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}
        <Button type="submit" className="w-full">
          Continue to Payment
        </Button>

        <p className="text-sm text-gray-500 text-center mt-2">
          Please ensure all details match your travel documents exactly
        </p>
      </form>
    </Form>
  );
}