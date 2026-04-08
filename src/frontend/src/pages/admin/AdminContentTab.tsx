import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  FileClock,
  Loader2,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAllContent, useSetContent } from "../../hooks/useQueries";

// ─── Site content fields ─────────────────────────────────────────────────────

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

// Keys that support draft preview (subset of CONTENT_KEYS with meaningful content)
const DRAFT_SUPPORTED_KEYS = new Set([
  "landing_hero_title",
  "landing_hero_subtitle",
  "landing_welcome_text",
  "about_history",
  "about_mission",
  "membership_intro",
]);

const DRAFT_PREFIX = "draft:";

function draftKey(key: string): string {
  return `${DRAFT_PREFIX}${key}`;
}

// ─── SEO fields ──────────────────────────────────────────────────────────────

interface SeoField {
  key: string;
  label: string;
  placeholder: string;
  isTextarea?: boolean;
}

interface SeoPage {
  page: string;
  fields: SeoField[];
}

const SEO_PAGES: SeoPage[] = [
  {
    page: "Landing Page",
    fields: [
      {
        key: "page_seo_title_landing",
        label: "Page Title",
        placeholder: "Manhattan Racquet Club — Premium Tennis in NYC",
      },
      {
        key: "page_seo_desc_landing",
        label: "Meta Description",
        placeholder: "Join Manhattan's premier tennis club…",
        isTextarea: true,
      },
      {
        key: "page_seo_og_image_landing",
        label: "OG Image URL",
        placeholder: "https://…/og-landing.jpg",
      },
    ],
  },
  {
    page: "About Page",
    fields: [
      {
        key: "page_seo_title_about",
        label: "Page Title",
        placeholder: "About Us — Manhattan Racquet Club",
      },
      {
        key: "page_seo_desc_about",
        label: "Meta Description",
        placeholder: "Learn about our history and mission…",
        isTextarea: true,
      },
    ],
  },
  {
    page: "Membership Page",
    fields: [
      {
        key: "page_seo_title_membership",
        label: "Page Title",
        placeholder: "Membership Plans — Manhattan Racquet Club",
      },
      {
        key: "page_seo_desc_membership",
        label: "Meta Description",
        placeholder: "Explore our Junior, Adult, and Family membership tiers…",
        isTextarea: true,
      },
    ],
  },
  {
    page: "Contact Page",
    fields: [
      {
        key: "page_seo_title_contact",
        label: "Page Title",
        placeholder: "Contact — Manhattan Racquet Club",
      },
      {
        key: "page_seo_desc_contact",
        label: "Meta Description",
        placeholder: "Get in touch with the Manhattan Racquet Club team…",
        isTextarea: true,
      },
    ],
  },
];

// ─── ContentField (existing fields + optional draft support) ─────────────────

function ContentField({
  contentKey,
  label,
  rows,
  initialValue,
  draftValue,
}: {
  contentKey: string;
  label: string;
  rows: number;
  initialValue: string;
  draftValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [isDirty, setIsDirty] = useState(false);
  const [showDraftPreview, setShowDraftPreview] = useState(false);
  const setContent = useSetContent();
  const hasDraft = DRAFT_SUPPORTED_KEYS.has(contentKey);
  const draftExists = draftValue.trim().length > 0;

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
      toast.success(`"${label}" saved`);
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  }

  async function handleSaveDraft() {
    try {
      await setContent.mutateAsync({ key: draftKey(contentKey), value });
      setIsDirty(false);
      toast.success(`Draft saved for "${label}"`);
    } catch {
      toast.error("Failed to save draft.");
    }
  }

  async function handlePublishDraft() {
    if (!draftExists) return;
    try {
      await setContent.mutateAsync({ key: contentKey, value: draftValue });
      await setContent.mutateAsync({ key: draftKey(contentKey), value: "" });
      setShowDraftPreview(false);
      toast.success(`Draft published for "${label}"`);
    } catch {
      toast.error("Failed to publish draft.");
    }
  }

  async function handleDiscardDraft() {
    if (!draftExists) return;
    try {
      await setContent.mutateAsync({ key: draftKey(contentKey), value: "" });
      setShowDraftPreview(false);
      toast.success("Draft discarded");
    } catch {
      toast.error("Failed to discard draft.");
    }
  }

  const ocidBase = `admin.content.${contentKey.replace(/_/g, "-")}`;

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 space-y-2"
      data-ocid={`${ocidBase}.panel`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-sans text-sm font-semibold text-foreground">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {hasDraft && draftExists && (
            <span className="inline-flex items-center gap-1 font-sans text-xs text-amber-600 font-medium">
              <FileClock className="h-3 w-3" />
              Draft pending
            </span>
          )}
          {isDirty && (
            <span className="font-sans text-xs text-accent font-medium">
              Unsaved changes
            </span>
          )}
        </div>
      </div>
      <p className="font-mono text-xs text-muted-foreground">{contentKey}</p>

      <Textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        rows={rows}
        className="font-sans text-sm resize-none"
        data-ocid={`${ocidBase}.textarea`}
      />

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {hasDraft && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={!isDirty || setContent.isPending}
            className="font-sans font-medium text-xs"
            data-ocid={`${ocidBase}.save_draft_button`}
            title="Save as draft without publishing"
          >
            <FileClock className="h-3.5 w-3.5 mr-1.5" />
            Save as Draft
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || setContent.isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium text-xs"
          data-ocid={`${ocidBase}.save_button`}
        >
          {setContent.isPending ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5 mr-1.5" />
          )}
          Save
        </Button>
      </div>

      {/* Draft controls — only when draft is supported and exists */}
      {hasDraft && draftExists && (
        <div className="pt-2 border-t border-border/60 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDraftPreview((v) => !v)}
              className="font-sans font-medium text-xs"
              data-ocid={`${ocidBase}.preview_draft_button`}
            >
              {showDraftPreview ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 mr-1.5" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Preview Draft
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePublishDraft}
              disabled={setContent.isPending}
              className="font-sans font-medium text-xs text-green-700 border-green-300 hover:bg-green-50 hover:text-green-800"
              data-ocid={`${ocidBase}.publish_draft_button`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Publish Draft
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDiscardDraft}
              disabled={setContent.isPending}
              className="font-sans font-medium text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              data-ocid={`${ocidBase}.discard_draft_button`}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Discard Draft
            </Button>
          </div>

          {showDraftPreview && (
            <div
              className="rounded-md bg-muted/50 border border-amber-200 p-3"
              data-ocid={`${ocidBase}.draft_preview`}
            >
              <p className="font-sans text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-1">
                Draft preview
              </p>
              <p className="font-sans text-sm text-foreground whitespace-pre-wrap">
                {draftValue}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SeoField component ───────────────────────────────────────────────────────

function SeoFieldRow({
  field,
  initialValue,
}: {
  field: SeoField;
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [isDirty, setIsDirty] = useState(false);
  const setContent = useSetContent();
  const inputId = `seo-${field.key}`;

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
      await setContent.mutateAsync({ key: field.key, value });
      setIsDirty(false);
      toast.success(`"${field.label}" saved`);
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  }

  const ocidBase = `admin.seo.${field.key.replace(/_/g, "-")}`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={inputId}
          className="font-sans text-xs font-semibold text-foreground"
        >
          {field.label}
        </label>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="font-sans text-xs text-accent font-medium">
              Unsaved
            </span>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || setContent.isPending}
            className="h-7 px-2.5 font-sans font-medium text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid={`${ocidBase}.save_button`}
          >
            {setContent.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3 mr-1" />
            )}
            Save
          </Button>
        </div>
      </div>
      <p className="font-mono text-[10px] text-muted-foreground/70">
        {field.key}
      </p>
      {field.isTextarea ? (
        <Textarea
          id={inputId}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          rows={2}
          placeholder={field.placeholder}
          className="font-sans text-xs resize-none"
          data-ocid={`${ocidBase}.input`}
        />
      ) : (
        <Input
          id={inputId}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          className="font-sans text-xs h-8"
          data-ocid={`${ocidBase}.input`}
        />
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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
          {/* ── Existing content fields ── */}
          {CONTENT_KEYS.map((item) => (
            <ContentField
              key={item.key}
              contentKey={item.key}
              label={item.label}
              rows={item.rows}
              initialValue={contentMap.get(item.key) ?? ""}
              draftValue={contentMap.get(draftKey(item.key)) ?? ""}
            />
          ))}

          {/* ── SEO section ── */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="h-4 w-4 text-primary" />
              <h4 className="font-display text-lg font-bold text-foreground">
                SEO &amp; Metadata
              </h4>
            </div>
            <p className="font-sans text-sm text-muted-foreground mb-5">
              Control page titles, meta descriptions, and Open Graph settings
              for each public page. These improve search engine visibility and
              social sharing previews.
            </p>

            <div className="space-y-4" data-ocid="admin.seo.section">
              {SEO_PAGES.map(({ page, fields }) => (
                <div
                  key={page}
                  className="bg-card border border-border rounded-lg p-4"
                  data-ocid={`admin.seo.${page.toLowerCase().replace(/\s+/g, "-")}.panel`}
                >
                  <h5 className="font-sans text-sm font-semibold text-foreground mb-4">
                    {page}
                  </h5>
                  <div className="space-y-4">
                    {fields.map((field) => (
                      <SeoFieldRow
                        key={field.key}
                        field={field}
                        initialValue={contentMap.get(field.key) ?? ""}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
