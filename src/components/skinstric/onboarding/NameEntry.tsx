"use client";

import { ChangeEvent, KeyboardEvent } from "react";
import Image from "next/image";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

type NameEntryProps = {
  step: "location" | "name";
  name: string;
  location: string;
  error?: string;
  loading?: boolean;
  onNameChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
};

export function NameEntry({
  step,
  name,
  location,
  error,
  loading = false,
  onNameChange,
  onLocationChange,
  onContinue,
  onBack,
}: NameEntryProps) {
  const value = step === "location" ? location : name;
  const valid = value.trim().length > 0 && !/\d/.test(value);
  const prompt = step === "location" ? "Where are you from?" : "Introduce Yourself";
  const fitUnderline = step === "location" && Boolean(value);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && valid && !loading) {
      event.preventDefault();
      onContinue();
    }
  };

  return (
    <main
      data-figma-screen={step === "location" ? (location ? "505" : "504") : "003"}
      className="relative min-h-screen overflow-hidden bg-[#fcfcfc] text-[#1a1b1c]"
    >
      <header className="absolute inset-x-0 top-0 z-10 flex h-[3.333vw] items-center px-[1.667vw]">
        <div className={`flex items-center ${step === "location" ? "gap-3" : "gap-[1vw]"} text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-[1.14] tracking-[-0.02em]`}>
          <span>SKINSTRIC</span>
          {step === "location" ? (
            <span className="flex items-center gap-[6px] opacity-60">
              <svg aria-hidden="true" className="h-[17px] w-[4px]" viewBox="0 0 4 17" fill="none">
                <path d="M3.5 0.5H0.5V16.5H3.5" stroke="currentColor" />
              </svg>
              <span>Intro</span>
              <svg aria-hidden="true" className="h-[17px] w-[4px]" viewBox="0 0 4 17" fill="none">
                <path d="M0.5 0.5H3.5V16.5H0.5" stroke="currentColor" />
              </svg>
            </span>
          ) : (
            <span className="opacity-60">| &nbsp;INTRO&nbsp; |</span>
          )}
        </div>
      </header>

      <p className="absolute left-[1.667vw] top-[8.96vh] z-10 text-[clamp(9px,0.833vw,16px)] font-semibold uppercase leading-[1.5] tracking-[-0.02em]">
        To start analysis
      </p>

      <Image
        src="/skinstric/intro-rhombuses.svg"
        alt=""
        aria-hidden="true"
        width={740}
        height={740}
        className="pointer-events-none absolute left-1/2 top-[10.3vh] z-0 h-auto w-[min(39.6875vw,762px)] -translate-x-1/2"
      />

      <section className="absolute inset-x-4 top-[48.7vh] z-10 mx-auto flex max-w-[calc(100vw-32px)] -translate-y-1/2 flex-col items-center">
        <label
          htmlFor="onboarding-answer"
          className="mb-[2px] text-center text-[clamp(8px,0.73vw,14px)] leading-[clamp(8px,1.25vw,24px)] uppercase opacity-40"
        >
          {value ? prompt : "Click to type"}
        </label>
        <div className="grid w-[clamp(220px,25.05vw,481px)] max-w-[calc(100vw-32px)]">
          <span
            aria-hidden="true"
            className={`invisible col-start-1 row-start-1 max-w-full whitespace-pre text-[clamp(24px,3.125vw,60px)] font-normal leading-[clamp(27px,3.333vw,64px)] tracking-[-0.07em] ${
              fitUnderline
                ? "relative w-max justify-self-center after:visible after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[#1a1b1c] after:content-['']"
                : ""
            }`}
          >
            {value || prompt}
          </span>
          <input
            id="onboarding-answer"
            autoComplete={step === "name" ? "name" : "address-level2"}
            autoFocus
            value={value}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              if (step === "location") {
                onLocationChange(event.target.value);
              } else {
                onNameChange(event.target.value);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={prompt}
            aria-label={prompt}
            className={`col-start-1 row-start-1 w-full min-w-0 ${
              fitUnderline ? "border-b border-transparent" : "border-b border-[#1a1b1c]"
            } bg-transparent text-center text-[clamp(24px,3.125vw,60px)] font-normal leading-[clamp(27px,3.333vw,64px)] tracking-[-0.07em] outline-none placeholder:text-[#1a1b1c] placeholder:opacity-100`}
          />
        </div>
        {error && (
          <p className="mt-4 text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </section>

      <footer className="absolute inset-x-[1.667vw] bottom-[3.75vh] z-10 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-[0.833vw] text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-4 tracking-[-0.02em] opacity-70"
        >
          {step === "location" ? (
            <DiamondArrow direction="left" />
          ) : (
            <span className="grid size-[clamp(22px,2.292vw,44px)] place-items-center border border-[#1a1b1c]">
              <FiArrowLeft aria-hidden="true" />
            </span>
          )}
          Back
        </button>

        {(valid || loading) && (
          <button
            type="button"
            onClick={onContinue}
            disabled={loading}
            className="flex items-center gap-[0.833vw] text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-4 tracking-[-0.02em] opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {loading ? "Processing..." : "Proceed"}
            {step === "location" ? (
              <DiamondArrow direction="right" />
            ) : (
              <span className="grid size-[clamp(22px,2.292vw,44px)] place-items-center border border-[#1a1b1c]">
                <FiArrowRight aria-hidden="true" />
              </span>
            )}
          </button>
        )}
      </footer>
    </main>
  );
}

function DiamondArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <span className="relative grid size-[clamp(22px,2.292vw,44px)] place-items-center">
      <Image
        src="/skinstric/landing-cta-diamond.svg"
        alt=""
        aria-hidden="true"
        width={44}
        height={44}
        className="absolute inset-0 h-full w-full"
      />
      <Image
        src="/skinstric/landing-cta-arrow.svg"
        alt=""
        aria-hidden="true"
        width={9.42857}
        height={10.8872}
        className={`absolute left-[35.71%] top-[37.63%] w-[21.43%] ${
          direction === "right" ? "rotate-180" : ""
        }`}
        style={{ height: "auto" }}
      />
    </span>
  );
}
