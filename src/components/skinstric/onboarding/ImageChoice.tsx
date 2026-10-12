"use client";

import { ChangeEvent, useRef } from "react";
import Image from "next/image";

type ImageChoiceProps = {
  onBack: () => void;
  onTakePicture: () => void;
  onImageSelected: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  loading?: boolean;
};

export function ImageChoice({
  onBack,
  onTakePicture,
  onImageSelected,
  error,
  loading = false,
}: ImageChoiceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <main
      data-figma-screen="005"
      className="relative min-h-screen overflow-hidden bg-[#fcfcfc] text-[#1a1b1c]"
    >
      <header className="absolute inset-x-0 top-0 z-10 flex h-[3.333vw] items-center px-[1.667vw]">
        <div className="flex items-center gap-3 text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-[1.14] tracking-[-0.02em]">
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

      <p className="absolute left-[1.667vw] top-[8.96vh] z-10 text-[clamp(9px,0.833vw,16px)] font-semibold uppercase leading-[1.5] tracking-[-0.02em]">
        To start analysis
      </p>

      <button
        type="button"
        onClick={onBack}
        className="absolute bottom-[3.75vh] left-[1.667vw] z-20 flex items-center gap-[0.833vw] text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-4 tracking-[-0.02em] opacity-70"
      >
        <DiamondArrow />
        Back
      </button>

      <section className="absolute left-1/2 top-[25%] z-10 grid w-[74.7vw] -translate-x-1/2 grid-cols-2 gap-[24.58vw]">
        <button
          type="button"
          onClick={onTakePicture}
          disabled={loading}
          aria-label="Allow A.I. to scan your face"
          className="group relative aspect-square w-[25.1vw] disabled:cursor-not-allowed"
        >
          <Image
            src="/skinstric/camera-choice-rhombuses.svg"
            alt=""
            aria-hidden="true"
            width={484}
            height={484}
            className="absolute inset-0 h-auto w-full"
          />
          <Image
            src="/skinstric/choice-icon-ring.svg"
            alt=""
            aria-hidden="true"
            width={117}
            height={117}
            className="absolute left-1/2 top-1/2 h-auto w-[6.07vw] -translate-x-1/2 -translate-y-1/2 transition group-hover:scale-105"
          />
          <Image
            src="/skinstric/camera-choice-shutter.svg"
            alt=""
            aria-hidden="true"
            width={102}
            height={102}
            className="absolute left-1/2 top-1/2 h-auto w-[5.3125vw] -translate-x-1/2 -translate-y-1/2"
          />
          <Image
            src="/skinstric/camera-callout-line.svg"
            alt=""
            aria-hidden="true"
            width={66}
            height={59}
            className="absolute left-[58.3%] top-[29.6%] h-auto w-[3.44vw]"
          />
          <span className="absolute left-[73.2%] top-[26.1%] w-[8.7vw] text-left text-[clamp(7px,0.73vw,14px)] uppercase leading-[clamp(11px,1.25vw,24px)]">
            Allow A.I.
            <br />
            to Scan Your Face
          </span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          aria-label="Allow A.I. to access gallery"
          className="group relative aspect-square w-[25.1vw] disabled:cursor-not-allowed"
        >
          <Image
            src="/skinstric/camera-choice-rhombuses.svg"
            alt=""
            aria-hidden="true"
            width={484}
            height={484}
            className="absolute inset-0 h-auto w-full"
          />
          <Image
            src="/skinstric/choice-icon-ring.svg"
            alt=""
            aria-hidden="true"
            width={117}
            height={117}
            className="absolute left-1/2 top-1/2 h-auto w-[6.07vw] -translate-x-1/2 -translate-y-1/2 transition group-hover:scale-105"
          />
          <Image
            src="/skinstric/gallery-icon.svg"
            alt=""
            aria-hidden="true"
            width={102}
            height={102}
            className="absolute left-1/2 top-1/2 h-auto w-[5.3125vw] -translate-x-1/2 -translate-y-1/2"
          />
          <Image
            src="/skinstric/gallery-callout-line.svg"
            alt=""
            aria-hidden="true"
            width={66}
            height={59}
            className="absolute left-[29.8%] top-[58.3%] h-auto w-[3.44vw]"
          />
          <span className="absolute left-0 top-[67.6%] w-[28.2%] text-right text-[clamp(7px,0.73vw,14px)] uppercase leading-[clamp(11px,1.25vw,24px)]">
            Allow A.I.
            <br />
            access Gallery
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageSelected}
          className="sr-only"
          disabled={loading}
        />

        {error && (
          <p
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center text-[clamp(8px,0.73vw,14px)] text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </section>
    </main>
  );
}

function DiamondArrow() {
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
        className="absolute left-[35.71%] top-[37.63%] w-[21.43%]"
        style={{ height: "auto" }}
      />
    </span>
  );
}
