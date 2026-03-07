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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { StaffMember } from "../../backend.d.ts";
import {
  useAllStaffMembers,
  useCreateStaffMember,
  useDeleteStaffMember,
  useUpdateStaffMember,
} from "../../hooks/useQueries";

interface StaffFormData {
  name: string;
  role: string;
  bio: string;
  displayOrder: string;
}

function emptyForm(): StaffFormData {
  return { name: "", role: "", bio: "", displayOrder: "0" };
}

function staffToForm(s: StaffMember): StaffFormData {
  return {
    name: s.name,
    role: s.role,
    bio: s.bio,
    displayOrder: s.displayOrder.toString(),
  };
}

function StaffForm({
  initial,
  onSave,
  isPending,
  onClose,
}: {
  initial: StaffFormData;
  onSave: (data: StaffFormData) => void;
  isPending: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<StaffFormData>(initial);

  function set(field: keyof StaffFormData, val: string) {
    setForm((p) => ({ ...p, [field]: val }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label className="font-sans text-sm font-medium">Full Name</Label>
        <Input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Carlos Rivera"
          required
          className="font-sans"
          data-ocid="admin.staff.name.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="font-sans text-sm font-medium">Role / Title</Label>
        <Input
          value={form.role}
          onChange={(e) => set("role", e.target.value)}
          placeholder="e.g. Head Pro Coach"
          required
          className="font-sans"
          data-ocid="admin.staff.role.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="font-sans text-sm font-medium">Bio</Label>
        <Textarea
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="Brief professional biography..."
          rows={4}
          className="font-sans text-sm resize-none"
          data-ocid="admin.staff.bio.textarea"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="font-sans text-sm font-medium">Display Order</Label>
        <Input
          type="number"
          value={form.displayOrder}
          onChange={(e) => set("displayOrder", e.target.value)}
          className="font-sans w-24"
          data-ocid="admin.staff.order.input"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="font-sans"
          data-ocid="admin.staff.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
          data-ocid="admin.staff.save_button"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Staff Member
        </Button>
      </div>
    </form>
  );
}

export default function AdminStaffTab() {
  const { data: staff, isLoading } = useAllStaffMembers();
  const createStaff = useCreateStaffMember();
  const updateStaff = useUpdateStaffMember();
  const deleteStaff = useDeleteStaffMember();

  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const sorted = [...(staff ?? [])].sort(
    (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
  );

  async function handleCreate(data: StaffFormData) {
    try {
      await createStaff.mutateAsync({
        name: data.name,
        role: data.role,
        bio: data.bio,
        displayOrder: BigInt(data.displayOrder || 0),
      });
      toast.success("Staff member added!");
      setShowCreate(false);
    } catch {
      toast.error("Failed to add staff member.");
    }
  }

  async function handleUpdate(data: StaffFormData) {
    if (!editingMember) return;
    try {
      await updateStaff.mutateAsync({
        id: editingMember.id,
        name: data.name,
        role: data.role,
        bio: data.bio,
        displayOrder: BigInt(data.displayOrder || 0),
      });
      toast.success("Staff member updated!");
      setEditingMember(null);
    } catch {
      toast.error("Failed to update staff member.");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteStaff.mutateAsync(id);
      toast.success("Staff member removed.");
    } catch {
      toast.error("Failed to delete staff member.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground mb-1">
            Coaching Staff
          </h3>
          <p className="font-sans text-sm text-muted-foreground">
            Manage staff profiles displayed on the About page.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium"
          data-ocid="admin.staff.open_modal_button"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="admin.staff.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground font-sans text-sm border border-dashed border-border rounded-lg"
          data-ocid="admin.staff.empty_state"
        >
          No staff members yet.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((member, i) => (
            <div
              key={member.id.toString()}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4"
              data-ocid={`admin.staff.item.${i + 1}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-primary text-sm">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="font-display font-semibold text-foreground truncate">
                    {member.name}
                  </div>
                  <div className="font-sans text-xs text-accent font-medium">
                    {member.role}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingMember(member)}
                  className="font-sans text-xs"
                  data-ocid={`admin.staff.edit_button.${i + 1}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive font-sans text-xs"
                      data-ocid={`admin.staff.delete_button.${i + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-ocid="admin.staff.dialog">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display">
                        Remove Staff Member
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-sans">
                        Are you sure you want to remove {member.name} from the
                        staff list?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="font-sans"
                        data-ocid="admin.staff.cancel_button"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(member.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-sans"
                        data-ocid="admin.staff.confirm_button"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md" data-ocid="admin.staff.modal">
          <DialogHeader>
            <DialogTitle className="font-display">Add Staff Member</DialogTitle>
          </DialogHeader>
          <StaffForm
            initial={emptyForm()}
            onSave={handleCreate}
            isPending={createStaff.isPending}
            onClose={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog
        open={!!editingMember}
        onOpenChange={(o) => !o && setEditingMember(null)}
      >
        <DialogContent className="max-w-md" data-ocid="admin.staff.edit.modal">
          <DialogHeader>
            <DialogTitle className="font-display">
              Edit Staff Member
            </DialogTitle>
          </DialogHeader>
          {editingMember && (
            <StaffForm
              initial={staffToForm(editingMember)}
              onSave={handleUpdate}
              isPending={updateStaff.isPending}
              onClose={() => setEditingMember(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
