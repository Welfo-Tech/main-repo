"use client";

import CountUp from "react-countup";

interface Props {
  value: number;
}

export default function CountUpNumber({ value }: Props) {
  return (
    <CountUp
      end={value}
      duration={1.8}
      separator=","
      className="text-4xl font-bold"
    />
  );
}