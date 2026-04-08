import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import type { GalleryImage } from "../backend.d.ts";
import { useImageUrl } from "../hooks/useImageUrl";
import { useGetAllGalleryImages } from "../hooks/useQueries";

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

function GalleryItem({ image, index }: { image: GalleryImage; index: number }) {
  const url = useImageUrl(image.storageKey, "");

  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.07 }}
      className="overflow-hidden rounded-lg bg-card border border-border shadow-club group"
      data-ocid={`gallery.image.item.${index + 1}`}
    >
      <div className="aspect-square overflow-hidden bg-primary/5">
        {url ? (
          <img
            src={url}
            alt={image.altText || "Gallery image"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-sans text-xs text-muted-foreground/40 uppercase tracking-widest">
              Loading…
            </span>
          </div>
        )}
      </div>
      {image.altText && (
        <figcaption className="px-4 py-3 border-t border-border">
          <p className="font-sans text-xs text-muted-foreground truncate">
            {image.altText}
          </p>
        </figcaption>
      )}
    </motion.figure>
  );
}

export default function GalleryPage() {
  const { data: images, isLoading } = useGetAllGalleryImages();

  const sorted = [...(images ?? [])].sort(
    (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
  );

  return (
    <div className="overflow-x-hidden">
      {/* ─── Page Header ───────────────────────────────────────── */}
      <section
        className="py-20 bg-secondary court-texture"
        data-ocid="gallery.page"
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionLabel text="The Club" />
            <h1 className="font-display text-[clamp(2.2rem,5vw,4rem)] font-bold text-foreground leading-tight">
              Photo Gallery
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ─── Gallery Grid ───────────────────────────────────────── */}
      <section className="py-20 bg-background" data-ocid="gallery.grid.section">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div
              className="grid grid-cols-2 md:grid-cols-3 gap-5"
              data-ocid="gallery.loading_state"
            >
              {["s1", "s2", "s3", "s4", "s5", "s6"].map((id) => (
                <Skeleton key={id} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : sorted.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {sorted.map((img, i) => (
                <GalleryItem key={img.id} image={img} index={i} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-24"
              data-ocid="gallery.empty_state"
            >
              <div className="w-12 h-px bg-accent mx-auto mb-6" />
              <p className="font-display text-xl text-muted-foreground">
                Gallery coming soon.
              </p>
              <p className="font-sans text-sm text-muted-foreground/60 mt-2">
                Photos of the club, courts, and events will appear here.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
