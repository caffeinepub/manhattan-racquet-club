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
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Enquiry } from "../../backend.d.ts";
import {
  useGetAllEnquiries,
  useUpdateEnquiryStatus,
} from "../../hooks/useQueries";

type EnquiryStatus = "pending" | "contacted" | "resolved" | "archived" | "all";

const STATUS_OPTIONS: { value: EnquiryStatus; label: string }[] = [
  { value: "all", label: "All Enquiries" },
  { value: "pending", label: "Pending" },
  { value: "contacted", label: "Contacted" },
  { value: "resolved", label: "Resolved" },
  { value: "archived", label: "Archived" },
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
    case "contacted":
      return (
        <Badge
          className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700 font-sans text-xs font-semibold"
          variant="outline"
        >
          Contacted
        </Badge>
      );
    case "resolved":
      return (
        <Badge
          className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700 font-sans text-xs font-semibold"
          variant="outline"
        >
          Resolved
        </Badge>
      );
    case "archived":
      return (
        <Badge
          className="bg-secondary text-muted-foreground font-sans text-xs font-semibold"
          variant="secondary"
        >
          Archived
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
    { value: "contacted", label: "Mark Contacted" },
    { value: "resolved", label: "Mark Resolved" },
    { value: "archived", label: "Archive" },
  ],
  contacted: [
    { value: "resolved", label: "Mark Resolved" },
    { value: "archived", label: "Archive" },
    { value: "pending", label: "Reset to Pending" },
  ],
  resolved: [
    { value: "archived", label: "Archive" },
    { value: "pending", label: "Reset to Pending" },
  ],
  archived: [{ value: "pending", label: "Restore to Pending" }],
};

function EnquiryRow({ enquiry }: { enquiry: Enquiry }) {
  const [expanded, setExpanded] = useState(false);
  const updateStatus = useUpdateEnquiryStatus();

  async function handleStatus(status: string) {
    try {
      await updateStatus.mutateAsync({ id: enquiry.id, status });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  }

  const nextStatuses = NEXT_STATUSES[enquiry.status] ?? [];

  return (
    <div
      className="bg-card border border-border rounded-lg overflow-hidden"
      data-ocid={`admin.enquiry.row.${enquiry.id}`}
    >
      {/* Summary row */}
      <button
        type="button"
        className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((p) => !p)}
        data-ocid={`admin.enquiry.expand.${enquiry.id}`}
      >
        <span className="text-muted-foreground shrink-0">
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 sm:gap-4 items-center">
          <div className="min-w-0">
            <p className="font-sans text-sm font-semibold text-foreground truncate">
              {enquiry.name}
            </p>
            <p className="font-sans text-xs text-muted-foreground truncate">
              {enquiry.email}
            </p>
          </div>
          <div className="min-w-0">
            <p className="font-sans text-xs text-muted-foreground truncate">
              {enquiry.phone || "—"}
            </p>
            <p className="font-sans text-xs text-muted-foreground/70">
              {enquiry.tierId || "No tier"}
            </p>
          </div>
          <div className="font-sans text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(enquiry.createdAt)}
          </div>
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {statusBadge(enquiry.status)}
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 bg-muted/20">
          <p className="font-sans text-sm text-muted-foreground mb-1 font-medium">
            Message
          </p>
          <p className="font-sans text-sm text-foreground leading-relaxed mb-4 whitespace-pre-wrap">
            {enquiry.message || "No message provided."}
          </p>
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
                  data-ocid={`admin.enquiry.status.${ns.value}.${enquiry.id}`}
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

export default function AdminEnquiriesTab() {
  const { data: enquiries, isLoading } = useGetAllEnquiries();
  const [filter, setFilter] = useState<EnquiryStatus>("all");

  const sorted = [...(enquiries ?? [])].sort((a, b) =>
    Number(b.createdAt - a.createdAt),
  );

  const filtered =
    filter === "all" ? sorted : sorted.filter((e) => e.status === filter);

  const counts = (enquiries ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground mb-1">
            Membership Enquiries
          </h3>
          <p className="font-sans text-sm text-muted-foreground">
            {enquiries?.length ?? 0} total · {counts.pending ?? 0} pending
          </p>
        </div>
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v as EnquiryStatus)}
        >
          <SelectTrigger
            className="w-44 font-sans text-sm"
            data-ocid="admin.enquiries.filter"
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
        <div className="space-y-3" data-ocid="admin.enquiries.loading_state">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground font-sans text-sm border border-dashed border-border rounded-lg"
          data-ocid="admin.enquiries.empty_state"
        >
          {filter === "all" ? "No enquiries yet." : `No ${filter} enquiries.`}
        </div>
      ) : (
        <div className="space-y-2" data-ocid="admin.enquiries.list">
          {filtered.map((enquiry) => (
            <EnquiryRow key={enquiry.id} enquiry={enquiry} />
          ))}
        </div>
      )}
    </div>
  );
}
