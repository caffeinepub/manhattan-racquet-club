# Manhattan Racquet Club

## Current State

A public-facing website for the fictional NYC-based Manhattan Racquet Club with four public pages (Landing, About, Membership, Contact) and an admin dashboard at `/admin`. The admin dashboard supports Internet Identity login, two-tier access control (Superadmin / Admin), CMS for all site content, and image management via Caffeine blob storage.

Three critical bugs are currently present and unresolved:

1. **Admin lockout** -- `useActor.ts` calls `actor._initializeAccessControlWithSecret(adminToken)` on every authenticated actor creation. This call traps the backend for any user whose principal is not in the role map, causing "Access denied" on login.

2. **Admin lockout (backend)** -- `access-control.mo` `getUserRole` calls `Runtime.trap("User is not registered")` for unknown principals instead of returning `#guest`. Any unrecognized caller traps the canister, blocking login.

3. **Image upload 403** -- `config.ts` contains two bad fallbacks: `DEFAULT_PROJECT_ID = "0000000-0000-0000-0000-00000000000"` (malformed UUID rejected by blob gateway) and `storage_gateway_url: process.env.STORAGE_GATEWAY_URL ?? "nogateway"`. Both fallbacks send invalid data to the storage gateway, producing a 403 Forbidden response.

`build.sh` currently has no safeguards to prevent these bugs from recurring.

## Requested Changes (Diff)

### Add
- Permanent safeguards in `build.sh` that strip the `_initializeAccessControlWithSecret` call from `useActor.ts` and any `DEFAULT_PROJECT_ID` / `"nogateway"` patterns from `config.ts` on every build.

### Modify
- `access-control.mo`: `getUserRole` must return `#guest` for unknown principals instead of calling `Runtime.trap`.
- `useActor.ts`: Remove the `await actor._initializeAccessControlWithSecret(adminToken)` call entirely.
- `config.ts`: Remove `DEFAULT_PROJECT_ID` constant. In the main config path, fall back `project_id` to `resolvedCanisterId` (actual canister ID). In the catch block, fall back `project_id` to `backendCanisterId`. Fix `storage_gateway_url` to use `DEFAULT_STORAGE_GATEWAY_URL` (`https://blob.caffeine.ai`) in both paths instead of `"nogateway"` or `DEFAULT_PROJECT_ID`.

### Remove
- `DEFAULT_PROJECT_ID` constant from `config.ts` -- must not exist anywhere in the file.
- `_initializeAccessControlWithSecret` call from `useActor.ts`.

## Implementation Plan

1. Regenerate Motoko backend with `getUserRole` returning `#guest` for unknown principals (no trap).
2. Edit `useActor.ts` to remove the `_initializeAccessControlWithSecret` call.
3. Edit `config.ts` to remove `DEFAULT_PROJECT_ID` and fix both fallback paths.
4. Edit `build.sh` to add two sed-based safeguards that enforce the above fixes on every build, before frontend compilation.
5. Validate frontend build passes.
6. Deploy to draft, then to production.
