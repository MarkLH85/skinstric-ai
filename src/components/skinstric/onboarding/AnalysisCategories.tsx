"use client";

import { useState } from "react";
import Image from "next/image";
import { DiamondControl } from "@/components/skinstric/layout/DiamondControl";

type AnalysisCategoriesProps = {
  onBack: () => void;
  onContinue: () => void;
};

const categories = [
  {
    label: "Demographics",
    position: "left-1/2 top-[24.53%]",
    width: "w-[32.02%]",
  },
  {
    label: "Skin Type Details",
    position: "left-[24.53%] top-1/2",
    width: "w-[18%]",
  },
  {
    label: "Cosmetic Concerns",
    position: "left-[75.47%] top-1/2",
    width: "w-[21.65%]",
  },
  {
    label: "Weather",
    position: "left-1/2 top-[75.47%]",
    width: "w-[22%]",
  },
];

export function AnalysisCategories({
  onBack,
  onContinue,
}: AnalysisCategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState("Demographics");

  return (
    <main
      data-figma-screen="012"
      className="relative min-h-screen overflow-hidden bg-[#fcfcfc] text-[#1a1b1c]"
    >
      <header className="absolute inset-x-0 top-0 z-10 flex h-[3.333vw] items-center px-[1.667vw]">
        <div className="flex items-center gap-3 text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-[1.14] tracking-[-0.02em]">
          <span>SKINSTRIC</span>
          <span className="flex items-center gap-[6px] opacity-60">
            <svg aria-hidden="true" className="h-[17px] w-[4px]" viewBox="0 0 4 17" fill="none">
              <path d="M3.5 0.5H0.5V16.5H3.5" stroke="currentColor" />
            </svg>
            <span>Analysis</span>
            <svg aria-hidden="true" className="h-[17px] w-[4px]" viewBox="0 0 4 17" fill="none">
              <path d="M0.5 0.5H3.5V16.5H0.5" stroke="currentColor" />
            </svg>
          </span>
        </div>
      </header>

      <p className="absolute left-[1.667vw] top-[8.96vh] z-10 text-[clamp(9px,0.833vw,16px)] font-semibold uppercase leading-[1.5] tracking-[-0.02em]">
        A. I. Analysis
      </p>
      <p className="absolute left-[1.667vw] top-[12.3vh] z-10 max-w-[336px] text-[clamp(8px,0.73vw,14px)] uppercase leading-[1.714] max-md:max-w-[80vw] max-md:text-[12px]">
        A. I. has estimated the following.
        <br />
        Fix estimated information if needed.
      </p>

      <div className="absolute left-1/2 top-1/2 z-0 size-[min(39.6875vw,79.375vh)] -translate-x-1/2 -translate-y-1/2 max-md:size-[min(100vw,62vh)]">
        <Image
          src="/skinstric/intro-rhombuses.svg"
          alt=""
          aria-hidden="true"
          width={762}
          height={762}
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute left-1/2 top-1/2 h-[58.21%] w-[58.21%] -translate-x-1/2 -translate-y-1/2">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.label;
            return (
              <div key={category.label}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.label);
                    if (category.label === "Demographics") {
                      onContinue();
                    }
                  }}
                  className={`absolute ${category.position} h-[34.69%] w-[34.69%] -translate-x-1/2 -translate-y-1/2 rotate-45 cursor-pointer transition-colors duration-150 focus:outline-none ${
                    isSelected
                      ? "bg-[#e1e1e2]"
                      : "bg-[#f3f3f4] hover:bg-[#e1e1e2]"
                  }`}
                  aria-label={category.label}
                />
                <p
                  className={`pointer-events-none absolute ${category.position} -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(8px,0.833vw,16px)] font-semibold uppercase leading-[1.5] tracking-[-0.02em] text-[#1a1b1c] max-md:text-[10px] max-md:leading-[1.3] ${category.width}`}
                >
                  {category.label === "Skin Type Details" ? (
                    <>
                      <span className="whitespace-nowrap">Skin Type</span>
                      <br />
                      Details
                    </>
                  ) : category.label === "Cosmetic Concerns" ? (
                    <>
                      <span className="whitespace-nowrap">Cosmetic</span>
                      <br />
                      Concerns
                    </>
                  ) : (
                    category.label
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="absolute bottom-[3.75vh] left-[1.667vw] z-10 flex items-center gap-[0.833vw] text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-4 tracking-[-0.02em] transition-opacity hover:opacity-70"
      >
        <span className="size-[clamp(22px,2.292vw,44px)]">
          <DiamondControl direction="left" />
        </span>
        Back
      </button>
      <button
        type="button"
        onClick={onContinue}
        className="absolute bottom-[3.75vh] right-[1.667vw] z-10 flex items-center gap-[0.833vw] text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-4 tracking-[-0.02em] transition-opacity hover:opacity-70"
      >
        Get Summary
        <span className="size-[clamp(22px,2.292vw,44px)]">
          <DiamondControl direction="right" />
        </span>
      </button>
    </main>
  );
}
