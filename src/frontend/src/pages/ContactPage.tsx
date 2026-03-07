import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useContentByKey } from "../hooks/useQueries";

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

export default function ContactPage() {
  const address = useContentByKey("contact_address");
  const phone = useContentByKey("contact_phone");
  const email = useContentByKey("contact_email");

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setSubmitting(false);
      setForm({ name: "", email: "", message: "" });
      toast.success("Message sent! We'll be in touch shortly.");
    }, 800);
  }

  return (
    <div className="overflow-x-hidden">
      {/* ─── Hero Banner ───────────────────────────────────────── */}
      <section
        className="bg-primary py-24 relative overflow-hidden"
        data-ocid="contact.page"
      >
        <div className="absolute inset-0 court-texture opacity-30" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionLabel text="Get In Touch" />
            <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold text-primary-foreground leading-tight max-w-2xl">
              Visit Us in Manhattan
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ─── Contact Info + Form ────────────────────────────────── */}
      <section className="py-20 bg-background" data-ocid="contact.info.section">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionLabel text="Club Info" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-8">
                Find & Reach Us
              </h2>

              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Address
                    </div>
                    {address.isLoading ? (
                      <Skeleton
                        className="h-10 w-48"
                        data-ocid="contact.address.loading_state"
                      />
                    ) : (
                      <address className="font-serif text-base text-foreground not-italic leading-relaxed whitespace-pre-line">
                        {address.data ||
                          "247 Park Avenue South\nNew York, NY 10003"}
                      </address>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Phone
                    </div>
                    {phone.isLoading ? (
                      <Skeleton
                        className="h-5 w-36"
                        data-ocid="contact.phone.loading_state"
                      />
                    ) : (
                      <a
                        href={`tel:${(phone.data || "+12125550192").replace(/\s/g, "")}`}
                        className="font-sans text-base text-foreground hover:text-primary transition-colors"
                      >
                        {phone.data || "+1 (212) 555-0192"}
                      </a>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Email
                    </div>
                    {email.isLoading ? (
                      <Skeleton
                        className="h-5 w-44"
                        data-ocid="contact.email.loading_state"
                      />
                    ) : (
                      <a
                        href={`mailto:${email.data || "info@manhattanracquet.com"}`}
                        className="font-sans text-base text-foreground hover:text-primary transition-colors"
                      >
                        {email.data || "info@manhattanracquet.com"}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div
                className="mt-10 rounded-lg border border-border bg-secondary court-texture h-52 flex flex-col items-center justify-center gap-3"
                data-ocid="contact.map_marker"
              >
                <MapPin className="w-8 h-8 text-primary/50" />
                <span className="font-sans text-sm text-muted-foreground font-medium">
                  Find Us · Park Avenue South, NYC
                </span>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <SectionLabel text="Send a Message" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-8">
                Get in Touch
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="contact-name"
                    className="font-sans text-sm font-medium"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="contact-name"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                    className="font-sans"
                    data-ocid="contact.name.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="contact-email"
                    className="font-sans text-sm font-medium"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    required
                    className="font-sans"
                    data-ocid="contact.email.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="contact-message"
                    className="font-sans text-sm font-medium"
                  >
                    Message
                  </Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Tell us how we can help..."
                    rows={5}
                    value={form.message}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, message: e.target.value }))
                    }
                    required
                    className="font-sans resize-none"
                    data-ocid="contact.message.textarea"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
                  data-ocid="contact.submit_button"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Hours ─────────────────────────────────────────────── */}
      <section className="py-16 bg-secondary" data-ocid="contact.hours.section">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <SectionLabel text="Hours" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
              Club Hours
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
