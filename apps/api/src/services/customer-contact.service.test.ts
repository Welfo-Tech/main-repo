import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../lib/errors.js";
import * as contactRepo from "../repositories/customer-contact.repository.js";
import * as orgRepo from "../repositories/organization.repository.js";
import { addContact, editContact, getContact, listContacts, removeContact } from "./customer-contact.service.js";

vi.mock("../repositories/customer-contact.repository.js");
vi.mock("../repositories/organization.repository.js");

const actor = { id: "user-1", role: UserRole.ADMIN };
const orgId = "org-1";

const mockOrg = {
  id: orgId,
  name: "City General Hospital",
  type: "HOSPITAL",
  tier: "STANDARD",
  gstNumber: null,
  panNumber: null,
  paymentTermsDays: 30,
  website: null,
  notes: null,
  isActive: true,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const mockContact = {
  id: "contact-1",
  organizationId: orgId,
  name: "Dr. Sharma",
  designation: "Head of Procurement",
  email: "sharma@cityhospital.in",
  phone: "+91-9876543210",
  isPrimary: true,
  isActive: true,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

beforeEach(() => vi.clearAllMocks());

describe("listContacts", () => {
  it("returns contacts for org", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(mockOrg as never);
    vi.mocked(contactRepo.findContactsByOrgId).mockResolvedValue([mockContact]);

    const result = await listContacts(orgId, actor);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Dr. Sharma");
    expect(contactRepo.findContactsByOrgId).toHaveBeenCalledWith(orgId);
  });

  it("throws NotFoundError when org does not exist", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(null);

    await expect(listContacts("missing-org", actor)).rejects.toThrow(NotFoundError);
    expect(contactRepo.findContactsByOrgId).not.toHaveBeenCalled();
  });
});

describe("getContact", () => {
  it("returns contact when found", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(mockOrg as never);
    vi.mocked(contactRepo.findContactById).mockResolvedValue(mockContact);

    const result = await getContact("contact-1", orgId, actor);

    expect(result.id).toBe("contact-1");
    expect(result.name).toBe("Dr. Sharma");
  });

  it("throws NotFoundError when contact does not exist", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(mockOrg as never);
    vi.mocked(contactRepo.findContactById).mockResolvedValue(null);

    await expect(getContact("missing", orgId, actor)).rejects.toThrow(NotFoundError);
  });
});

describe("addContact", () => {
  it("creates and returns new contact", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(mockOrg as never);
    vi.mocked(contactRepo.createContact).mockResolvedValue(mockContact);

    const result = await addContact(orgId, { name: "Dr. Sharma", isPrimary: true }, actor);

    expect(result.name).toBe("Dr. Sharma");
    expect(contactRepo.createContact).toHaveBeenCalledWith(orgId, { name: "Dr. Sharma", isPrimary: true });
  });

  it("throws NotFoundError when org does not exist", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(null);

    await expect(addContact("missing-org", { name: "Test" }, actor)).rejects.toThrow(NotFoundError);
    expect(contactRepo.createContact).not.toHaveBeenCalled();
  });
});

describe("editContact", () => {
  it("updates and returns contact", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(mockOrg as never);
    vi.mocked(contactRepo.findContactById).mockResolvedValue(mockContact);
    vi.mocked(contactRepo.updateContact).mockResolvedValue({ ...mockContact, designation: "Director" });

    const result = await editContact("contact-1", orgId, { designation: "Director" }, actor);

    expect(result.designation).toBe("Director");
    expect(contactRepo.updateContact).toHaveBeenCalledWith("contact-1", orgId, { designation: "Director" });
  });

  it("throws NotFoundError when contact does not exist", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(mockOrg as never);
    vi.mocked(contactRepo.findContactById).mockResolvedValue(null);

    await expect(editContact("missing", orgId, { name: "New" }, actor)).rejects.toThrow(NotFoundError);
    expect(contactRepo.updateContact).not.toHaveBeenCalled();
  });
});

describe("removeContact", () => {
  it("soft-deletes the contact", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(mockOrg as never);
    vi.mocked(contactRepo.findContactById).mockResolvedValue(mockContact);
    vi.mocked(contactRepo.softDeleteContact).mockResolvedValue({ id: "contact-1" });

    await removeContact("contact-1", orgId, actor);

    expect(contactRepo.softDeleteContact).toHaveBeenCalledWith("contact-1");
  });

  it("throws NotFoundError when contact does not exist", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(mockOrg as never);
    vi.mocked(contactRepo.findContactById).mockResolvedValue(null);

    await expect(removeContact("missing", orgId, actor)).rejects.toThrow(NotFoundError);
    expect(contactRepo.softDeleteContact).not.toHaveBeenCalled();
  });
});
