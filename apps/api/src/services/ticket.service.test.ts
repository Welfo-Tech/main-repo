import { TicketStatus, TicketUrgency, UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../lib/errors.js";
import * as orgRepo from "../repositories/organization.repository.js";
import * as ticketRepo from "../repositories/ticket.repository.js";
import { editTicket, getTicket, listTickets, openTicket } from "./ticket.service.js";

vi.mock("../repositories/organization.repository.js");
vi.mock("../repositories/ticket.repository.js");

const actor = { id: "user-1", role: UserRole.ADMIN };

const mockOrg = {
  id: "org-1",
  name: "Apollo Hospitals Delhi",
  type: "HOSPITAL" as const,
  tier: "PREMIUM" as const,
  gstNumber: null,
  panNumber: null,
  paymentTermsDays: 30,
  website: null,
  notes: null,
  isActive: true,
  deletedAt: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const mockTicket = {
  id: "ticket-1",
  ticketNumber: "TKT-2026-0001",
  organizationId: "org-1",
  contactId: null,
  productId: null,
  reportedProblem: "Endoscope not transmitting image",
  urgency: TicketUrgency.HIGH,
  status: TicketStatus.OPEN,
  createdBy: "user-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  organization: { id: "org-1", name: "Apollo Hospitals Delhi" },
  contact: null,
  product: null,
};

beforeEach(() => vi.clearAllMocks());

describe("listTickets", () => {
  it("returns all tickets", async () => {
    vi.mocked(ticketRepo.findTickets).mockResolvedValue([mockTicket] as never);

    const result = await listTickets({}, actor);

    expect(result).toHaveLength(1);
    expect(result[0]!.ticketNumber).toBe("TKT-2026-0001");
    expect(ticketRepo.findTickets).toHaveBeenCalledWith({});
  });

  it("passes filters to repo", async () => {
    vi.mocked(ticketRepo.findTickets).mockResolvedValue([]);

    await listTickets({ status: TicketStatus.OPEN, orgId: "org-1" }, actor);

    expect(ticketRepo.findTickets).toHaveBeenCalledWith({
      status: TicketStatus.OPEN,
      orgId: "org-1",
    });
  });
});

describe("getTicket", () => {
  it("returns ticket when found", async () => {
    vi.mocked(ticketRepo.findTicketById).mockResolvedValue(mockTicket as never);

    const result = await getTicket("ticket-1", actor);

    expect(result.id).toBe("ticket-1");
    expect(result.organization.name).toBe("Apollo Hospitals Delhi");
  });

  it("throws NotFoundError when ticket does not exist", async () => {
    vi.mocked(ticketRepo.findTicketById).mockResolvedValue(null);

    await expect(getTicket("missing", actor)).rejects.toThrow(NotFoundError);
  });
});

describe("openTicket", () => {
  it("creates ticket after validating org", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(mockOrg);
    vi.mocked(ticketRepo.createTicket).mockResolvedValue(mockTicket as never);

    const result = await openTicket(
      {
        organizationId: "org-1",
        reportedProblem: "Endoscope not transmitting image",
        urgency: TicketUrgency.HIGH,
      },
      actor,
    );

    expect(result.ticketNumber).toBe("TKT-2026-0001");
    expect(ticketRepo.createTicket).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: "org-1", createdBy: "user-1" }),
    );
  });

  it("throws NotFoundError when org does not exist", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(null);

    await expect(
      openTicket({ organizationId: "missing-org", reportedProblem: "issue" }, actor),
    ).rejects.toThrow(NotFoundError);
    expect(ticketRepo.createTicket).not.toHaveBeenCalled();
  });
});

describe("editTicket", () => {
  it("updates ticket status", async () => {
    vi.mocked(ticketRepo.findTicketById).mockResolvedValue(mockTicket as never);
    vi.mocked(ticketRepo.updateTicket).mockResolvedValue({
      ...mockTicket,
      status: TicketStatus.INTAKE_RECEIVED,
    } as never);

    const result = await editTicket(
      "ticket-1",
      { status: TicketStatus.INTAKE_RECEIVED },
      actor,
    );

    expect(result.status).toBe(TicketStatus.INTAKE_RECEIVED);
    expect(ticketRepo.updateTicket).toHaveBeenCalledWith("ticket-1", {
      status: TicketStatus.INTAKE_RECEIVED,
    });
  });

  it("throws NotFoundError when ticket does not exist", async () => {
    vi.mocked(ticketRepo.findTicketById).mockResolvedValue(null);

    await expect(
      editTicket("missing", { status: TicketStatus.OPEN }, actor),
    ).rejects.toThrow(NotFoundError);
    expect(ticketRepo.updateTicket).not.toHaveBeenCalled();
  });
});
