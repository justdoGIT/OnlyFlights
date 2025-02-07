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
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  passportNumber: z.string().min(1, "Passport number is required"),
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
                  name={`travelers.${index}.lastName`}
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
                <FormField
                  control={form.control}
                  name={`travelers.${index}.dateOfBirth`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                        <Input {...field} />
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
      </form>
    </Form>
  );
}