"use client";

import Image from "next/image";
import { DiamondControl } from "@/components/skinstric/layout/DiamondControl";

type CameraPermissionProps = {
  onBack: () => void;
  onAllow: () => void;
};

export function CameraPermission({ onBack, onAllow }: CameraPermissionProps) {
  return (
    <main
      data-figma-screen="006"
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

      <div className="absolute left-[12.5vw] top-[25%] size-[25.1vw] opacity-100" aria-hidden="true">
        <Image
          src="/skinstric/camera-choice-rhombuses.svg"
          alt=""
          width={484}
          height={484}
          className="absolute inset-0 h-auto w-full"
        />
        <Image
          src="/skinstric/choice-icon-ring.svg"
          alt=""
          width={117}
          height={117}
          className="absolute left-1/2 top-1/2 h-auto w-[6.07vw] -translate-x-1/2 -translate-y-1/2"
        />
        <Image
          src="/skinstric/camera-choice-shutter.svg"
          alt=""
          width={102}
          height={102}
          className="absolute left-1/2 top-1/2 h-auto w-[5.3125vw] -translate-x-1/2 -translate-y-1/2"
        />
        <Image
          src="/skinstric/camera-callout-line.svg"
          alt=""
          width={66}
          height={59}
          className="absolute left-[58.3%] top-[29.6%] h-auto w-[3.44vw]"
        />
        <span className="absolute left-[73.2%] top-[26.1%] w-[8.7vw] text-[clamp(7px,0.73vw,14px)] uppercase leading-[clamp(11px,1.25vw,24px)]">
          Allow A.I.
          <br />
          to Scan Your Face
        </span>
      </div>

      <div className="absolute right-[12.5vw] top-[25%] size-[25.1vw] opacity-25" aria-hidden="true">
        <Image
          src="/skinstric/camera-choice-rhombuses.svg"
          alt=""
          width={484}
          height={484}
          className="absolute inset-0 h-auto w-full"
        />
        <Image
          src="/skinstric/choice-icon-ring.svg"
          alt=""
          width={117}
          height={117}
          className="absolute left-1/2 top-1/2 h-auto w-[6.07vw] -translate-x-1/2 -translate-y-1/2"
        />
        <Image
          src="/skinstric/gallery-icon.svg"
          alt=""
          width={102}
          height={102}
          className="absolute left-1/2 top-1/2 h-auto w-[5.3125vw] -translate-x-1/2 -translate-y-1/2"
        />
        <Image
          src="/skinstric/gallery-callout-line.svg"
          alt=""
          width={66}
          height={59}
          className="absolute left-[29.8%] top-[58.3%] h-auto w-[3.44vw]"
        />
        <span className="absolute left-0 top-[67.6%] w-[28.2%] text-right text-[clamp(7px,0.73vw,14px)] uppercase leading-[clamp(11px,1.25vw,24px)]">
          Allow A.I.
          <br />
          access Gallery
        </span>
      </div>

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="camera-permission-title"
        className="absolute left-[30.8vw] top-[calc(25vh+10.6vw)] z-20 flex h-[clamp(100px,14.17vh,136px)] w-[min(18.3vw,352px)] min-w-[280px] flex-col bg-[#1a1b1c] text-[#fcfcfc]"
      >
        <h1
          id="camera-permission-title"
          className="flex-1 px-[clamp(12px,0.833vw,16px)] pt-[clamp(16px,1.25vw,24px)] text-[clamp(9px,0.625vw,12px)] font-medium uppercase leading-[1.5]"
        >
          Allow A.I. to access your camera
        </h1>
        <div className="flex h-9 shrink-0 items-center justify-end gap-[clamp(18px,1.25vw,24px)] border-t border-white/30 px-[clamp(12px,0.833vw,16px)]">
          <button
            type="button"
            onClick={onBack}
            className="text-[clamp(8px,0.52vw,10px)] uppercase opacity-70 hover:opacity-100"
          >
            Deny
          </button>
          <button
            type="button"
            onClick={onAllow}
            className="text-[clamp(8px,0.52vw,10px)] uppercase hover:opacity-75"
          >
            Allow
          </button>
        </div>
      </section>

      <button
        type="button"
        onClick={onBack}
        className="absolute bottom-[3.75vh] left-[1.667vw] z-20 flex items-center gap-[0.833vw] text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-4 tracking-[-0.02em] opacity-70"
      >
        <span className="size-[clamp(22px,2.292vw,44px)]">
          <DiamondControl direction="left" />
        </span>
        Back
      </button>
    </main>
  );
}
