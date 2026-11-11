type Priority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW";

const PRIO_COLOR: Record<Priority, string> = {
  CRITICAL: "var(--w-prio-critical)",
  HIGH:     "var(--w-prio-high)",
  NORMAL:   "var(--w-prio-normal)",
  LOW:      "var(--w-prio-low)",
};

const PRIO_FILL: Record<Priority, number> = {
  CRITICAL: 3,
  HIGH:     2,
  NORMAL:   1,
  LOW:      0,
};

const PRIO_LABEL: Record<Priority, string> = {
  CRITICAL: "Critical",
  HIGH:     "High",
  NORMAL:   "Normal",
  LOW:      "Low",
};

interface Props {
  priority: string;
  showLabel?: boolean;
}

export default function PriorityBar({ priority, showLabel = false }: Props) {
  const p = (priority as Priority) in PRIO_COLOR ? (priority as Priority) : "NORMAL";
  const color = PRIO_COLOR[p];
  const fill = PRIO_FILL[p];

  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: "4px",
            height: i === 0 ? "8px" : i === 1 ? "11px" : "14px",
            background: i <= fill ? color : "var(--w-neutral-edge)",
            borderRadius: "1px",
          }}
        />
      ))}
      {showLabel && (
        <span
          style={{
            fontSize: "var(--w-fs-cell)",
            color: "var(--w-text-2)",
            marginLeft: "4px",
            fontFamily: "var(--w-font-body)",
          }}
        >
          {PRIO_LABEL[p]}
        </span>
      )}
    </span>
  );
}
