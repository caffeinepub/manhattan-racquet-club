import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";
import { Helmet } from "react-helmet-async";
import { useImageUrl } from "../hooks/useImageUrl";
import { useAllMembershipTiers, useContentByKey } from "../hooks/useQueries";

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

export default function MembershipPage() {
  const intro = useContentByKey("membership_intro");
  const { data: tiers, isLoading: tiersLoading } = useAllMembershipTiers();
  const membershipBannerUrl = useImageUrl(
    "img_membership_banner",
    "/assets/generated/hero-membership.dim_1400x600.jpg",
  );

  const seoTitle = useContentByKey("page_seo_title_membership");
  const seoDesc = useContentByKey("page_seo_desc_membership");

  const sortedTiers = [...(tiers ?? [])].sort(
    (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
  );

  // Mark the middle tier as featured
  const featuredIndex = sortedTiers.length > 1 ? 1 : 0;

  return (
    <div className="overflow-x-hidden">
      <Helmet>
        <title>{seoTitle.data || "Membership | Manhattan Racquet Club"}</title>
        <meta
          name="description"
          content={
            seoDesc.data ||
            "Explore membership options at the Manhattan Racquet Club. Junior, Adult, and Family plans with access to world-class courts, coaching, and club facilities."
          }
        />
        <meta
          property="og:title"
          content={seoTitle.data || "Membership | Manhattan Racquet Club"}
        />
        <meta
          property="og:description"
          content={
            seoDesc.data ||
            "Explore membership options at the Manhattan Racquet Club. Junior, Adult, and Family plans with access to world-class courts, coaching, and club facilities."
          }
        />
      </Helmet>
      {/* ─── Hero Banner ───────────────────────────────────────── */}
      <section
        className="relative py-24 overflow-hidden"
        data-ocid="membership.page"
      >
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src={membershipBannerUrl}
            alt="Manhattan Racquet Club membership"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/90" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionLabel text="Join the Club" />
            <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold text-primary-foreground leading-tight max-w-2xl">
              Choose Your Membership
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ─── Intro ─────────────────────────────────────────────── */}
      <section
        className="py-16 bg-background"
        data-ocid="membership.intro.section"
      >
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {intro.isLoading ? (
              <div
                className="space-y-2"
                data-ocid="membership.intro.loading_state"
              >
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : (
              <p className="font-serif text-xl text-muted-foreground leading-relaxed text-center">
                {intro.data ||
                  "Membership at the Manhattan Racquet Club opens the door to unparalleled access to our courts, coaching staff, facilities, and a community of over 800 tennis enthusiasts. Choose the plan that fits your lifestyle."}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── Tier Cards ────────────────────────────────────────── */}
      <section
        className="py-16 bg-secondary court-texture"
        data-ocid="membership.tiers.section"
      >
        <div className="container mx-auto px-6">
          {tiersLoading ? (
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
              data-ocid="membership.tiers.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : sortedTiers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
              {sortedTiers.map((tier, i) => {
                const isFeatured = i === featuredIndex;
                return (
                  <motion.div
                    key={tier.id.toString()}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`rounded-lg border p-7 shadow-club relative flex flex-col ${
                      isFeatured
                        ? "bg-primary text-primary-foreground border-primary ring-2 ring-accent ring-offset-2 ring-offset-secondary"
                        : "bg-card border-border text-card-foreground"
                    }`}
                    data-ocid={`membership.tier.card.${i + 1}`}
                  >
                    {isFeatured && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground font-sans font-semibold text-xs px-3 py-1 shadow-gold">
                        Most Popular
                      </Badge>
                    )}

                    <div className="mb-5">
                      <h3
                        className={`font-display font-bold text-xl mb-1 ${
                          isFeatured
                            ? "text-primary-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {tier.name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`font-display text-3xl font-black ${
                            isFeatured ? "text-accent" : "text-accent"
                          }`}
                        >
                          {tier.price}
                        </span>
                        <span
                          className={`font-sans text-sm ${
                            isFeatured
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground"
                          }`}
                        >
                          /year
                        </span>
                      </div>
                    </div>

                    <ul className="flex-1 space-y-2.5 mb-7">
                      {tier.benefits.map((benefit) => (
                        <li
                          key={benefit}
                          className={`flex items-start gap-2.5 font-sans text-sm ${
                            isFeatured
                              ? "text-primary-foreground/90"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Check
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isFeatured ? "text-accent" : "text-accent"
                            }`}
                          />
                          {benefit}
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      className={
                        isFeatured
                          ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold font-sans font-semibold"
                          : "bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
                      }
                      data-ocid={`membership.tier.join.button.${i + 1}`}
                    >
                      <Link to="/contact">
                        Join Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div
              className="text-center py-16 text-muted-foreground font-sans text-sm"
              data-ocid="membership.tiers.empty_state"
            >
              Membership information coming soon.
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────── */}
      <section
        className="py-20 bg-background"
        data-ocid="membership.cta.section"
      >
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Questions About Membership?
            </h2>
            <p className="font-sans text-muted-foreground mb-7 leading-relaxed">
              Our membership team is ready to help you find the perfect plan.
              Reach out and we'll schedule a tour of our facilities.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
              data-ocid="membership.contact.primary_button"
            >
              <Link to="/contact">
                Get in Touch <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
