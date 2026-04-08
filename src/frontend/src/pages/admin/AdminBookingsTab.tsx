import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Booking } from "../../backend.d.ts";
import {
  useGetAllBookings,
  useUpdateBookingStatus,
} from "../../hooks/useQueries";

type BookingStatus = "all" | "pending" | "confirmed" | "cancelled";

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: "all", label: "All Bookings" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

function statusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge
          className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700 font-sans text-xs font-semibold"
          variant="outline"
        >
          Pending
        </Badge>
      );
    case "confirmed":
      return (
        <Badge
          className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700 font-sans text-xs font-semibold"
          variant="outline"
        >
          Confirmed
        </Badge>
      );
    case "cancelled":
      return (
        <Badge
          className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700 font-sans text-xs font-semibold"
          variant="outline"
        >
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="font-sans text-xs">
          {status}
        </Badge>
      );
  }
}

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const NEXT_STATUSES: Record<string, { value: string; label: string }[]> = {
  pending: [
    { value: "confirmed", label: "Confirm" },
    { value: "cancelled", label: "Cancel" },
  ],
  confirmed: [
    { value: "cancelled", label: "Cancel" },
    { value: "pending", label: "Reset to Pending" },
  ],
  cancelled: [{ value: "pending", label: "Restore to Pending" }],
};

function BookingRow({ booking }: { booking: Booking }) {
  const [expanded, setExpanded] = useState(false);
  const updateStatus = useUpdateBookingStatus();

  async function handleStatus(status: string) {
    try {
      await updateStatus.mutateAsync({ id: booking.id, status });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  }

  const nextStatuses = NEXT_STATUSES[booking.status] ?? [];

  return (
    <div
      className="bg-card border border-border rounded-lg overflow-hidden"
      data-ocid={`admin.booking.row.${booking.id}`}
    >
      {/* Summary row */}
      <button
        type="button"
        className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((p) => !p)}
        data-ocid={`admin.booking.expand.${booking.id}`}
      >
        <span className="text-muted-foreground shrink-0">
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 sm:gap-3 items-center">
          <div className="min-w-0">
            <p className="font-sans text-sm font-semibold text-foreground truncate">
              {booking.name}
            </p>
            <p className="font-sans text-xs text-muted-foreground truncate">
              {booking.email}
            </p>
          </div>
          <div className="min-w-0 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="font-sans text-xs text-foreground">
              {booking.date}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-sans text-xs text-foreground">
              {booking.timeSlot}
            </p>
            <p className="font-sans text-xs text-muted-foreground">
              {booking.courtType}
            </p>
          </div>
          <div className="font-sans text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(booking.createdAt)}
          </div>
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {statusBadge(booking.status)}
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 bg-muted/20">
          {booking.notes && (
            <>
              <p className="font-sans text-sm text-muted-foreground mb-1 font-medium">
                Notes
              </p>
              <p className="font-sans text-sm text-foreground leading-relaxed mb-4 whitespace-pre-wrap">
                {booking.notes}
              </p>
            </>
          )}
          {nextStatuses.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((ns) => (
                <Button
                  key={ns.value}
                  size="sm"
                  variant="outline"
                  disabled={updateStatus.isPending}
                  onClick={() => handleStatus(ns.value)}
                  className="font-sans text-xs"
                  data-ocid={`admin.booking.status.${ns.value}.${booking.id}`}
                >
                  {ns.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminBookingsTab() {
  const { data: bookings, isLoading } = useGetAllBookings();
  const [filter, setFilter] = useState<BookingStatus>("all");

  const sorted = [...(bookings ?? [])].sort((a, b) =>
    Number(b.createdAt - a.createdAt),
  );

  const filtered =
    filter === "all" ? sorted : sorted.filter((b) => b.status === filter);

  const counts = (bookings ?? []).reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground mb-1">
            Court Bookings
          </h3>
          <p className="font-sans text-sm text-muted-foreground">
            {bookings?.length ?? 0} total · {counts.pending ?? 0} pending
          </p>
        </div>
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v as BookingStatus)}
        >
          <SelectTrigger
            className="w-44 font-sans text-sm"
            data-ocid="admin.bookings.filter"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="font-sans text-sm"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="admin.bookings.loading_state">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground font-sans text-sm border border-dashed border-border rounded-lg"
          data-ocid="admin.bookings.empty_state"
        >
          {filter === "all" ? "No bookings yet." : `No ${filter} bookings.`}
        </div>
      ) : (
        <div className="space-y-2" data-ocid="admin.bookings.list">
          {filtered.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
