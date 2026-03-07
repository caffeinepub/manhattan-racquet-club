# Manhattan Racquet Club

## Current State

A tennis club website with four public pages (Landing, About, Membership, Contact) and an admin CMS dashboard at `/admin`. The backend includes authorization (access-control mixin), site content management, membership tiers, staff members, and announcements. The admin dashboard has tabs for Site Content, Membership, Staff, and Announcements.

Currently, admin access requires a special token/secret to bootstrap the first admin. There is no way to manage (list, add, remove) admins from the dashboard.

## Requested Changes (Diff)

### Add
- Backend: `registerCaller` function -- any authenticated (non-anonymous) caller can call this to register themselves; the very first one automatically becomes admin, all subsequent ones become regular users.
- Backend: `listAdmins` query -- returns `[Principal]` of all current admins. Admin-only.
- Backend: `addAdmin(user: Principal)` -- promotes a user to admin. Admin-only.
- Backend: `removeAdmin(user: Principal)` -- demotes an admin to user. Admin-only. Must not allow removing yourself if you are the last admin.
- Frontend: New "Admins" tab in the CMS dashboard, visible only to admins.
  - Shows a list of current admins (with their Principal IDs).
  - Allows adding a new admin by entering a Principal ID (text input + Add button).
  - Allows removing any admin from the list (with a confirmation step), but prevents removing yourself if you're the only admin.

### Modify
- Backend: The login/auth flow should call `registerCaller` on first visit so the first person to log in automatically becomes admin -- no secret/token needed for this bootstrap step.
- Frontend: AdminPage should call `registerCaller` after login (once) before checking `isCallerAdmin`, so new users are auto-registered and the first one gets admin rights.

### Remove
- Nothing removed from existing features.

## Implementation Plan

1. Regenerate Motoko backend with:
   - `registerCaller` public shared function (auto-promotes first caller to admin)
   - `listAdmins` query (admin-only, returns [Principal])
   - `addAdmin(user: Principal)` shared function (admin-only)
   - `removeAdmin(user: Principal)` shared function (admin-only, must keep at least one admin)
   - All existing functionality preserved

2. Update `backend.d.ts` to include new function signatures.

3. Add frontend hooks in `useQueries.ts`:
   - `useRegisterCaller` mutation
   - `useListAdmins` query
   - `useAddAdmin` mutation
   - `useRemoveAdmin` mutation

4. Call `registerCaller` in `AdminPage` after identity is available and before checking admin status.

5. Add `AdminAdminsTab` component with:
   - List of current admins
   - Add admin form (Principal input + Add button)
   - Remove button per admin (with AlertDialog confirmation)
   - Guard: cannot remove self if last admin

6. Wire "Admins" tab into the dashboard `TabsList` and `TabsContent`.
