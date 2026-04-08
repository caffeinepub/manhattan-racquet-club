import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Info } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useSubmitBooking } from "../hooks/useQueries";

type FormState = {
  name: string;
  email: string;
  date: string;
  timeSlot: string;
  courtType: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  date: "",
  timeSlot: "",
  courtType: "",
  notes: "",
};

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

export default function BookingPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useSubmitBooking();

  const tomorrow = new Date(Date.now() + 86400_000).toISOString().split("T")[0];

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.date || form.date < tomorrow) {
      setErrorMsg("Please select a future date for your booking.");
      return;
    }
    if (!form.timeSlot) {
      setErrorMsg("Please select a time slot.");
      return;
    }
    if (!form.courtType) {
      setErrorMsg("Please select a court type.");
      return;
    }

    try {
      await mutation.mutateAsync({
        name: form.name,
        email: form.email,
        date: form.date,
        timeSlot: form.timeSlot,
        courtType: form.courtType,
        notes: form.notes,
      });
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch {
      setErrorMsg(
        "We couldn't submit your booking. Please try again in a moment.",
      );
    }
  }

  return (
    <div className="overflow-x-hidden">
      {/* ─── Hero Banner ───────────────────────────────────────── */}
      <section
        className="relative py-24 overflow-hidden bg-primary"
        data-ocid="booking.page"
      >
        <div className="absolute inset-0 z-0 court-texture opacity-10" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionLabel text="Reserve Your Time" />
            <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold text-primary-foreground leading-tight max-w-2xl">
              Book a Court
            </h1>
            <p className="font-sans text-base text-primary-foreground/70 mt-4 max-w-lg leading-relaxed">
              Reserve your court at Manhattan Racquet Club. All bookings are
              reviewed by our team within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Form Section ──────────────────────────────────────── */}
      <section className="py-20 bg-background" data-ocid="booking.form.section">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            {/* Notice banner */}
            <div className="flex items-start gap-3 rounded-sm border border-accent/30 bg-accent/10 px-4 py-3 mb-8">
              <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <p className="font-sans text-sm text-foreground/80 leading-relaxed">
                Booking requests are reviewed by our team. You will receive a
                confirmation by email.
              </p>
            </div>

            {/* Success state */}
            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
                data-ocid="booking.success_message"
              >
                <Card className="border-accent/40 bg-accent/5">
                  <CardContent className="pt-6 pb-6 flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="font-display text-base font-semibold text-foreground mb-1">
                        Booking Request Received
                      </p>
                      <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                        Your booking request has been received. We will confirm
                        your court shortly.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="font-sans text-xs text-accent hover:underline mt-3 inline-block"
                        data-ocid="booking.book_another_link"
                      >
                        Submit another booking →
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Form */}
            {!submitted && (
              <Card
                className="border-border shadow-none"
                data-ocid="booking.form_card"
              >
                <CardContent className="pt-8 pb-8">
                  <SectionLabel text="Court Booking" />
                  <h2 className="font-display text-2xl font-bold text-foreground mb-8">
                    Reserve Your Court
                  </h2>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    noValidate
                  >
                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="booking-name"
                          className="font-sans text-sm font-medium"
                        >
                          Full Name{" "}
                          <span className="text-accent" aria-hidden="true">
                            *
                          </span>
                        </Label>
                        <Input
                          id="booking-name"
                          placeholder="Jane Smith"
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          required
                          className="font-sans"
                          data-ocid="booking.name.input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="booking-email"
                          className="font-sans text-sm font-medium"
                        >
                          Email Address{" "}
                          <span className="text-accent" aria-hidden="true">
                            *
                          </span>
                        </Label>
                        <Input
                          id="booking-email"
                          type="email"
                          placeholder="jane@example.com"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          required
                          className="font-sans"
                          data-ocid="booking.email.input"
                        />
                      </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="booking-date"
                        className="font-sans text-sm font-medium"
                      >
                        Preferred Date{" "}
                        <span className="text-accent" aria-hidden="true">
                          *
                        </span>
                      </Label>
                      <Input
                        id="booking-date"
                        type="date"
                        min={tomorrow}
                        value={form.date}
                        onChange={(e) => set("date", e.target.value)}
                        required
                        className="font-sans"
                        data-ocid="booking.date.input"
                      />
                    </div>

                    {/* Time Slot + Court Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          Time Slot{" "}
                          <span className="text-accent" aria-hidden="true">
                            *
                          </span>
                        </Label>
                        <Select
                          value={form.timeSlot}
                          onValueChange={(v) => set("timeSlot", v)}
                        >
                          <SelectTrigger
                            className="font-sans w-full"
                            data-ocid="booking.timeslot.trigger"
                          >
                            <SelectValue placeholder="Select time slot" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">
                              Morning · 8 am – 12 pm
                            </SelectItem>
                            <SelectItem value="afternoon">
                              Afternoon · 12 pm – 5 pm
                            </SelectItem>
                            <SelectItem value="evening">
                              Evening · 5 pm – 9 pm
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="font-sans text-sm font-medium">
                          Court Type{" "}
                          <span className="text-accent" aria-hidden="true">
                            *
                          </span>
                        </Label>
                        <Select
                          value={form.courtType}
                          onValueChange={(v) => set("courtType", v)}
                        >
                          <SelectTrigger
                            className="font-sans w-full"
                            data-ocid="booking.courttype.trigger"
                          >
                            <SelectValue placeholder="Select court type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="indoor-clay">
                              Indoor Clay
                            </SelectItem>
                            <SelectItem value="outdoor-hard">
                              Outdoor Hard
                            </SelectItem>
                            <SelectItem value="covered-outdoor">
                              Covered Outdoor
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="booking-notes"
                        className="font-sans text-sm font-medium"
                      >
                        Notes{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </Label>
                      <Textarea
                        id="booking-notes"
                        placeholder="Any special requests or additional information…"
                        rows={4}
                        value={form.notes}
                        onChange={(e) => set("notes", e.target.value)}
                        className="font-sans resize-none"
                        data-ocid="booking.notes.textarea"
                      />
                    </div>

                    {/* Error message */}
                    {errorMsg && (
                      <p
                        className="font-sans text-sm text-destructive"
                        role="alert"
                        data-ocid="booking.error_message"
                      >
                        {errorMsg}
                      </p>
                    )}

                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
                      data-ocid="booking.submit_button"
                    >
                      {mutation.isPending
                        ? "Submitting…"
                        : "Request Court Booking"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── Hours strip ───────────────────────────────────────── */}
      <section className="py-14 bg-secondary" data-ocid="booking.hours.section">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <SectionLabel text="Court Hours" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
              Available Hours
            </h2>
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto text-sm font-sans">
              <div className="text-right text-muted-foreground">Mon – Fri</div>
              <div className="text-left font-medium text-foreground">
                6:00 AM – 11:00 PM
              </div>
              <div className="text-right text-muted-foreground">Saturday</div>
              <div className="text-left font-medium text-foreground">
                7:00 AM – 10:00 PM
              </div>
              <div className="text-right text-muted-foreground">Sunday</div>
              <div className="text-left font-medium text-foreground">
                8:00 AM – 9:00 PM
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
