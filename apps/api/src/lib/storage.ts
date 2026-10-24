import { config } from "../config.js";

export interface UploadTarget {
  path: string;
  uploadUrl: string;
  publicUrl: string;
}

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic"]);

export function isStorageConfigured(): boolean {
  return Boolean(config.SUPABASE_URL && config.SUPABASE_SECRET_KEY);
}

function safeExtension(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_EXTENSIONS.has(ext) ? ext : "jpg";
}

/**
 * Signs upload URLs under an arbitrary prefix. Callers pass a prefix rather
 * than an id so inquiry photos and case attachments stay in separate trees.
 * A uniqueness suffix keeps a second upload batch from overwriting the first.
 */
export async function createUploadTargetsAt(
  prefix: string,
  fileNames: string[],
): Promise<UploadTarget[]> {
  if (!isStorageConfigured()) return [];

  const base = config.SUPABASE_URL!.replace(/\/$/, "");
  const bucket = config.SUPABASE_BUCKET;
  const batch = Date.now().toString(36);

  return Promise.all(
    fileNames.map(async (fileName, index) => {
      const path = `${prefix}/${batch}-${index + 1}.${safeExtension(fileName)}`;

      const res = await fetch(
        `${base}/storage/v1/object/upload/sign/${bucket}/${path}`,
        {
          method: "POST",
          headers: {
            apikey: config.SUPABASE_SECRET_KEY!,
            Authorization: `Bearer ${config.SUPABASE_SECRET_KEY!}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ expiresIn: 600 }),
        },
      );

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`could not create upload url: ${res.status} ${detail}`);
      }

      const body = (await res.json()) as { url: string };

      return {
        path,
        uploadUrl: `${base}/storage/v1${body.url}`,
        publicUrl: `${base}/storage/v1/object/public/${bucket}/${path}`,
      };
    }),
  );
}

export async function createUploadTargets(
  inquiryId: string,
  fileNames: string[],
): Promise<UploadTarget[]> {
  if (!isStorageConfigured()) return [];

  const base = config.SUPABASE_URL!.replace(/\/$/, "");
  const bucket = config.SUPABASE_BUCKET;

  return Promise.all(
    fileNames.map(async (fileName, index) => {
      const path = `inquiries/${inquiryId}/${index + 1}.${safeExtension(fileName)}`;

      const res = await fetch(
        `${base}/storage/v1/object/upload/sign/${bucket}/${path}`,
        {
          method: "POST",
          headers: {
            apikey: config.SUPABASE_SECRET_KEY!,
            Authorization: `Bearer ${config.SUPABASE_SECRET_KEY!}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ expiresIn: 600 }),
        },
      );

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`could not create upload url: ${res.status} ${detail}`);
      }

      const body = (await res.json()) as { url: string };

      return {
        path,
        uploadUrl: `${base}/storage/v1${body.url}`,
        publicUrl: `${base}/storage/v1/object/public/${bucket}/${path}`,
      };
    }),
  );
}

export function publicUrlFor(path: string): string | null {
  if (!config.SUPABASE_URL) return null;
  const base = config.SUPABASE_URL.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${config.SUPABASE_BUCKET}/${path}`;
}
