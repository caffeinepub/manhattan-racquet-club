import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAllContent, useSetContent } from "../../hooks/useQueries";
import { useStorageClient } from "../../hooks/useStorageClient";

const SHA256_PREFIX = "sha256:";

function isValidHash(value: string): boolean {
  if (!value || !value.startsWith(SHA256_PREFIX)) return false;
  const hex = value.slice(SHA256_PREFIX.length);
  return hex.length === 64 && /^[0-9a-f]+$/i.test(hex);
}

interface ImageSlot {
  key: string;
  label: string;
  description: string;
  defaultUrl: string;
}

const IMAGE_SLOTS: ImageSlot[] = [
  {
    key: "img_landing_hero",
    label: "Landing Page Hero",
    description: "Full-width hero banner on the landing page",
    defaultUrl: "/assets/generated/hero-landing.dim_1600x700.jpg",
  },
  {
    key: "img_about_banner",
    label: "About Page Banner",
    description: "Header banner on the About page",
    defaultUrl: "/assets/generated/hero-about.dim_1400x600.jpg",
  },
  {
    key: "img_membership_banner",
    label: "Membership Page Banner",
    description: "Header banner on the Membership page",
    defaultUrl: "/assets/generated/hero-membership.dim_1400x600.jpg",
  },
  {
    key: "img_contact_banner",
    label: "Contact Page Banner",
    description: "Header banner on the Contact page",
    defaultUrl: "/assets/generated/hero-contact.dim_1400x600.jpg",
  },
  {
    key: "img_staff_photo_1",
    label: "Staff Photo: Sarah Williams",
    description: "Photo for staff member #1 (Head Coach)",
    defaultUrl: "/assets/generated/staff-sarah.dim_400x400.jpg",
  },
  {
    key: "img_staff_photo_2",
    label: "Staff Photo: Carlos Ramirez",
    description: "Photo for staff member #2 (Director of Tennis)",
    defaultUrl: "/assets/generated/staff-carlos.dim_400x400.jpg",
  },
  {
    key: "img_staff_photo_3",
    label: "Staff Photo: Emily Chen",
    description: "Photo for staff member #3 (Junior Coach)",
    defaultUrl: "/assets/generated/staff-emily.dim_400x400.jpg",
  },
];

interface ImageCardProps {
  slot: ImageSlot;
  currentHash: string;
  storageAvailable: boolean;
  onUpload: (key: string, file: File) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
}

function ImageCard({
  slot,
  currentHash,
  storageAvailable,
  onUpload,
  isUploading,
  uploadProgress,
}: ImageCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isStaff = slot.key.startsWith("img_staff_photo");

  const hasUploadedImage = isValidHash(currentHash);
  // We show the default image always (not attempting to resolve blob URL in the card preview)
  // since useImageUrl can't be used per-card in a loop. We'll show a "uploaded" badge if hash exists.

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    void onUpload(slot.key, file);
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div
      className="bg-card border border-border rounded-lg overflow-hidden shadow-club"
      data-ocid={`admin.images.${slot.key}.card`}
    >
      {/* Image preview */}
      <div
        className={`relative overflow-hidden bg-secondary ${isStaff ? "h-48" : "h-36"}`}
      >
        <img
          src={slot.defaultUrl}
          alt={slot.label}
          className="w-full h-full object-cover"
        />
        {hasUploadedImage && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 bg-green-600/90 text-white font-sans text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              Custom image
            </span>
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 px-4">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <Progress
              value={uploadProgress}
              className="w-full max-w-[160px] h-1.5"
              data-ocid={`admin.images.${slot.key}.loading_state`}
            />
            <span className="font-sans text-xs text-muted-foreground">
              Uploading {uploadProgress}%
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-sans text-sm font-semibold text-foreground leading-tight">
            {slot.label}
          </h4>
          <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        </div>
        <p className="font-sans text-xs text-muted-foreground mb-3 leading-relaxed">
          {slot.description}
        </p>
        {hasUploadedImage && (
          <p className="font-mono text-[10px] text-muted-foreground/70 mb-3 truncate">
            {currentHash.slice(0, 32)}…
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          data-ocid={`admin.images.${slot.key}.upload_button`}
        />
        <Button
          size="sm"
          variant={hasUploadedImage ? "outline" : "default"}
          disabled={isUploading || !storageAvailable}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full font-sans font-medium text-xs ${
            !hasUploadedImage
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : ""
          }`}
          data-ocid={`admin.images.${slot.key}.primary_button`}
          title={
            !storageAvailable
              ? "Storage not available in local preview"
              : undefined
          }
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              {hasUploadedImage ? "Replace Image" : "Upload Image"}
            </>
          )}
        </Button>
        {!storageAvailable && (
          <p className="font-sans text-[10px] text-muted-foreground/60 text-center mt-1.5">
            Available in deployed version
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdminImagesTab() {
  const { data: allContent, isLoading } = useAllContent();
  const setContent = useSetContent();
  const storageClient = useStorageClient();

  // Per-slot upload state
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set());
  const [progressMap, setProgressMap] = useState<Map<string, number>>(
    new Map(),
  );

  const contentMap = new Map<string, string>(allContent ?? []);

  async function handleUpload(key: string, file: File): Promise<void> {
    if (!storageClient.available) {
      toast.error("Storage is not available in preview mode");
      return;
    }

    setUploadingKeys((prev) => new Set(prev).add(key));
    setProgressMap((prev) => new Map(prev).set(key, 0));

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const hash = await storageClient.upload(bytes, (pct) => {
        setProgressMap((prev) => new Map(prev).set(key, pct));
      });

      await setContent.mutateAsync({ key, value: hash });
      toast.success("Image uploaded successfully");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      toast.error(msg);
    } finally {
      setUploadingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      setProgressMap((prev) => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
    }
  }

  return (
    <div>
      <h3 className="font-display text-xl font-bold text-foreground mb-1">
        Images
      </h3>
      <p className="font-sans text-sm text-muted-foreground mb-6">
        Upload custom images for each section of the public website. Changes
        take effect immediately.
      </p>

      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          data-ocid="admin.images.loading_state"
        >
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {IMAGE_SLOTS.map((slot, i) => (
            <ImageCard
              key={slot.key}
              slot={slot}
              currentHash={contentMap.get(slot.key) ?? ""}
              storageAvailable={storageClient.available}
              onUpload={handleUpload}
              isUploading={uploadingKeys.has(slot.key)}
              uploadProgress={progressMap.get(slot.key) ?? 0}
              data-ocid={`admin.images.item.${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
