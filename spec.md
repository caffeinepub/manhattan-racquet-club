# Manhattan Racquet Club

## Current State

New project. No existing frontend or backend code.

## Requested Changes (Diff)

### Add

**Public Website:**
- Landing page: hero section, welcome text, club highlights
- About page: club history, mission, coaching staff bios
- Membership page: tiered plans (Junior, Adult, Family) with pricing and benefits
- Contact page: club address (Manhattan, NYC), phone, email, embedded map placeholder, contact form

**Admin CMS Dashboard (`/admin`):**
- Protected by Internet Identity login (admin-only)
- Manage all site content: hero text, about text, membership tiers, contact details
- Manage announcements/news items shown on the landing page
- CRUD for coaching staff bios
- Edit membership tier details (name, price, benefits list)

**Default Content:**
- Club name: The Manhattan Racquet Club
- Fictional NYC address (e.g. 42 Park Avenue, New York, NY 10016)
- Placeholder phone and email
- 3 default membership tiers: Junior ($49/mo), Adult ($99/mo), Family ($149/mo)
- 3 default coaching staff members with bios
- Welcome/hero copy with NYC tennis flavor

### Modify

None (new project).

### Remove

None.

## Implementation Plan

**Backend (Motoko):**
- `SiteContent` stable store: key-value pairs for landing/about/contact page text fields
- `MembershipTier` entity: id, name, price, benefits (list of strings), order
- `Staff` entity: id, name, role, bio, order
- `Announcement` entity: id, title, body, date, published bool
- Admin authorization: only the canister controller / designated admin principal can call mutating methods
- Seed default data on first deploy

**Frontend (React):**
- React Router with routes: `/`, `/about`, `/membership`, `/contact`, `/admin`
- Shared nav component with links to all public pages
- Public pages render content fetched from backend
- `/admin` route: Internet Identity login gate, then CMS dashboard with tabs for each content section
- Admin forms for editing all content sections with save/update controls
- Responsive layout, clean tennis club aesthetic
