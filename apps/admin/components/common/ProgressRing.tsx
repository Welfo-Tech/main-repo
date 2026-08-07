"use client";

interface Props {
  value: number;
}

export default function ProgressRing({ value }: Props) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">

      <svg
        width="90"
        height="90"
        className="-rotate-90"
      >
        <circle
          cx="45"
          cy="45"
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="8"
          fill="none"
        />

        <circle
          cx="45"
          cy="45"
          r={radius}
          stroke="#0B8F5A"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <span className="absolute text-lg font-bold">
        {value}%
      </span>

    </div>
  );
}