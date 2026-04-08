import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Award, Dumbbell, Users } from "lucide-react";
import { motion } from "motion/react";
import { Helmet } from "react-helmet-async";
import { useImageUrl } from "../hooks/useImageUrl";
import {
  useContentByKey,
  usePublishedAnnouncements,
} from "../hooks/useQueries";

// ─── Skeleton helpers ──────────────────────────────────────────────────────
function TextSkeleton({
  lines = 1,
  className = "",
}: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`} data-ocid="landing.loading_state">
      {Array.from({ length: lines }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no stable identity
        <Skeleton key={`line-${i}`} className="h-4 w-full" />
      ))}
    </div>
  );
}

// ─── Feature Cards ─────────────────────────────────────────────────────────
const features = [
  {
    icon: Award,
    title: "World-Class Courts",
    desc: "Eight regulation hard courts and two red clay courts maintained to ATP tour standards, indoors year-round.",
  },
  {
    icon: Dumbbell,
    title: "Expert Coaching",
    desc: "Former ATP and WTA professionals lead our coaching programs for every level, from beginner to competitive.",
  },
  {
    icon: Users,
    title: "Vibrant Community",
    desc: "Over 800 members make MRC a cornerstone of Manhattan's social and athletic life since 1923.",
  },
];

export default function LandingPage() {
  const heroTitle = useContentByKey("landing_hero_title");
  const heroSubtitle = useContentByKey("landing_hero_subtitle");
  const welcomeText = useContentByKey("landing_welcome_text");
  const { data: announcements, isLoading: annsLoading } =
    usePublishedAnnouncements();
  const heroImageUrl = useImageUrl(
    "img_landing_hero",
    "/assets/generated/hero-landing.dim_1600x700.jpg",
  );

  const seoTitle = useContentByKey("page_seo_title_landing");
  const seoDesc = useContentByKey("page_seo_desc_landing");

  return (
    <div className="overflow-x-hidden">
      <Helmet>
        <title>{seoTitle.data || "Home | Manhattan Racquet Club"}</title>
        <meta
          name="description"
          content={
            seoDesc.data ||
            "Welcome to the Manhattan Racquet Club — NYC's premier tennis destination since 1923. World-class courts, expert coaching, and an unmatched community."
          }
        />
        <meta
          property="og:title"
          content={seoTitle.data || "Home | Manhattan Racquet Club"}
        />
        <meta
          property="og:description"
          content={
            seoDesc.data ||
            "Welcome to the Manhattan Racquet Club — NYC's premier tennis destination since 1923. World-class courts, expert coaching, and an unmatched community."
          }
        />
      </Helmet>
      {/* ─── Hero ──────────────────────────────────────────────── */}
      <section
        className="relative min-h-[92vh] flex items-end pb-24 overflow-hidden"
        data-ocid="landing.section"
      >
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImageUrl}
            alt="Manhattan Racquet Club indoor courts"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/40 to-foreground/10" />
        </div>

        {/* Decorative year stamp */}
        <div className="absolute top-24 right-8 md:right-16 z-10 text-right">
          <span className="font-display text-[clamp(3rem,10vw,8rem)] font-black text-white/[0.07] leading-none select-none">
            1923
          </span>
        </div>

        {/* Hero content */}
        <div className="relative z-10 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-8 h-px bg-accent" />
              <span className="font-sans text-xs font-semibold tracking-[0.2em] text-accent uppercase">
                New York City — Est. 1923
              </span>
            </div>

            <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-bold text-white leading-[0.95] mb-6 max-w-3xl">
              {heroTitle.isLoading ? (
                <Skeleton className="h-16 w-2/3 bg-white/20" />
              ) : (
                heroTitle.data || "Where Manhattan Plays Tennis"
              )}
            </h1>

            <p className="font-serif text-[clamp(1rem,2vw,1.25rem)] text-white/75 mb-10 max-w-xl leading-relaxed">
              {heroSubtitle.isLoading ? (
                <TextSkeleton lines={2} className="opacity-50" />
              ) : (
                heroSubtitle.data ||
                "An exclusive athletic club at the heart of the city, offering world-class tennis facilities and a community unlike any other."
              )}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans font-semibold tracking-wide shadow-gold"
                data-ocid="landing.membership.primary_button"
              >
                <Link to="/membership">
                  Explore Membership <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/40 text-white bg-white/10 hover:bg-white/20 font-sans font-medium backdrop-blur-sm"
                data-ocid="landing.about.secondary_button"
              >
                <Link to="/about">About the Club</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Welcome ───────────────────────────────────────────── */}
      <section
        className="py-20 bg-background"
        data-ocid="landing.welcome.section"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-6 h-px bg-accent" />
                <span className="font-sans text-xs font-semibold tracking-[0.18em] text-accent uppercase">
                  Welcome
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight mb-2">
                A Century of Excellence
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {welcomeText.isLoading ? (
                <TextSkeleton lines={4} />
              ) : (
                <p className="font-serif text-lg text-muted-foreground leading-relaxed">
                  {welcomeText.data ||
                    "For over a century, the Manhattan Racquet Club has been the premier destination for tennis in New York City. Our storied courts have welcomed champions, cultivated talent, and forged lasting friendships."}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────── */}
      <section
        className="py-20 court-texture bg-secondary"
        data-ocid="landing.features.section"
      >
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Why MRC?
            </h2>
            <p className="font-sans text-muted-foreground max-w-md mx-auto">
              Everything you need to play at your best, in the city you love.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card border border-border rounded-lg p-7 shadow-club"
                data-ocid={`landing.feature.card.${i + 1}`}
              >
                <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center mb-5">
                  <feat.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {feat.title}
                </h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Announcements ─────────────────────────────────────── */}
      <section
        className="py-20 bg-background"
        data-ocid="landing.announcements.section"
      >
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-6 h-px bg-accent" />
              <span className="font-sans text-xs font-semibold tracking-[0.18em] text-accent uppercase">
                Club News
              </span>
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">
              Announcements
            </h2>
          </motion.div>

          {annsLoading ? (
            <div
              className="space-y-4"
              data-ocid="landing.announcements.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : announcements && announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((ann, i) => (
                <motion.article
                  key={ann.id.toString()}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="border-l-2 border-accent pl-5 py-1"
                  data-ocid={`landing.announcement.item.${i + 1}`}
                >
                  <h3 className="font-display font-semibold text-foreground text-lg mb-1">
                    {ann.title}
                  </h3>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    {ann.body}
                  </p>
                </motion.article>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-12 text-muted-foreground font-sans text-sm"
              data-ocid="landing.announcements.empty_state"
            >
              No announcements at this time.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
