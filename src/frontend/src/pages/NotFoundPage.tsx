import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

export default function NotFoundPage() {
  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center px-6"
      data-ocid="notfound.page"
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-lg shadow-club p-10 text-center">
          {/* Club logo mark */}
          <div className="w-12 h-12 rounded-sm bg-primary flex items-center justify-center mx-auto mb-6">
            <span className="text-primary-foreground font-display font-bold text-base leading-none">
              MRC
            </span>
          </div>

          {/* Club name */}
          <p className="font-sans text-xs font-semibold tracking-[0.2em] text-accent uppercase mb-2">
            Manhattan Racquet Club
          </p>

          {/* 404 heading */}
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">
            404
          </h1>

          <p className="font-sans text-base text-muted-foreground mb-1">
            Page not found
          </p>

          {/* Divider */}
          <div className="w-10 h-px bg-accent mx-auto my-5" />

          {/* Explanation */}
          <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-8">
            The page you're looking for doesn't exist or may have been moved.
            Head back to the home page to continue.
          </p>

          {/* CTA */}
          <Button
            asChild
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans font-semibold tracking-wide w-full"
            data-ocid="notfound.home.button"
          >
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
