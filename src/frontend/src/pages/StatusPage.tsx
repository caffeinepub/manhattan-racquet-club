import { motion } from "motion/react";
import { useHasAnyAdmin } from "../hooks/useQueries";

const appVersion: string =
  (import.meta.env.VITE_APP_VERSION as string | undefined) ||
  (import.meta.env.VITE_CAFFEINE_DRAFT_VERSION as string | undefined) ||
  (import.meta.env.CAFFEINE_DRAFT_VERSION as string | undefined) ||
  "Unknown";

const environment: string =
  (import.meta.env.VITE_DFX_NETWORK as string | undefined) === "ic" ||
  (import.meta.env.DFX_NETWORK as string | undefined) === "ic"
    ? "Production"
    : "Preview";

interface StatusRowProps {
  label: string;
  value: string;
  indicator?: "online" | "offline" | "neutral";
  loading?: boolean;
  ocid: string;
}

function StatusRow({ label, value, indicator, loading, ocid }: StatusRowProps) {
  const dotColor =
    indicator === "online"
      ? "bg-green-500"
      : indicator === "offline"
        ? "bg-red-500"
        : "bg-muted-foreground/40";

  const valueColor =
    indicator === "online"
      ? "text-green-500"
      : indicator === "offline"
        ? "text-red-400"
        : "text-foreground";

  return (
    <div
      className="flex items-center justify-between py-5 border-b border-border last:border-0"
      data-ocid={ocid}
    >
      <span className="font-sans text-sm font-medium text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      <div className="flex items-center gap-2.5">
        {indicator && !loading && (
          <span
            className={`w-2 h-2 rounded-full ${dotColor}`}
            aria-hidden="true"
          />
        )}
        {loading ? (
          <span className="font-sans text-sm text-muted-foreground animate-pulse">
            Checking…
          </span>
        ) : (
          <span className={`font-sans text-sm font-semibold ${valueColor}`}>
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

export default function StatusPage() {
  const { data: hasAdmin, isLoading: backendLoading } = useHasAnyAdmin();

  const backendOnline = !backendLoading && hasAdmin !== undefined;

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="status.page"
    >
      {/* ─── Header ───────────────────────────────────────────────── */}
      <div className="bg-secondary court-texture border-b border-border">
        <div className="container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-6 h-px bg-accent" />
              <span className="font-sans text-xs font-semibold tracking-[0.18em] text-accent uppercase">
                Manhattan Racquet Club
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              System Status
            </h1>
            <p className="font-sans text-sm text-muted-foreground mt-2">
              Current health and deployment information.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─── Status Panel ─────────────────────────────────────────── */}
      <div className="flex-1 py-16">
        <div className="container mx-auto px-6 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card border border-border rounded-lg shadow-club overflow-hidden"
          >
            <div className="px-7 py-5 border-b border-border bg-muted/20">
              <h2 className="font-display font-semibold text-foreground text-base">
                Diagnostics
              </h2>
            </div>
            <div className="px-7">
              <StatusRow
                label="Backend Connectivity"
                value={backendOnline ? "Online" : "Offline"}
                indicator={backendOnline ? "online" : "offline"}
                loading={backendLoading}
                ocid="status.backend.row"
              />
              <StatusRow
                label="Version"
                value={appVersion}
                indicator="neutral"
                ocid="status.version.row"
              />
              <StatusRow
                label="Environment"
                value={environment}
                indicator="neutral"
                ocid="status.environment.row"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
