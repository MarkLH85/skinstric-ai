"use client";

import type { ReactNode } from "react";

type SkinstricShellProps = {
  children: ReactNode;
  className?: string;
};

export function SkinstricShell({
  children,
  className = "",
}: SkinstricShellProps) {
  return (
    <main
      className={`relative min-h-screen overflow-hidden bg-[#fcfcfc] text-[#1a1b1c] ${className}`}
    >
      {children}
    </main>
  );
}
