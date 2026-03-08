# Manhattan Racquet Club

## Current State

Full-stack tennis club website with:
- Four public pages: Landing, About, Membership, Contact
- Admin dashboard at `/admin` (Internet Identity login, two-tier Superadmin/Admin)
- CMS for site text content, membership tiers, staff members, announcements
- No image management; no blob storage component installed
- Staff members have no photo field in the data model

## Requested Changes (Diff)

### Add
- **Blob storage component** for persistent, browser-accessible image storage
- **Image slots** for each public page section:
  - Landing page hero banner
  - About page banner
  - Membership page banner
  - Contact page banner
  - Per-staff-member photo (one per staff member)
- **Admin "Images" tab** in the dashboard where admins can upload/replace images for all slots
- **Default images** (already generated as static assets) shown until an admin uploads a custom one
- Backend: `imageKeys` map storing a named key → blob storage asset ID mapping, so the frontend can resolve which uploaded image to show for each slot
- Backend: `getImageKey(key)`, `setImageKey(key, assetId)` endpoints (admin-only write)
- Backend: add optional `photoKey` field to `StaffMember` type for per-staff photo blob key

### Modify
- `StaffMember` type: add `photoKey : ?Text` field (blob storage asset key, nullable)
- `createStaffMember` and `updateStaffMember`: accept optional `photoKey` parameter
- `initDefaultContent`: populate initial `imageKeys` map with placeholder values (empty, so default static images are shown)
- Public pages: display the appropriate image for each section (use uploaded blob URL if available, fall back to default static asset)
- About page: show staff member photos using blob URL or default static staff image
- Admin Staff tab: show current photo, allow uploading a new one per staff member

### Remove
- Nothing removed

## Implementation Plan

1. Select `blob-storage` Caffeine component
2. Regenerate backend (Motoko) to include:
   - `imageKeys` stable map (`Text → Text`) for named image slot → blob asset key
   - `getImageKey(key: Text) → ?Text` (public query)
   - `setImageKey(key: Text, assetId: Text) → ()` (admin only)
   - `StaffMember` type updated with `photoKey: ?Text`
   - Updated create/update staff endpoints with `photoKey` param
3. Frontend updates:
   - Install and wire blob-storage hooks from the component
   - Public pages: fetch image key via `getImageKey`, resolve to blob HTTP URL; fall back to static default
   - New `AdminImagesTab.tsx`: grid of all image slots (Landing Hero, About Banner, Membership Banner, Contact Banner, plus one slot per staff member photo), each with current image preview and upload button
   - Update `AdminStaffTab.tsx`: show staff photo, add upload button per staff member
   - Add "Images" tab to admin navigation
