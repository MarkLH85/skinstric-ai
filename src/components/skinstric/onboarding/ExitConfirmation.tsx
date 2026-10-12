"use client";

import { FiArrowLeft, FiX } from "react-icons/fi";

type ExitConfirmationProps = {
  onStay: () => void;
  onExit: () => void;
};

export function ExitConfirmation({
  onStay,
  onExit,
}: ExitConfirmationProps) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#fcfcfc] text-[#1a1b1c]">
      <div className="absolute left-1/2 top-1/2 z-10 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 px-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center">
          <span className="absolute h-16 w-16 rotate-45 border border-[#1a1b1c] opacity-50" />
          <FiX className="relative text-xl" />
        </div>

        <h1 className="mt-10 text-4xl font-light tracking-[-0.05em] sm:text-5xl">
          Are you sure?
        </h1>

        <p className="mx-auto mt-5 max-w-md text-sm leading-6 opacity-60">
          Leaving now will stop the analysis process.
        </p>

        <div className="mt-10 flex items-center justify-center gap-8">
          <button
            type="button"
            onClick={onStay}
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-60"
          >
            <FiArrowLeft />
            Stay
          </button>

          <button
            type="button"
            onClick={onExit}
            className="text-[11px] font-semibold uppercase tracking-[0.16em]"
          >
            Exit
          </button>
        </div>
      </div>

      <span
        aria-hidden="true"
        data-figma-screen="004"
        className="pointer-events-none absolute left-0 top-0 hidden"
      />
    </section>
  );
}
