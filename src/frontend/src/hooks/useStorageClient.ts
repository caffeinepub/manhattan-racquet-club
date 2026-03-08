import { HttpAgent } from "@icp-sdk/core/agent";
import { useMemo } from "react";
import envJson from "../../env.json";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

function getEnvValue(key: string): string | null {
  const val = (envJson as Record<string, string>)[key];
  return val && val !== "undefined" ? val : null;
}

function isStorageAvailable(): boolean {
  return (
    !!getEnvValue("backend_host") &&
    !!getEnvValue("backend_canister_id") &&
    !!getEnvValue("project_id")
  );
}

function getStorageGatewayUrl(host: string): string {
  // Derive storage gateway from backend host
  const storageUrl = getEnvValue("storage_gateway_url");
  if (storageUrl) return storageUrl;

  // If backend host ends with icp0.io or icp-api.io, use the caffeine storage gateway
  // pattern. Otherwise construct from host.
  try {
    const url = new URL(host);
    // Try: replace host with storage gateway
    return `${url.protocol}//${url.hostname}/storage`;
  } catch {
    return `${host}/storage`;
  }
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

    const host = getEnvValue("backend_host")!;
    const backendCanisterId = getEnvValue("backend_canister_id")!;
    const projectId = getEnvValue("project_id")!;
    const storageGatewayUrl = getStorageGatewayUrl(host);

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
