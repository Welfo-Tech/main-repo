export type RepairEventType =
  | "OBSERVATION"
  | "PART_REPLACED"
  | "TEST_PERFORMED"
  | "FAULT_IDENTIFIED"
  | "NOTE"
  | "CORRECTION";

export type DispatchDirection = "INBOUND" | "OUTBOUND";

export type DispatchStatus =
  | "PENDING"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED";

export interface Technician {
  id: string;
  employeeId: string;
  phone: string | null;
  specializations: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string };
}

export interface RepairEvent {
  id: string;
  caseId: string;
  eventType: RepairEventType;
  description: string;
  eventAt: string;
  createdAt: string;
  technician: {
    id: string;
    employeeId: string;
    user: { id: string; name: string };
  };
}

export interface DispatchRecord {
  id: string;
  caseId: string;
  direction: DispatchDirection;
  courierName: string | null;
  trackingNumber: string | null;
  dispatchDate: string | null;
  expectedDelivery: string | null;
  actualDelivery: string | null;
  fromAddress: Record<string, string> | null;
  toAddress: Record<string, string> | null;
  conditionNotes: string | null;
  status: DispatchStatus;
}

export const REPAIR_EVENT_LABELS: Record<RepairEventType, string> = {
  OBSERVATION:     "Observation",
  PART_REPLACED:   "Part Replaced",
  TEST_PERFORMED:  "Test Performed",
  FAULT_IDENTIFIED: "Fault Identified",
  NOTE:            "Note",
  CORRECTION:      "Correction",
};

export const DISPATCH_STATUS_LABELS: Record<DispatchStatus, string> = {
  PENDING:    "Pending",
  DISPATCHED: "Dispatched",
  IN_TRANSIT: "In Transit",
  DELIVERED:  "Delivered",
  FAILED:     "Failed",
  RETURNED:   "Returned",
};

export const DISPATCH_STATUS_TRANSITIONS: Record<DispatchStatus, DispatchStatus[]> = {
  PENDING:    ["DISPATCHED"],
  DISPATCHED: ["IN_TRANSIT", "FAILED"],
  IN_TRANSIT: ["DELIVERED", "FAILED"],
  DELIVERED:  [],
  FAILED:     ["RETURNED"],
  RETURNED:   [],
};
