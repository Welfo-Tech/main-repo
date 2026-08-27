type Category = "neutral" | "progress" | "waiting" | "attention" | "success" | "terminal";

interface StatusConfig {
  category: Category;
  label: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  DRAFT:                    { category: "neutral",   label: "Draft" },
  OPEN:                     { category: "progress",  label: "Open" },
  IN_PROGRESS:              { category: "progress",  label: "In Progress" },
  PENDING_PARTS:            { category: "waiting",   label: "Pending Parts" },
  WAITING_FOR_CUSTOMER:     { category: "waiting",   label: "Waiting — Customer" },
  WAITING_FOR_VENDOR:       { category: "waiting",   label: "Waiting — Vendor" },
  PENDING_APPROVAL:         { category: "waiting",   label: "Pending Approval" },
  APPROVED:                 { category: "success",   label: "Approved" },
  REJECTED:                 { category: "attention", label: "Rejected" },
  ESCALATED:                { category: "attention", label: "Escalated" },
  ON_HOLD:                  { category: "waiting",   label: "On Hold" },
  RESOLVED:                 { category: "success",   label: "Resolved" },
  CLOSED:                   { category: "terminal",  label: "Closed" },
  CANCELLED:                { category: "terminal",  label: "Cancelled" },
  VOIDED:                   { category: "terminal",  label: "Voided" },
  SENT:                     { category: "progress",  label: "Sent" },
  ACCEPTED:                 { category: "success",   label: "Accepted" },
  CONVERTED:                { category: "success",   label: "Converted" },
  PAID:                     { category: "success",   label: "Paid" },
  PARTIALLY_PAID:           { category: "waiting",   label: "Partial" },
  OVERDUE:                  { category: "attention", label: "Overdue" },
  ACTIVE:                   { category: "progress",  label: "Active" },
  INACTIVE:                 { category: "neutral",   label: "Inactive" },
  DECOMMISSIONED:           { category: "terminal",  label: "Decommissioned" },
  UNDER_WARRANTY:           { category: "success",   label: "Under Warranty" },
  OUT_OF_WARRANTY:          { category: "neutral",   label: "Out of Warranty" },
  VERIFIED:                 { category: "success",   label: "Verified" },
  PENDING:                  { category: "waiting",   label: "Pending" },
  FAILED:                   { category: "attention", label: "Failed" },
  REFUNDED:                 { category: "terminal",  label: "Refunded" },

  INTAKE:                   { category: "neutral",   label: "Intake" },
  ASSIGNED:                 { category: "progress",  label: "Assigned" },
  UNDER_ASSESSMENT:         { category: "progress",  label: "Under Assessment" },
  AWAITING_QUOTE_APPROVAL:  { category: "waiting",   label: "Awaiting Quote" },
  WORK_AUTHORIZED:          { category: "progress",  label: "Work Authorized" },
  IN_REPAIR:                { category: "progress",  label: "In Repair" },
  QC_PENDING:               { category: "waiting",   label: "QC Pending" },
  QC_PASSED:                { category: "success",   label: "QC Passed" },
  QC_FAILED:                { category: "attention", label: "QC Failed" },
  DISPATCH_READY:           { category: "success",   label: "Dispatch Ready" },
  DISPATCHED:               { category: "progress",  label: "Dispatched" },
  IN_TRANSIT:               { category: "progress",  label: "In Transit" },
  DELIVERED:                { category: "success",   label: "Delivered" },
  IRREPAIRABLE:             { category: "terminal",  label: "Irrepairable" },
  QUOTE_REJECTED:           { category: "attention", label: "Quote Rejected" },

  UNDER_REVIEW:             { category: "waiting",   label: "Under Review" },
  EXPIRED:                  { category: "terminal",  label: "Expired" },
  SUPERSEDED:               { category: "terminal",  label: "Superseded" },
  WRITTEN_OFF:              { category: "terminal",  label: "Written Off" },
  DISPUTED:                 { category: "attention", label: "Disputed" },
  ISSUED:                   { category: "progress",  label: "Issued" },
  RETURNED:                 { category: "terminal",  label: "Returned" },
};

const CAT_STYLES: Record<Category, { dot: string; tint: string; edge: string; fg: string }> = {
  neutral:   { dot: "var(--w-neutral-dot)",   tint: "var(--w-neutral-tint)",   edge: "var(--w-neutral-edge)",   fg: "var(--w-neutral-fg)" },
  progress:  { dot: "var(--w-progress-dot)",  tint: "var(--w-progress-tint)",  edge: "var(--w-progress-edge)",  fg: "var(--w-progress-fg)" },
  waiting:   { dot: "var(--w-waiting-dot)",   tint: "var(--w-waiting-tint)",   edge: "var(--w-waiting-edge)",   fg: "var(--w-waiting-fg)" },
  attention: { dot: "var(--w-attention-dot)", tint: "var(--w-attention-tint)", edge: "var(--w-attention-edge)", fg: "var(--w-attention-fg)" },
  success:   { dot: "var(--w-success-dot)",   tint: "var(--w-success-tint)",   edge: "var(--w-success-edge)",   fg: "var(--w-success-fg)" },
  terminal:  { dot: "var(--w-terminal-dot)",  tint: "var(--w-terminal-tint)",  edge: "var(--w-terminal-edge)",  fg: "var(--w-terminal-fg)" },
};

interface Props {
  status: string;
  variant?: "row" | "chip";
}

export default function StatusBadge({ status, variant = "row" }: Props) {
  const config = STATUS_MAP[status] ?? { category: "neutral" as Category, label: status };
  const styles = CAT_STYLES[config.category];

  if (variant === "row") {
    return (
      <span className="flex items-center gap-1">
        <span
          className="shrink-0"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "var(--w-radius-full)",
            background: styles.dot,
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: "var(--w-fs-cell)",
            color: "var(--w-text-2)",
            fontFamily: "var(--w-font-body)",
          }}
        >
          {config.label}
        </span>
      </span>
    );
  }

  const isTerminal = config.category === "terminal";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        paddingInline: "8px",
        paddingBlock: "3px",
        fontSize: "var(--w-fs-badge)",
        fontFamily: "var(--w-font-body)",
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: styles.tint,
        border: `1px solid ${styles.edge}`,
        color: styles.fg,
        borderRadius: isTerminal ? undefined : undefined,
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "var(--w-radius-full)",
          background: isTerminal ? styles.fg : styles.dot,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
}
