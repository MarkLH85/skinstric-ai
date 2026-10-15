"use client";

import Image from "next/image";
import { DiamondControl } from "@/components/skinstric/layout/DiamondControl";

type IntroduceYourselfProps = {
  onContinue: () => void;
  onBack?: () => void;
};

export function IntroduceYourself({
  onContinue,
  onBack,
}: IntroduceYourselfProps) {
  return (
    <main
      data-figma-screen="002"
      className="relative min-h-screen overflow-hidden bg-[#fcfcfc] text-[#1a1b1c]"
    >
      <header className="absolute inset-x-0 top-0 z-10 flex h-[3.333vw] items-start px-[1.667vw] pt-[2.4vh]">
        <div className="flex items-center gap-3 text-[clamp(8px,0.73vw,14px)] max-md:text-[11px] font-semibold uppercase leading-[1.14] tracking-[-0.02em]">
          <span>SKINSTRIC</span>
          <span className="flex items-center gap-[6px] opacity-60">
            <svg aria-hidden="true" className="h-[17px] w-[4px]" viewBox="0 0 4 17" fill="none">
              <path d="M3.5 0.5H0.5V16.5H3.5" stroke="currentColor" />
            </svg>
            <span>Intro</span>
            <svg aria-hidden="true" className="h-[17px] w-[4px]" viewBox="0 0 4 17" fill="none">
              <path d="M0.5 0.5H3.5V16.5H0.5" stroke="currentColor" />
            </svg>
          </span>
        </div>
      </header>

      <p className="absolute left-[1.667vw] top-[8.96vh] z-10 text-[clamp(9px,0.833vw,16px)] font-semibold uppercase leading-[1.5] tracking-[-0.02em] max-md:text-[13px]">
        To start analysis
      </p>

      <Image
        src="/skinstric/intro-rhombuses.svg"
        alt=""
        aria-hidden="true"
        width={740}
        height={740}
        className="pointer-events-none absolute left-1/2 top-[10.3vh] z-0 h-auto w-[min(39.6875vw,762px)] -translate-x-1/2 max-md:top-[48.7%] max-md:w-[min(92vw,70vh)] max-md:-translate-y-1/2 max-md:opacity-100 max-md:contrast-150"
      />

      <section className="absolute inset-x-4 top-[48.7%] z-10 -translate-y-1/2 text-center">
        <p className="mb-[2px] text-[clamp(8px,0.73vw,14px)] leading-[clamp(8px,1.25vw,24px)] uppercase opacity-40 max-md:text-[14px] max-md:leading-5">
          Click to type
        </p>
        <h1 className="text-[clamp(24px,3.125vw,60px)] font-normal leading-[clamp(27px,3.333vw,64px)] tracking-[-0.07em] max-md:text-[clamp(32px,10vw,48px)] max-md:leading-[1.1]">
          <button type="button" onClick={onContinue}>
            Introduce Yourself
          </button>
        </h1>
        <div className="mx-auto h-px w-[min(21.72vw,417px)] bg-[#1a1b1c]" />
      </section>

      {onBack && (
        <footer className="absolute bottom-[3.75vh] left-[1.667vw] z-10">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-[0.833vw] text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-4 tracking-[-0.02em] opacity-70 max-md:text-[13px]"
          >
            <span className="size-[clamp(22px,2.292vw,44px)]">
              <DiamondControl direction="left" />
            </span>
            Back
          </button>
        </footer>
      )}
    </main>
  );
}
