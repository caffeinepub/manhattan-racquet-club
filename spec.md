# Manhattan Racquet Club

## Current State

Full-stack tennis club website with:
- Public pages: Landing, About, Membership, Contact
- Admin dashboard at `/admin` with tabs: Site Content, Membership Tiers, Staff, Announcements, Admins
- Two-tier admin system: regular Admin (manage content) and Superadmin (manage content + manage admins)
- `claimFirstAdmin()` function: first login claims admin and superadmin
- `hasAdminAssigned` stable var tracks whether any admin exists
- `superAdmins` map (non-stable, restored in postupgrade from `stableSuperAdmins`)
- Stable storage arrays persist all data across upgrades

## Requested Changes (Diff)

### Add
- Migration guard in `postupgrade`: if `superAdmins` map is empty after restore but there are admins in `userRoles`, promote ALL existing admins to superadmin. This ensures no admin loses superadmin status after a deployment.
- Enforce invariant: there must always be at least 1 superadmin. The `setSuperAdmin` demote operation must check that at least 1 superadmin will remain after demotion, and the remove admin operation must check the same.

### Modify
- `claimFirstAdmin()`: already sets caller as superadmin — keep this behavior, ensure it's robust.
- `setSuperAdmin` with `promote=false` (demote): before removing from superAdmins, verify at least 1 other superadmin exists; trap with a clear message if not.
- `assignCallerUserRoleWithSuperAdminCheck` (remove admin via role=#user): before removing, verify at least 1 superadmin will remain; trap if not.
- `postupgrade`: add migration guard as described in Add section.

### Remove
- Nothing removed.

## Implementation Plan

1. Backend (Motoko): Regenerate with all existing functionality plus:
   - Migration guard in `postupgrade`: if `superAdmins.size() == 0` after restore, iterate userRoles and add all `#admin` principals to superAdmins.
   - `setSuperAdmin` demote guard: count remaining superadmins after proposed demotion; if count would be 0, trap("Cannot demote: at least one Superadmin must always exist").
   - Remove admin guard in `assignCallerUserRoleWithSuperAdminCheck`: if role is `#user` (removal), check that the target is not the last superadmin; if they are, trap("Cannot remove: at least one Superadmin must always exist").
   - Keep all other backend behavior identical.

2. Frontend: No changes needed -- error messages from backend traps already surface in the UI via existing error handling in AdminAdminsTab.
