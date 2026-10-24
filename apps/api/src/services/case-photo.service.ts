import { type AttachmentCategory } from "@repo/db";
import { ServiceUnavailableError, ValidationError } from "../lib/errors.js";
import { logger } from "../logger.js";
import { type UploadTarget, createUploadTargetsAt, publicUrlFor } from "../lib/storage.js";
import type { AuthUser } from "../middleware/auth.js";
import {
  createCaseAttachments,
  findCaseAttachments,
  findInquiryPhotosForCase,
} from "../repositories/attachment.repository.js";
import { requireCaseForActor } from "./service-case.service.js";

const MAX_PER_BATCH = 8;

export interface CasePhotos {
  customer: { source: string; url: string }[];
  technician: {
    id: string;
    category: AttachmentCategory;
    url: string;
    fileName: string;
    uploadedAt: Date;
    uploadedBy: string;
  }[];
}

export async function listCasePhotos(caseId: string, actor: AuthUser): Promise<CasePhotos> {
  await requireCaseForActor(caseId, actor);

  const [inquiry, attachments] = await Promise.all([
    findInquiryPhotosForCase(caseId),
    findCaseAttachments(caseId),
  ]);

  return {
    customer: (inquiry?.photoPaths ?? [])
      .map(p => ({ source: inquiry!.inquiryNumber, url: publicUrlFor(p) }))
      .filter((p): p is { source: string; url: string } => p.url !== null),
    technician: attachments.map(a => ({
      id: a.id,
      category: a.category,
      url: a.fileUrl,
      fileName: a.fileName,
      uploadedAt: a.uploadedAt,
      uploadedBy: a.uploader.name,
    })),
  };
}

export async function createCasePhotoUploads(
  caseId: string,
  input: { fileNames: string[]; category?: AttachmentCategory },
  actor: AuthUser,
): Promise<{ uploads: UploadTarget[] }> {
  await requireCaseForActor(caseId, actor);

  if (input.fileNames.length === 0) {
    throw new ValidationError("no files supplied");
  }
  if (input.fileNames.length > MAX_PER_BATCH) {
    throw new ValidationError(`at most ${MAX_PER_BATCH} photos per upload`);
  }

  const category = input.category ?? "DIAGNOSIS_PHOTO";

  // Storage lives behind a third party that can be paused or unreachable.
  // Surface that as a clear, retryable message rather than an opaque 500.
  let uploads;
  try {
    uploads = await createUploadTargetsAt(
      `cases/${caseId}/${category.toLowerCase()}`,
      input.fileNames,
    );
  } catch (err) {
    logger.warn({ err, caseId }, "photo storage unreachable");
    throw new ServiceUnavailableError(
      "photo storage is unavailable right now — your other changes still saved, please try the photos again shortly",
    );
  }

  if (uploads.length === 0) {
    throw new ServiceUnavailableError("photo storage is not configured");
  }

  await createCaseAttachments(
    uploads.map((u, i) => ({
      caseId,
      category,
      fileUrl: u.publicUrl,
      fileName: input.fileNames[i] ?? u.path.split("/").pop()!,
      mimeType: "image/jpeg",
      uploadedBy: actor.id,
    })),
  );

  return { uploads };
}
