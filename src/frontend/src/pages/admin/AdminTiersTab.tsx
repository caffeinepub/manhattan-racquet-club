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
import type { MembershipTier } from "../../backend.d.ts";
import {
  useAllMembershipTiers,
  useCreateMembershipTier,
  useDeleteMembershipTier,
  useUpdateMembershipTier,
} from "../../hooks/useQueries";

interface TierFormData {
  name: string;
  price: string;
  benefits: string;
  displayOrder: string;
}

function emptyForm(): TierFormData {
  return { name: "", price: "", benefits: "", displayOrder: "0" };
}

function tierToForm(t: MembershipTier): TierFormData {
  return {
    name: t.name,
    price: t.price,
    benefits: t.benefits.join("\n"),
    displayOrder: t.displayOrder.toString(),
  };
}

function TierForm({
  initial,
  onSave,
  isPending,
  onClose,
}: {
  initial: TierFormData;
  onSave: (data: TierFormData) => void;
  isPending: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<TierFormData>(initial);

  function set(field: keyof TierFormData, val: string) {
    setForm((p) => ({ ...p, [field]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="font-sans text-sm font-medium">Tier Name</Label>
        <Input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Adult Membership"
          required
          className="font-sans"
          data-ocid="admin.tier.name.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="font-sans text-sm font-medium">Price</Label>
        <Input
          value={form.price}
          onChange={(e) => set("price", e.target.value)}
          placeholder="e.g. $2,400"
          required
          className="font-sans"
          data-ocid="admin.tier.price.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="font-sans text-sm font-medium">
          Benefits{" "}
          <span className="text-muted-foreground font-normal">
            (one per line)
          </span>
        </Label>
        <Textarea
          value={form.benefits}
          onChange={(e) => set("benefits", e.target.value)}
          placeholder={"Unlimited court access\nGuest passes\nLocker room"}
          rows={5}
          className="font-sans text-sm resize-none"
          data-ocid="admin.tier.benefits.textarea"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="font-sans text-sm font-medium">Display Order</Label>
        <Input
          type="number"
          value={form.displayOrder}
          onChange={(e) => set("displayOrder", e.target.value)}
          className="font-sans w-24"
          data-ocid="admin.tier.order.input"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="font-sans"
          data-ocid="admin.tier.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-semibold"
          data-ocid="admin.tier.save_button"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Tier
        </Button>
      </div>
    </form>
  );
}

export default function AdminTiersTab() {
  const { data: tiers, isLoading } = useAllMembershipTiers();
  const createTier = useCreateMembershipTier();
  const updateTier = useUpdateMembershipTier();
  const deleteTier = useDeleteMembershipTier();

  const [editingTier, setEditingTier] = useState<MembershipTier | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const sorted = [...(tiers ?? [])].sort(
    (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
  );

  async function handleCreate(data: TierFormData) {
    try {
      await createTier.mutateAsync({
        name: data.name,
        price: data.price,
        benefits: data.benefits
          .split("\n")
          .map((b) => b.trim())
          .filter(Boolean),
        displayOrder: BigInt(data.displayOrder || 0),
      });
      toast.success("Membership tier created!");
      setShowCreate(false);
    } catch {
      toast.error("Failed to create tier.");
    }
  }

  async function handleUpdate(data: TierFormData) {
    if (!editingTier) return;
    try {
      await updateTier.mutateAsync({
        id: editingTier.id,
        name: data.name,
        price: data.price,
        benefits: data.benefits
          .split("\n")
          .map((b) => b.trim())
          .filter(Boolean),
        displayOrder: BigInt(data.displayOrder || 0),
      });
      toast.success("Tier updated!");
      setEditingTier(null);
    } catch {
      toast.error("Failed to update tier.");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteTier.mutateAsync(id);
      toast.success("Tier deleted.");
    } catch {
      toast.error("Failed to delete tier.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground mb-1">
            Membership Tiers
          </h3>
          <p className="font-sans text-sm text-muted-foreground">
            Manage membership plans and pricing.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium"
          data-ocid="admin.tier.open_modal_button"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Tier
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="admin.tiers.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground font-sans text-sm border border-dashed border-border rounded-lg"
          data-ocid="admin.tiers.empty_state"
        >
          No tiers yet. Add your first membership tier.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((tier, i) => (
            <div
              key={tier.id.toString()}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4"
              data-ocid={`admin.tier.item.${i + 1}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-foreground">
                    {tier.name}
                  </span>
                  <span className="font-sans text-sm text-accent font-semibold">
                    {tier.price}
                  </span>
                </div>
                <p className="font-sans text-xs text-muted-foreground mt-0.5">
                  {tier.benefits.length} benefit
                  {tier.benefits.length !== 1 ? "s" : ""} · Order:{" "}
                  {tier.displayOrder.toString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingTier(tier)}
                  className="font-sans text-xs"
                  data-ocid={`admin.tier.edit_button.${i + 1}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive font-sans text-xs"
                      data-ocid={`admin.tier.delete_button.${i + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-ocid="admin.tier.dialog">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display">
                        Delete Tier
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-sans">
                        Are you sure you want to delete &ldquo;{tier.name}
                        &rdquo;? This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="font-sans"
                        data-ocid="admin.tier.cancel_button"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(tier.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-sans"
                        data-ocid="admin.tier.confirm_button"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md" data-ocid="admin.tier.modal">
          <DialogHeader>
            <DialogTitle className="font-display">
              New Membership Tier
            </DialogTitle>
          </DialogHeader>
          <TierForm
            initial={emptyForm()}
            onSave={handleCreate}
            isPending={createTier.isPending}
            onClose={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingTier}
        onOpenChange={(o) => !o && setEditingTier(null)}
      >
        <DialogContent className="max-w-md" data-ocid="admin.tier.edit.modal">
          <DialogHeader>
            <DialogTitle className="font-display">
              Edit Membership Tier
            </DialogTitle>
          </DialogHeader>
          {editingTier && (
            <TierForm
              initial={tierToForm(editingTier)}
              onSave={handleUpdate}
              isPending={updateTier.isPending}
              onClose={() => setEditingTier(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
