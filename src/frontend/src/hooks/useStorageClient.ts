import { HttpAgent } from "@icp-sdk/core/agent";
import { useMemo } from "react";
import envJson from "../../env.json";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

function getEnvValue(key: string): string | null {
  const val = (envJson as Record<string, string>)[key];
  return val && val !== "undefined" ? val : null;
}

function getBackendHost(): string | null {
  // env.json first (populated at build time for production)
  const fromEnv = getEnvValue("backend_host");
  if (fromEnv) return fromEnv;
  // In Caffeine production builds, DFX_NETWORK=ic
  const network = (import.meta.env.DFX_NETWORK as string | undefined) ?? "";
  if (network === "ic") return "https://icp0.io";
  // If we have a valid canister ID, we must be in production on ICP mainnet
  const canisterId = getBackendCanisterId();
  if (canisterId) return "https://icp0.io";
  return null;
}

function getBackendCanisterId(): string | null {
  const fromEnv = getEnvValue("backend_canister_id");
  if (fromEnv) return fromEnv;
  // Vite injects CANISTER_ID_BACKEND during production build
  const fromVite = import.meta.env.CANISTER_ID_BACKEND as string | undefined;
  if (fromVite && fromVite !== "undefined") return fromVite;
  return null;
}

function getProjectId(): string | null {
  const fromEnv = getEnvValue("project_id");
  if (fromEnv) return fromEnv;
  // Fall back to backend canister id as the project id
  return getBackendCanisterId();
}

function isStorageAvailable(): boolean {
  return !!getBackendHost() && !!getBackendCanisterId() && !!getProjectId();
}

function getStorageGatewayUrl(): string {
  // STORAGE_GATEWAY_URL is injected by Vite (set to https://blob.caffeine.ai in vite.config.js)
  const fromVite = import.meta.env.STORAGE_GATEWAY_URL as string | undefined;
  if (fromVite && fromVite !== "undefined") return fromVite;
  const fromEnv = getEnvValue("storage_gateway_url");
  if (fromEnv) return fromEnv;
  return "https://blob.caffeine.ai";
}

export interface StorageClientHook {
  available: boolean;
  upload: (
    bytes: Uint8Array,
    onProgress?: (pct: number) => void,
  ) => Promise<string>;
  getURL: (hash: string) => Promise<string>;
}

export function useStorageClient(): StorageClientHook {
  const { identity } = useInternetIdentity();

  const client = useMemo<StorageClientHook>(() => {
    const available = isStorageAvailable();

    if (!available) {
      return {
        available: false,
        upload: async () => {
          throw new Error("Storage is not available in preview mode");
        },
        getURL: async () => {
          throw new Error("Storage is not available in preview mode");
        },
      };
    }

    const host = getBackendHost()!;
    const backendCanisterId = getBackendCanisterId()!;
    const projectId = getProjectId()!;
    const storageGatewayUrl = getStorageGatewayUrl();

    async function createClient(withIdentity: boolean): Promise<StorageClient> {
      const agentOptions = withIdentity && identity ? { identity } : {};
      const agent = await HttpAgent.create({ host, ...agentOptions });
      return new StorageClient(
        "default",
        storageGatewayUrl,
        backendCanisterId,
        projectId,
        agent,
      );
    }

    return {
      available: true,
      upload: async (bytes, onProgress) => {
        const sc = await createClient(true);
        const result = await sc.putFile(bytes, onProgress);
        return result.hash;
      },
      getURL: async (hash) => {
        const sc = await createClient(false);
        return sc.getDirectURL(hash);
      },
    };
  }, [identity]);

  return client;
}
