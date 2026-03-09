import { HttpAgent } from "@icp-sdk/core/agent";
import { useEffect, useMemo, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

const DEFAULT_STORAGE_GATEWAY_URL = "https://blob.caffeine.ai";

interface ResolvedConfig {
  backendCanisterId: string;
  host: string;
  storageGatewayUrl: string;
  projectId: string;
  bucketName: string;
}

export interface StorageClientHook {
  available: boolean;
  upload: (
    bytes: Uint8Array,
    onProgress?: (pct: number) => void,
  ) => Promise<string>;
  getURL: (hash: string) => Promise<string>;
}

const unavailable: StorageClientHook = {
  available: false,
  upload: async () => {
    throw new Error("Storage is not available in preview mode");
  },
  getURL: async () => {
    throw new Error("Storage is not available in preview mode");
  },
};

export function useStorageClient(): StorageClientHook {
  const { identity } = useInternetIdentity();
  const [resolvedConfig, setResolvedConfig] = useState<ResolvedConfig | null>(
    null,
  );

  useEffect(() => {
    loadConfig()
      .then((cfg) => {
        if (!cfg.backend_canister_id) return;
        setResolvedConfig({
          backendCanisterId: cfg.backend_canister_id,
          host: cfg.backend_host ?? "https://icp0.io",
          storageGatewayUrl:
            cfg.storage_gateway_url &&
            cfg.storage_gateway_url !== "undefined" &&
            cfg.storage_gateway_url !== "nogateway"
              ? cfg.storage_gateway_url
              : DEFAULT_STORAGE_GATEWAY_URL,
          projectId: cfg.project_id ?? cfg.backend_canister_id,
          bucketName: cfg.bucket_name,
        });
      })
      .catch(() => {
        /* storage unavailable */
      });
  }, []);

  return useMemo<StorageClientHook>(() => {
    if (!resolvedConfig) return unavailable;

    const {
      backendCanisterId,
      host,
      storageGatewayUrl,
      projectId,
      bucketName,
    } = resolvedConfig;

    async function createClient(withIdentity: boolean): Promise<StorageClient> {
      const agentOptions = withIdentity && identity ? { identity } : {};
      const agent = await HttpAgent.create({ host, ...agentOptions });
      return new StorageClient(
        bucketName,
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
  }, [resolvedConfig, identity]);
}
