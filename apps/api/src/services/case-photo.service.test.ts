import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceUnavailableError } from "../lib/errors.js";
import * as storage from "../lib/storage.js";
import * as attachmentRepo from "../repositories/attachment.repository.js";
import * as caseService from "./service-case.service.js";
import { createCasePhotoUploads, listCasePhotos } from "./case-photo.service.js";

vi.mock("../lib/storage.js");
vi.mock("../repositories/attachment.repository.js");
vi.mock("./service-case.service.js");

const techActor = { id: "tech-user-1", role: UserRole.TECHNICIAN };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(caseService.requireCaseForActor).mockResolvedValue({ id: "case-1" } as never);
});

describe("createCasePhotoUploads", () => {
  it("reports storage being down as retryable, not as a crash", async () => {
    vi.mocked(storage.createUploadTargetsAt).mockRejectedValue(
      new TypeError("fetch failed: getaddrinfo ENOTFOUND project.supabase.co"),
    );

    await expect(
      createCasePhotoUploads("case-1", { fileNames: ["a.jpg"] }, techActor),
    ).rejects.toBeInstanceOf(ServiceUnavailableError);
  });

  it("reports unconfigured storage as unavailable too", async () => {
    vi.mocked(storage.createUploadTargetsAt).mockResolvedValue([]);

    await expect(
      createCasePhotoUploads("case-1", { fileNames: ["a.jpg"] }, techActor),
    ).rejects.toBeInstanceOf(ServiceUnavailableError);
  });

  it("records attachments when storage works", async () => {
    vi.mocked(storage.createUploadTargetsAt).mockResolvedValue([
      { path: "cases/case-1/diagnosis_photo/x-1.jpg", uploadUrl: "https://s/u", publicUrl: "https://s/p.jpg" },
    ]);
    vi.mocked(attachmentRepo.createCaseAttachments).mockResolvedValue([] as never);

    const result = await createCasePhotoUploads("case-1", { fileNames: ["tip.jpg"] }, techActor);

    expect(result.uploads).toHaveLength(1);
    expect(attachmentRepo.createCaseAttachments).toHaveBeenCalledWith([
      expect.objectContaining({ category: "DIAGNOSIS_PHOTO", uploadedBy: "tech-user-1" }),
    ]);
  });
});

describe("listCasePhotos", () => {
  it("copes with a customer who sent no photos", async () => {
    vi.mocked(attachmentRepo.findInquiryPhotosForCase).mockResolvedValue(null);
    vi.mocked(attachmentRepo.findCaseAttachments).mockResolvedValue([] as never);

    const photos = await listCasePhotos("case-1", techActor);
    expect(photos.customer).toEqual([]);
    expect(photos.technician).toEqual([]);
  });
});
