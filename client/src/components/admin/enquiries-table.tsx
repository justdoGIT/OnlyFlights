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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Loader2 } from "lucide-react";

interface Enquiry {
  id: number;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
}

// Memoized enquiry row component
const EnquiryRow = memo(({ 
  enquiry, 
  onUpdateStatus,
  onViewDetails 
}: { 
  enquiry: Enquiry;
  onUpdateStatus: (id: number, status: string) => Promise<void>;
  onViewDetails: (enquiry: Enquiry) => void;
}) => (
  <TableRow>
    <TableCell>{enquiry.id}</TableCell>
    <TableCell>{enquiry.name}</TableCell>
    <TableCell>{enquiry.email}</TableCell>
    <TableCell>
      <span className={`px-2 py-1 rounded-full text-xs ${
        enquiry.status === "resolved" ? "bg-green-100 text-green-800" :
        enquiry.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
        "bg-blue-100 text-blue-800"
      }`}>
        {enquiry.status}
      </span>
    </TableCell>
    <TableCell>{new Date(enquiry.createdAt).toLocaleDateString()}</TableCell>
    <TableCell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onViewDetails(enquiry)}>
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateStatus(enquiry.id, "in_progress")}>
            Mark In Progress
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateStatus(enquiry.id, "resolved")}>
            Mark Resolved
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
));

interface EnquiriesResponse {
  enquiries: Enquiry[];
  hasMore: boolean;
}

export function EnquiriesTable() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const limit = 10;

  const { data, isLoading, refetch } = useQuery<EnquiriesResponse>({
    queryKey: ["/api/admin/enquiries", page],
    queryFn: async () => {
      const response = await fetch(`/api/admin/enquiries?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch enquiries");
      return response.json();
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    keepPreviousData: true // Keep old data while fetching new data
  });

  const updateEnquiryStatus = useCallback(async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error("Failed to update enquiry status");

      toast({
        title: "Success",
        description: "Enquiry status updated successfully"
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update enquiry status",
        variant: "destructive"
      });
    }
  }, [toast, refetch]);

  const handleViewDetails = useCallback((enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.enquiries.map((enquiry) => (
            <EnquiryRow 
              key={enquiry.id}
              enquiry={enquiry}
              onUpdateStatus={updateEnquiryStatus}
              onViewDetails={handleViewDetails}
            />
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

      <Dialog open={!!selectedEnquiry} onOpenChange={() => setSelectedEnquiry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-semibold">Message</h3>
                  <p className="mt-1">{selectedEnquiry?.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Name</h3>
                    <p className="mt-1">{selectedEnquiry?.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="mt-1">{selectedEnquiry?.email}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Status</h3>
                  <p className="mt-1 capitalize">{selectedEnquiry?.status}</p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default memo(EnquiriesTable);