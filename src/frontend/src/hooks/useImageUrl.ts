import { useEffect, useState } from "react";
import { useAllContent } from "./useQueries";
import { useStorageClient } from "./useStorageClient";

const SHA256_PREFIX = "sha256:";

function isValidHash(value: string): boolean {
  if (!value || !value.startsWith(SHA256_PREFIX)) return false;
  const hex = value.slice(SHA256_PREFIX.length);
  return hex.length === 64 && /^[0-9a-f]+$/i.test(hex);
}

/**
 * Resolves an image URL for a given content key.
 * If the content store contains a valid blob hash for that key, returns the
 * direct storage URL. Otherwise returns `defaultUrl`.
 */
export function useImageUrl(imgKey: string, defaultUrl: string): string {
  const { data: allContent } = useAllContent();
  const storageClient = useStorageClient();
  const [resolvedUrl, setResolvedUrl] = useState<string>(defaultUrl);

  useEffect(() => {
    if (!allContent) return;

    const contentMap = new Map<string, string>(allContent);
    const hash = contentMap.get(imgKey);

    if (!hash || !isValidHash(hash)) {
      setResolvedUrl(defaultUrl);
      return;
    }

    if (!storageClient.available) {
      setResolvedUrl(defaultUrl);
      return;
    }

    let cancelled = false;
    storageClient
      .getURL(hash)
      .then((url) => {
        if (!cancelled) setResolvedUrl(url);
      })
      .catch(() => {
        if (!cancelled) setResolvedUrl(defaultUrl);
      });

    return () => {
      cancelled = true;
    };
  }, [allContent, imgKey, defaultUrl, storageClient]);

  return resolvedUrl;
}
