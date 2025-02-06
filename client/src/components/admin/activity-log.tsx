import { useState } from "react";
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
import type { AdminLogEntry } from "@shared/types/admin";

interface LogResponse {
  logs: AdminLogEntry[];
  hasMore: boolean;
}

export function AdminActivityLog() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery<LogResponse>({
    queryKey: ["/api/admin/logs", page],
    queryFn: async () => {
      const response = await fetch(`/api/admin/logs?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch activity logs");
      return response.json();
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Admin</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity Type</TableHead>
            <TableHead>Entity ID</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.adminId}</TableCell>
              <TableCell className="capitalize">{log.action.replace(/_/g, " ")}</TableCell>
              <TableCell className="capitalize">{log.entityType}</TableCell>
              <TableCell>{log.entityId}</TableCell>
              <TableCell>
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(JSON.parse(log.details), null, 2)}
                </pre>
              </TableCell>
              <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
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