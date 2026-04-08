import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ImageIcon,
  Loader2,
  Pencil,
  PlusCircle,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { GalleryImage } from "../../backend.d.ts";
import {
  useAddGalleryImage,
  useDeleteGalleryImage,
  useGetAllGalleryImages,
  useUpdateGalleryImage,
} from "../../hooks/useQueries";
import { useStorageClient } from "../../hooks/useStorageClient";

// ─── Gallery image card ────────────────────────────────────────────────────
function GalleryCard({
  image,
  onEdit,
  onDelete,
}: {
  image: GalleryImage;
  onEdit: (image: GalleryImage) => void;
  onDelete: (id: string) => void;
}) {
  const storageClient = useStorageClient();
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const deleteImage = useDeleteGalleryImage();

  useEffect(() => {
    if (!image.storageKey || !storageClient.available) return;
    let cancelled = false;
    storageClient
      .getURL(image.storageKey)
      .then((url) => {
        if (!cancelled) setThumbUrl(url);
      })
      .catch(() => {
        if (!cancelled) setThumbUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [image.storageKey, storageClient]);

  async function handleDelete() {
    try {
      await deleteImage.mutateAsync(image.id);
      onDelete(image.id);
      toast.success("Image deleted");
    } catch {
      toast.error("Failed to delete image");
    }
  }

  return (
    <div
      className="bg-card border border-border rounded-lg overflow-hidden shadow-sm"
      data-ocid={`admin.gallery.item.${image.id}`}
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-muted flex items-center justify-center">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={image.altText}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
        )}
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded px-1.5 py-0.5">
          <span className="font-mono text-xs text-muted-foreground">
            #{Number(image.displayOrder)}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3">
        <p className="font-sans text-sm text-foreground font-medium truncate mb-0.5">
          {image.altText || "No alt text"}
        </p>
        <p className="font-mono text-[10px] text-muted-foreground/60 truncate mb-3">
          {image.storageKey.slice(0, 28)}…
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(image)}
            className="flex-1 font-sans text-xs"
            data-ocid={`admin.gallery.edit.${image.id}`}
          >
            <Pencil className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive font-sans text-xs px-2"
                data-ocid={`admin.gallery.delete.${image.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">
                  Delete Image
                </AlertDialogTitle>
                <AlertDialogDescription className="font-sans">
                  Are you sure you want to delete this gallery image? This
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-sans">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-sans"
                  data-ocid={`admin.gallery.confirm_delete.${image.id}`}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

// ─── Edit dialog ───────────────────────────────────────────────────────────
function EditDialog({
  image,
  onClose,
}: {
  image: GalleryImage | null;
  onClose: () => void;
}) {
  const updateImage = useUpdateGalleryImage();
  const [altText, setAltText] = useState(image?.altText ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    image ? String(Number(image.displayOrder)) : "0",
  );

  if (!image) return null;

  async function handleSave() {
    if (!image) return;
    try {
      await updateImage.mutateAsync({
        id: image.id,
        altText,
        displayOrder: BigInt(Number.parseInt(displayOrder, 10) || 0),
      });
      toast.success("Image updated");
      onClose();
    } catch {
      toast.error("Failed to update image");
    }
  }

  return (
    <Dialog open={!!image} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm" data-ocid="admin.gallery.edit_modal">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Gallery Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="font-sans text-sm font-medium">Alt Text</Label>
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image…"
              className="font-sans"
              data-ocid="admin.gallery.alt_text.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-sans text-sm font-medium">
              Display Order
            </Label>
            <Input
              type="number"
              min="0"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="font-sans"
              data-ocid="admin.gallery.display_order.input"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={onClose} className="font-sans">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateImage.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
              data-ocid="admin.gallery.save_button"
            >
              {updateImage.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add dialog ────────────────────────────────────────────────────────────
function AddDialog({ onClose }: { onClose: () => void }) {
  const storageClient = useStorageClient();
  const addImage = useAddGalleryImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [altText, setAltText] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file && !altText) {
      setAltText(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    }
  }

  async function handleAdd() {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }
    if (!storageClient.available) {
      toast.error("Storage not available in preview mode");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const bytes = new Uint8Array(await selectedFile.arrayBuffer());
      const storageKey = await storageClient.upload(bytes, (pct) => {
        setProgress(pct);
      });

      await addImage.mutateAsync({
        storageKey,
        altText: altText.trim() || "Gallery image",
        displayOrder: BigInt(Number.parseInt(displayOrder, 10) || 0),
      });

      toast.success("Image added to gallery");
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm" data-ocid="admin.gallery.add_modal">
        <DialogHeader>
          <DialogTitle className="font-display">Add Gallery Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="font-sans text-sm font-medium">
              Image (PNG or JPEG)
            </Label>
            <button
              type="button"
              className="w-full border border-dashed border-border rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              data-ocid="admin.gallery.file_area"
            >
              <Upload className="w-5 h-5 text-muted-foreground" />
              <p className="font-sans text-xs text-muted-foreground text-center">
                {selectedFile ? selectedFile.name : "Click to select image"}
              </p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg"
              className="hidden"
              onChange={handleFileChange}
              data-ocid="admin.gallery.file_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-sans text-sm font-medium">Alt Text</Label>
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image…"
              className="font-sans"
              data-ocid="admin.gallery.add_alt_text.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-sans text-sm font-medium">
              Display Order
            </Label>
            <Input
              type="number"
              min="0"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="font-sans"
              data-ocid="admin.gallery.add_order.input"
            />
          </div>

          {uploading && (
            <div className="space-y-1">
              <Progress value={progress} className="h-1.5" />
              <p className="font-sans text-xs text-muted-foreground text-center">
                Uploading {progress}%
              </p>
            </div>
          )}

          {!storageClient.available && (
            <p className="font-sans text-xs text-muted-foreground/60 text-center">
              Upload only available in deployed production version.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={onClose} className="font-sans">
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={uploading || !selectedFile || !storageClient.available}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
              data-ocid="admin.gallery.add_button"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                "Add Image"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main tab ──────────────────────────────────────────────────────────────
export default function AdminGalleryTab() {
  const { data: images, isLoading } = useGetAllGalleryImages();
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const sorted = [...(images ?? [])].sort(
    (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground mb-1">
            Gallery
          </h3>
          <p className="font-sans text-sm text-muted-foreground">
            {images?.length ?? 0} images · sorted by display order
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium"
          data-ocid="admin.gallery.add_open_button"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          data-ocid="admin.gallery.loading_state"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-52 rounded-lg" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground font-sans text-sm border border-dashed border-border rounded-lg"
          data-ocid="admin.gallery.empty_state"
        >
          No gallery images yet. Add one to get started.
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          data-ocid="admin.gallery.grid"
        >
          {sorted.map((image) => (
            <GalleryCard
              key={image.id}
              image={image}
              onEdit={setEditingImage}
              onDelete={() => {}}
            />
          ))}
        </div>
      )}

      {showAdd && <AddDialog onClose={() => setShowAdd(false)} />}
      <EditDialog image={editingImage} onClose={() => setEditingImage(null)} />
    </div>
  );
}
