import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useAllStaffMembers, useContentByKey } from "../hooks/useQueries";

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

export default function AboutPage() {
  const history = useContentByKey("about_history");
  const mission = useContentByKey("about_mission");
  const { data: staff, isLoading: staffLoading } = useAllStaffMembers();

  const sortedStaff = [...(staff ?? [])].sort(
    (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
  );

  return (
    <div className="overflow-x-hidden">
      {/* ─── Hero Banner ───────────────────────────────────────── */}
      <section
        className="bg-primary py-24 relative overflow-hidden"
        data-ocid="about.page"
      >
        <div className="absolute inset-0 court-texture opacity-30" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionLabel text="Our Story" />
            <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold text-primary-foreground leading-tight max-w-2xl">
              A Club Built on Passion & Precision
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ─── History ───────────────────────────────────────────── */}
      <section
        className="py-20 bg-background"
        data-ocid="about.history.section"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12">
            <motion.div
              className="md:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionLabel text="History" />
              <h2 className="font-display text-3xl font-bold text-foreground leading-tight">
                Over a Century in New York
              </h2>
              <div className="mt-6 flex gap-6">
                <div>
                  <div className="font-display text-3xl font-black text-accent">
                    1923
                  </div>
                  <div className="font-sans text-xs text-muted-foreground">
                    Founded
                  </div>
                </div>
                <div>
                  <div className="font-display text-3xl font-black text-accent">
                    10
                  </div>
                  <div className="font-sans text-xs text-muted-foreground">
                    Courts
                  </div>
                </div>
                <div>
                  <div className="font-display text-3xl font-black text-accent">
                    800+
                  </div>
                  <div className="font-sans text-xs text-muted-foreground">
                    Members
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="md:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {history.isLoading ? (
                <div
                  className="space-y-3"
                  data-ocid="about.history.loading_state"
                >
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <p className="font-serif text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                  {history.data ||
                    "The Manhattan Racquet Club was founded in 1923 by a group of tennis enthusiasts who wanted to bring world-class court culture to the heart of New York City. Over the decades, our storied halls have welcomed legends of the sport, nurtured rising stars, and provided generations of New Yorkers with an unmatched athletic home. From our original two clay courts on East 47th Street to our modern ten-court complex on Park Avenue South, MRC has grown with the city while preserving the timeless traditions that make it special."}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Mission ───────────────────────────────────────────── */}
      <section
        className="py-20 bg-secondary court-texture"
        data-ocid="about.mission.section"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionLabel text="Our Mission" />
              {mission.isLoading ? (
                <div
                  className="space-y-3 mt-4"
                  data-ocid="about.mission.loading_state"
                >
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6 mx-auto" />
                </div>
              ) : (
                <p className="font-display text-2xl md:text-3xl text-foreground leading-relaxed font-medium">
                  &ldquo;
                  {mission.data ||
                    "To nurture excellence in tennis while cultivating a community where every member, regardless of skill level, finds camaraderie, challenge, and a true home in the city."}
                  &rdquo;
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Staff ─────────────────────────────────────────────── */}
      <section className="py-20 bg-background" data-ocid="about.staff.section">
        <div className="container mx-auto px-6">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <SectionLabel text="Our Team" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Coaching Staff
            </h2>
          </motion.div>

          {staffLoading ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              data-ocid="about.staff.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-52 rounded-lg" />
              ))}
            </div>
          ) : sortedStaff.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedStaff.map((member, i) => (
                <motion.article
                  key={member.id.toString()}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-card border border-border rounded-lg p-6 shadow-club"
                  data-ocid={`about.staff.card.${i + 1}`}
                >
                  {/* Initials avatar */}
                  <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center mb-4">
                    <span className="font-display font-bold text-primary text-lg">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-foreground text-lg leading-tight">
                    {member.name}
                  </h3>
                  <p className="font-sans text-xs font-semibold text-accent uppercase tracking-wider mt-1 mb-3">
                    {member.role}
                  </p>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>
                </motion.article>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-16 text-muted-foreground font-sans text-sm"
              data-ocid="about.staff.empty_state"
            >
              Staff information coming soon.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
