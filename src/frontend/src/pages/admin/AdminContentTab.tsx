import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAllContent, useSetContent } from "../../hooks/useQueries";

const CONTENT_KEYS: { key: string; label: string; rows: number }[] = [
  { key: "landing_hero_title", label: "Landing: Hero Title", rows: 2 },
  { key: "landing_hero_subtitle", label: "Landing: Hero Subtitle", rows: 3 },
  { key: "landing_welcome_text", label: "Landing: Welcome Text", rows: 4 },
  { key: "about_history", label: "About: History", rows: 5 },
  { key: "about_mission", label: "About: Mission", rows: 3 },
  { key: "membership_intro", label: "Membership: Intro", rows: 3 },
  { key: "contact_address", label: "Contact: Address", rows: 2 },
  { key: "contact_phone", label: "Contact: Phone", rows: 1 },
  { key: "contact_email", label: "Contact: Email", rows: 1 },
];

function ContentField({
  contentKey,
  label,
  rows,
  initialValue,
}: {
  contentKey: string;
  label: string;
  rows: number;
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [isDirty, setIsDirty] = useState(false);
  const setContent = useSetContent();

  useEffect(() => {
    setValue(initialValue);
    setIsDirty(false);
  }, [initialValue]);

  function handleChange(val: string) {
    setValue(val);
    setIsDirty(val !== initialValue);
  }

  async function handleSave() {
    try {
      await setContent.mutateAsync({ key: contentKey, value });
      setIsDirty(false);
      toast.success(`"${label}" saved successfully`);
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  }

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 space-y-2"
      data-ocid={`admin.content.${contentKey.replace(/_/g, "-")}.panel`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-sans text-sm font-semibold text-foreground">
          {label}
        </span>
        {isDirty && (
          <span className="font-sans text-xs text-accent font-medium">
            Unsaved changes
          </span>
        )}
      </div>
      <p className="font-mono text-xs text-muted-foreground">{contentKey}</p>
      <Textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        rows={rows}
        className="font-sans text-sm resize-none"
        data-ocid={`admin.content.${contentKey.replace(/_/g, "-")}.textarea`}
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || setContent.isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium"
          data-ocid={`admin.content.${contentKey.replace(/_/g, "-")}.save_button`}
        >
          {setContent.isPending ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5 mr-1.5" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}

export default function AdminContentTab() {
  const { data: allContent, isLoading } = useAllContent();

  const contentMap = new Map<string, string>(allContent ?? []);

  return (
    <div>
      <h3 className="font-display text-xl font-bold text-foreground mb-1">
        Site Content
      </h3>
      <p className="font-sans text-sm text-muted-foreground mb-6">
        Edit the text content displayed across all public pages.
      </p>

      {isLoading ? (
        <div className="space-y-4" data-ocid="admin.content.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {CONTENT_KEYS.map((item) => (
            <ContentField
              key={item.key}
              contentKey={item.key}
              label={item.label}
              rows={item.rows}
              initialValue={contentMap.get(item.key) ?? ""}
            />
          ))}
        </div>
      )}
    </div>
  );
}
