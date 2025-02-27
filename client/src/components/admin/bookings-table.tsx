import { useState, useCallback, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Loader2 } from "lucide-react";

interface Booking {
  id: number;
  firstName: string;
  lastName: string;
  type: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  details: string;
}

export function BookingsTable() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, refetch } = useQuery<{ bookings: Booking[], hasMore: boolean }>({
    queryKey: ['/api/admin/bookings', page],
    queryFn: async () => {
      const response = await fetch(`/api/admin/bookings?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    }
  });

  const updateBookingStatus = useCallback(async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error();

      toast({
        title: "Success",
        description: "Booking status updated successfully"
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  }, [toast, refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>{booking.id}</TableCell>
              <TableCell>{booking.firstName} {booking.lastName}</TableCell>
              <TableCell className="capitalize">{booking.type}</TableCell>
              <TableCell>${booking.totalPrice}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                  booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {booking.status}
                </span>
              </TableCell>
              <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => updateBookingStatus(booking.id, "confirmed")}
                    >
                      Mark as Confirmed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateBookingStatus(booking.id, "cancelled")}
                    >
                      Cancel Booking
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => setPage(p => p + 1)}
          disabled={!data?.hasMore}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default memo(BookingsTable);