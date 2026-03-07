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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Announcement } from "../../backend.d.ts";
import {
  useAllAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useSetAnnouncementPublished,
  useUpdateAnnouncement,
} from "../../hooks/useQueries";

interface AnnFormData {
  title: string;
  body: string;
}

function emptyForm(): AnnFormData {
  return { title: "", body: "" };
}

function AnnForm({
  initial,
  onSave,
  isPending,
  onClose,
}: {
  initial: AnnFormData;
  onSave: (data: AnnFormData) => void;
  isPending: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<AnnFormData>(initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label className="font-sans text-sm font-medium">Title</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="e.g. Spring Tournament Registration Open"
          required
          className="font-sans"
          data-ocid="admin.announcement.title.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="font-sans text-sm font-medium">Body</Label>
        <Textarea
          value={form.body}
          onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
          placeholder="Announcement content..."
          rows={4}
          className="font-sans text-sm resize-none"
          data-ocid="admin.announcement.body.textarea"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="font-sans"
          data-ocid="admin.announcement.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
          data-ocid="admin.announcement.save_button"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </div>
    </form>
  );
}

export default function AdminAnnouncementsTab() {
  const { data: announcements, isLoading } = useAllAnnouncements();
  const createAnn = useCreateAnnouncement();
  const updateAnn = useUpdateAnnouncement();
  const deleteAnn = useDeleteAnnouncement();
  const setPublished = useSetAnnouncementPublished();

  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Sort newest first using createdAt (bigint nanoseconds)
  const sorted = [...(announcements ?? [])].sort((a, b) =>
    Number(b.createdAt - a.createdAt),
  );

  async function handleCreate(data: AnnFormData) {
    try {
      await createAnn.mutateAsync(data);
      toast.success("Announcement created!");
      setShowCreate(false);
    } catch {
      toast.error("Failed to create announcement.");
    }
  }

  async function handleUpdate(data: AnnFormData) {
    if (!editingAnn) return;
    try {
      await updateAnn.mutateAsync({ id: editingAnn.id, ...data });
      toast.success("Announcement updated!");
      setEditingAnn(null);
    } catch {
      toast.error("Failed to update announcement.");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteAnn.mutateAsync(id);
      toast.success("Announcement deleted.");
    } catch {
      toast.error("Failed to delete announcement.");
    }
  }

  async function handleTogglePublished(ann: Announcement) {
    try {
      await setPublished.mutateAsync({ id: ann.id, published: !ann.published });
      toast.success(ann.published ? "Unpublished." : "Published!");
    } catch {
      toast.error("Failed to update status.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground mb-1">
            Announcements
          </h3>
          <p className="font-sans text-sm text-muted-foreground">
            Published announcements appear on the landing page.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium"
          data-ocid="admin.announcement.open_modal_button"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div
          className="space-y-3"
          data-ocid="admin.announcements.loading_state"
        >
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground font-sans text-sm border border-dashed border-border rounded-lg"
          data-ocid="admin.announcements.empty_state"
        >
          No announcements yet.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((ann, i) => (
            <div
              key={ann.id.toString()}
              className="bg-card border border-border rounded-lg p-4"
              data-ocid={`admin.announcement.item.${i + 1}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-semibold text-foreground truncate">
                      {ann.title}
                    </span>
                    <Badge
                      variant={ann.published ? "default" : "secondary"}
                      className={`shrink-0 font-sans text-xs ${ann.published ? "bg-primary text-primary-foreground" : ""}`}
                    >
                      {ann.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="font-sans text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {ann.body}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Publish toggle */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans text-xs text-muted-foreground hidden sm:block">
                      {ann.published ? "Live" : "Draft"}
                    </span>
                    <Switch
                      checked={ann.published}
                      onCheckedChange={() => handleTogglePublished(ann)}
                      disabled={setPublished.isPending}
                      data-ocid={`admin.announcement.switch.${i + 1}`}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingAnn(ann)}
                    className="font-sans text-xs"
                    data-ocid={`admin.announcement.edit_button.${i + 1}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive font-sans text-xs"
                        data-ocid={`admin.announcement.delete_button.${i + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-ocid="admin.announcement.dialog">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display">
                          Delete Announcement
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-sans">
                          Are you sure you want to delete &ldquo;{ann.title}
                          &rdquo;?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          className="font-sans"
                          data-ocid="admin.announcement.cancel_button"
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(ann.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-sans"
                          data-ocid="admin.announcement.confirm_button"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent
          className="max-w-md"
          data-ocid="admin.announcement.modal"
        >
          <DialogHeader>
            <DialogTitle className="font-display">New Announcement</DialogTitle>
          </DialogHeader>
          <AnnForm
            initial={emptyForm()}
            onSave={handleCreate}
            isPending={createAnn.isPending}
            onClose={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog
        open={!!editingAnn}
        onOpenChange={(o) => !o && setEditingAnn(null)}
      >
        <DialogContent
          className="max-w-md"
          data-ocid="admin.announcement.edit.modal"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Edit Announcement
            </DialogTitle>
          </DialogHeader>
          {editingAnn && (
            <AnnForm
              initial={{ title: editingAnn.title, body: editingAnn.body }}
              onSave={handleUpdate}
              isPending={updateAnn.isPending}
              onClose={() => setEditingAnn(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
