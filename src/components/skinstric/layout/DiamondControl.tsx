"use client";

import Image from "next/image";

type DiamondControlProps = {
  direction: "left" | "right";
  tone?: "dark" | "light";
};

export function DiamondControl({
  direction,
  tone = "dark",
}: DiamondControlProps) {
  return (
    <span className="relative grid size-full place-items-center">
      <Image
        src="/skinstric/landing-cta-diamond.svg"
        alt=""
        aria-hidden="true"
        width={44}
        height={44}
        className={`absolute inset-0 h-full w-full ${tone === "light" ? "brightness-0 invert" : ""}`}
      />
      <Image
        src="/skinstric/landing-cta-arrow.svg"
        alt=""
        aria-hidden="true"
        width={10}
        height={11}
        className={`absolute left-[35.71%] top-[37.63%] h-auto w-[21.43%] ${
          direction === "right" ? "rotate-180" : ""
        } ${tone === "light" ? "brightness-0 invert" : ""}`}
      />
    </span>
  );
}
