import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import type { Announcement } from "../backend.d.ts";
import { usePublishedAnnouncements } from "../hooks/useQueries";

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2 mb-4">
      <span className="w-6 h-px bg-accent" />
      <span className="font-sans text-xs font-semibold tracking-[0.18em] text-accent uppercase">
        {text}
      </span>
    </div>
  );
}

function formatDate(createdAt: bigint): string {
  // createdAt is nanoseconds on IC
  const ms = Number(createdAt) / 1_000_000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 2020) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function AnnouncementCard({
  ann,
  index,
}: { ann: Announcement; index: number }) {
  const dateStr = formatDate(ann.createdAt);
  const isoDate = dateStr
    ? new Date(Number(ann.createdAt) / 1_000_000).toISOString()
    : undefined;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="bg-card border border-border rounded-lg p-7 shadow-club"
      data-ocid={`news.announcement.card.${index + 1}`}
    >
      {dateStr && isoDate && (
        <time
          dateTime={isoDate}
          className="font-sans text-xs font-semibold text-accent uppercase tracking-widest mb-3 block"
        >
          {dateStr}
        </time>
      )}
      <h2 className="font-display font-bold text-foreground text-xl leading-snug mb-3">
        {ann.title}
      </h2>
      <p className="font-sans text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {ann.body}
      </p>
    </motion.article>
  );
}

export default function NewsPage() {
  const { data: announcements, isLoading } = usePublishedAnnouncements();

  const sorted = [...(announcements ?? [])].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  return (
    <div className="overflow-x-hidden">
      {/* ─── Page Header ───────────────────────────────────────── */}
      <section
        className="py-20 bg-secondary court-texture"
        data-ocid="news.page"
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionLabel text="Club Updates" />
            <h1 className="font-display text-[clamp(2.2rem,5vw,4rem)] font-bold text-foreground leading-tight">
              News &amp; Announcements
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ─── Announcements List ─────────────────────────────────── */}
      <section className="py-20 bg-background" data-ocid="news.list.section">
        <div className="container mx-auto px-6 max-w-4xl">
          {isLoading ? (
            <div className="space-y-5" data-ocid="news.loading_state">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-36 w-full rounded-lg" />
              ))}
            </div>
          ) : sorted.length > 0 ? (
            <div className="space-y-5">
              {sorted.map((ann, i) => (
                <AnnouncementCard key={ann.id.toString()} ann={ann} index={i} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-24"
              data-ocid="news.empty_state"
            >
              <div className="w-12 h-px bg-accent mx-auto mb-6" />
              <p className="font-display text-xl text-muted-foreground">
                No announcements at this time.
              </p>
              <p className="font-sans text-sm text-muted-foreground/60 mt-2">
                Check back soon for club news and updates.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
