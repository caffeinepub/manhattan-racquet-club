import { Skeleton } from "@/components/ui/skeleton";
import { useGetActivityLog } from "../../hooks/useQueries";

function formatTimestamp(ts: bigint): string {
  const date = new Date(Number(ts) / 1_000_000);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminActivityLogTab() {
  const { data: entries, isLoading } = useGetActivityLog(BigInt(50));

  // Already newest-first from backend, but sort defensively
  const sorted = [...(entries ?? [])].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  return (
    <div>
      <div className="mb-6">
        <h3 className="font-display text-xl font-bold text-foreground mb-1">
          Activity Log
        </h3>
        <p className="font-sans text-sm text-muted-foreground">
          Last 50 admin actions across the dashboard.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.activity.loading_state">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground font-sans text-sm border border-dashed border-border rounded-lg"
          data-ocid="admin.activity.empty_state"
        >
          No activity recorded yet.
        </div>
      ) : (
        <div
          className="rounded-lg border border-border overflow-hidden"
          data-ocid="admin.activity.log"
        >
          {/* Header */}
          <div className="grid grid-cols-[160px_1fr_1fr_2fr] gap-4 px-4 py-2.5 bg-muted/50 border-b border-border">
            <span className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Time
            </span>
            <span className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Admin
            </span>
            <span className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Action
            </span>
            <span className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Details
            </span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {sorted.map((entry, i) => (
              <div
                key={entry.id}
                className="grid grid-cols-[160px_1fr_1fr_2fr] gap-4 px-4 py-3 hover:bg-muted/20 transition-colors"
                data-ocid={`admin.activity.row.${i + 1}`}
              >
                <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {formatTimestamp(entry.timestamp)}
                </span>
                <span className="font-sans text-sm text-foreground truncate">
                  {entry.adminName || `${entry.principalText.slice(0, 12)}…`}
                </span>
                <span className="font-sans text-sm text-foreground font-medium truncate">
                  {entry.action}
                </span>
                <span className="font-sans text-sm text-muted-foreground truncate">
                  {entry.details}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
