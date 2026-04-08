import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Check, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { MembershipTier } from "../backend.d.ts";
import { useAllMembershipTiers, useSubmitEnquiry } from "../hooks/useQueries";

// ─── Section Label ─────────────────────────────────────────────────────────
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

// ─── Tier Selection Card ───────────────────────────────────────────────────
function TierSelectCard({
  tier,
  selected,
  onSelect,
  index,
}: {
  tier: MembershipTier;
  selected: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      onClick={onSelect}
      data-ocid={`enquiry.tier.select.${index + 1}`}
      className={`w-full text-left rounded-lg border p-5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected
          ? "bg-primary border-primary text-primary-foreground ring-2 ring-accent ring-offset-2 ring-offset-background shadow-lg"
          : "bg-card border-border text-card-foreground hover:border-accent/60 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div
            className={`font-display font-bold text-base mb-1 ${selected ? "text-primary-foreground" : "text-foreground"}`}
          >
            {tier.name}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-black text-accent">
              {tier.price}
            </span>
            <span
              className={`font-sans text-xs ${selected ? "text-primary-foreground/60" : "text-muted-foreground"}`}
            >
              /year
            </span>
          </div>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
            selected ? "border-accent bg-accent" : "border-border bg-background"
          }`}
        >
          {selected && <Check className="w-3 h-3 text-accent-foreground" />}
        </div>
      </div>
      {tier.benefits.slice(0, 3).map((benefit) => (
        <div
          key={benefit}
          className={`flex items-center gap-2 font-sans text-xs mb-1 ${selected ? "text-primary-foreground/80" : "text-muted-foreground"}`}
        >
          <Check className="w-3 h-3 shrink-0 text-accent" />
          <span className="truncate">{benefit}</span>
        </div>
      ))}
      {tier.benefits.length > 3 && (
        <span
          className={`font-sans text-xs mt-1 inline-block ${selected ? "text-primary-foreground/50" : "text-muted-foreground/70"}`}
        >
          +{tier.benefits.length - 3} more benefits
        </span>
      )}
    </motion.button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function MembershipEnquiryPage() {
  // Read `?tier=id` from URL
  const search = useSearch({ strict: false }) as Record<string, string>;
  const preselectedTierId = search.tier ?? "";

  const { data: tiers, isLoading: tiersLoading } = useAllMembershipTiers();
  const submitEnquiry = useSubmitEnquiry();

  const sortedTiers = [...(tiers ?? [])].sort(
    (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
  );

  const [selectedTierId, setSelectedTierId] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Apply preselected tier once tiers load
  useEffect(() => {
    if (preselectedTierId && sortedTiers.length > 0 && !selectedTierId) {
      const found = sortedTiers.find(
        (t) => t.id.toString() === preselectedTierId,
      );
      if (found) setSelectedTierId(found.id.toString());
    }
  }, [preselectedTierId, sortedTiers, selectedTierId]);

  const nameError =
    nameTouched && name.trim().length === 0 ? "Name is required." : "";
  const emailError =
    emailTouched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? "Enter a valid email address."
      : "";

  const canSubmit =
    name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    selectedTierId.length > 0 &&
    !submitEnquiry.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameTouched(true);
    setEmailTouched(true);
    setErrorMsg("");
    if (!canSubmit) return;

    try {
      await submitEnquiry.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        tierId: selectedTierId,
        message: message.trim(),
      });
      setSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setSelectedTierId("");
      setNameTouched(false);
      setEmailTouched(false);
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="overflow-x-hidden">
      {/* ─── Hero Banner ──────────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden bg-primary">
        <div className="absolute inset-0 court-texture opacity-40" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              to="/membership"
              className="inline-flex items-center gap-1.5 font-sans text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-6"
              data-ocid="enquiry.back.link"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Membership
            </Link>
            <SectionLabel text="Join the Club" />
            <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold text-primary-foreground leading-tight max-w-xl">
              Membership Enquiry
            </h1>
            <p className="font-serif text-lg text-primary-foreground/70 mt-3 max-xl leading-relaxed">
              Select your preferred tier and complete the form below. Our
              membership team will be in touch within 48 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Form Section ─────────────────────────────────────────── */}
      <section className="py-16 bg-background" data-ocid="enquiry.form.section">
        <div className="container mx-auto px-6 max-w-5xl">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center text-center py-20"
              data-ocid="enquiry.success.state"
            >
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                Thank you! We will be in touch shortly.
              </h2>
              <p className="font-sans text-muted-foreground mb-8 max-w-md leading-relaxed">
                Your membership enquiry has been received. A member of our team
                will contact you within 48 hours to discuss next steps.
              </p>
              <div className="flex gap-3 flex-wrap justify-center">
                <Button
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                  className="font-sans font-semibold"
                  data-ocid="enquiry.new.button"
                >
                  Submit Another Enquiry
                </Button>
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
                  data-ocid="enquiry.membership.link"
                >
                  <Link to="/membership">View Membership Options</Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
              {/* ── Tier Selection ─────────────────────────── */}
              <div className="lg:col-span-2" data-ocid="enquiry.tiers.section">
                <h2 className="font-display text-lg font-semibold text-foreground mb-1">
                  Select a Tier
                </h2>
                <p className="font-sans text-sm text-muted-foreground mb-5">
                  Choose the membership that suits you best.
                </p>

                {tiersLoading ? (
                  <div
                    className="space-y-3"
                    data-ocid="enquiry.tiers.loading_state"
                  >
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-36 rounded-lg" />
                    ))}
                  </div>
                ) : sortedTiers.length > 0 ? (
                  <div className="space-y-3">
                    {sortedTiers.map((tier, i) => (
                      <TierSelectCard
                        key={tier.id.toString()}
                        tier={tier}
                        index={i}
                        selected={selectedTierId === tier.id.toString()}
                        onSelect={() => setSelectedTierId(tier.id.toString())}
                      />
                    ))}
                  </div>
                ) : (
                  <p
                    className="font-sans text-sm text-muted-foreground"
                    data-ocid="enquiry.tiers.empty_state"
                  >
                    Membership tiers coming soon.
                  </p>
                )}

                <div className="mt-8 pt-6 border-t border-border">
                  <Link
                    to="/membership"
                    className="inline-flex items-center gap-1.5 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-ocid="enquiry.membership.back.link"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    View full membership details
                  </Link>
                </div>
              </div>

              {/* ── Enquiry Form ────────────────────────────── */}
              <div className="lg:col-span-3">
                <h2 className="font-display text-lg font-semibold text-foreground mb-1">
                  Your Details
                </h2>
                <p className="font-sans text-sm text-muted-foreground mb-5">
                  Fields marked * are required.
                </p>

                <Card className="border-border shadow-sm">
                  <CardContent className="pt-6">
                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      className="space-y-5"
                      data-ocid="enquiry.form"
                    >
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="enq-name"
                          className="font-sans text-sm font-medium"
                        >
                          Full Name <span className="text-accent">*</span>
                        </Label>
                        <Input
                          id="enq-name"
                          type="text"
                          autoComplete="name"
                          placeholder="e.g. Alexandra Hartwell"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onBlur={() => setNameTouched(true)}
                          required
                          aria-required="true"
                          aria-describedby={
                            nameError ? "enq-name-error" : undefined
                          }
                          className={nameError ? "border-destructive" : ""}
                          data-ocid="enquiry.name.input"
                        />
                        {nameError && (
                          <p
                            id="enq-name-error"
                            className="font-sans text-xs text-destructive"
                          >
                            {nameError}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="enq-email"
                          className="font-sans text-sm font-medium"
                        >
                          Email Address <span className="text-accent">*</span>
                        </Label>
                        <Input
                          id="enq-email"
                          type="email"
                          autoComplete="email"
                          placeholder="e.g. a.hartwell@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => setEmailTouched(true)}
                          required
                          aria-required="true"
                          aria-describedby={
                            emailError ? "enq-email-error" : undefined
                          }
                          className={emailError ? "border-destructive" : ""}
                          data-ocid="enquiry.email.input"
                        />
                        {emailError && (
                          <p
                            id="enq-email-error"
                            className="font-sans text-xs text-destructive"
                          >
                            {emailError}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="enq-phone"
                          className="font-sans text-sm font-medium"
                        >
                          Phone Number{" "}
                          <span className="font-normal text-muted-foreground">
                            (optional)
                          </span>
                        </Label>
                        <Input
                          id="enq-phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="e.g. +1 (212) 555-0100"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          data-ocid="enquiry.phone.input"
                        />
                      </div>

                      {/* Selected tier indicator */}
                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          Selected Tier <span className="text-accent">*</span>
                        </Label>
                        {selectedTierId ? (
                          (() => {
                            const tier = sortedTiers.find(
                              (t) => t.id.toString() === selectedTierId,
                            );
                            return (
                              <div
                                className="flex items-center gap-2 rounded-md border border-accent/50 bg-accent/10 px-3 py-2"
                                data-ocid="enquiry.tier.selected_badge"
                              >
                                <Check className="w-4 h-4 text-accent shrink-0" />
                                <span className="font-sans text-sm font-semibold text-foreground min-w-0 truncate">
                                  {tier?.name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="ml-auto shrink-0 font-sans font-bold text-accent border-accent/40"
                                >
                                  {tier?.price}/yr
                                </Badge>
                              </div>
                            );
                          })()
                        ) : (
                          <p
                            className="font-sans text-sm text-muted-foreground italic"
                            data-ocid="enquiry.tier.unselected_hint"
                          >
                            Please select a membership tier on the left.
                          </p>
                        )}
                      </div>

                      {/* Message */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="enq-message"
                          className="font-sans text-sm font-medium"
                        >
                          Message{" "}
                          <span className="font-normal text-muted-foreground">
                            (optional)
                          </span>
                        </Label>
                        <Textarea
                          id="enq-message"
                          placeholder="Any questions or additional information about your membership interests…"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={4}
                          className="resize-none"
                          data-ocid="enquiry.message.textarea"
                        />
                      </div>

                      {/* Error */}
                      {errorMsg && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="font-sans text-sm text-destructive"
                          data-ocid="enquiry.error.message"
                        >
                          {errorMsg}
                        </motion.p>
                      )}

                      {/* Submit */}
                      <Button
                        type="submit"
                        size="lg"
                        disabled={submitEnquiry.isPending}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold disabled:opacity-50"
                        data-ocid="enquiry.submit.button"
                      >
                        {submitEnquiry.isPending
                          ? "Submitting…"
                          : "Submit Enquiry"}
                      </Button>

                      <p className="font-sans text-xs text-muted-foreground text-center">
                        By submitting, you agree to be contacted by the
                        Manhattan Racquet Club membership team.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
