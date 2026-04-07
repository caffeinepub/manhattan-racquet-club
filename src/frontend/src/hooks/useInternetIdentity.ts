// Re-export from the platform package so local imports work.
// This file must exist because useActor and AdminPage import from "./useInternetIdentity".
export {
  useInternetIdentity,
  InternetIdentityProvider,
  type InternetIdentityContext,
  type Status,
} from "@caffeineai/core-infrastructure";
