"use client";

import { DiamondControl } from "@/components/skinstric/layout/DiamondControl";

export type DemographicCategory = "race" | "age" | "gender";
export type DemographicScores = Record<string, Record<string, number>>;

type DemographicResultsProps = {
  detail: boolean;
  demographics: DemographicScores;
  selectedCategory: DemographicCategory;
  actualSelections: Partial<Record<DemographicCategory, string>>;
  categoryOrder: readonly DemographicCategory[];
  categoryLabel: (category: DemographicCategory) => string;
  formatLabel: (value: string) => string;
  sortScores: (scores: Record<string, number>) => Array<[string, number]>;
  onSelectCategory: (category: DemographicCategory) => void;
  onSelectAttribute: (category: DemographicCategory, value: string) => void;
  onReset: (category: DemographicCategory) => void;
  onBack: () => void;
  onContinue: () => void;
};

const percent = (score: number) => `${(score * 100).toFixed(2)} %`;

export function DemographicResults({
  detail,
  demographics,
  selectedCategory,
  actualSelections,
  categoryOrder,
  categoryLabel,
  formatLabel,
  sortScores,
  onSelectCategory,
  onSelectAttribute,
  onReset,
  onBack,
  onContinue,
}: DemographicResultsProps) {
  const scores = sortScores(demographics[selectedCategory] ?? {});
  const [topValue, topScore] = scores[0] ?? ["", 0];
  const selectedValue = actualSelections[selectedCategory] ?? topValue;
  const displayedValue = selectedValue;
  const displayedScore =
    scores.find(([value]) => value === displayedValue)?.[1] ?? topScore;

  return (
    <main
      data-figma-screen={detail ? "014" : "013"}
      className="relative min-h-screen overflow-hidden bg-[#fcfcfc] text-[#1a1b1c] max-md:flex max-md:flex-col max-md:gap-4 max-md:overflow-visible max-md:px-4 max-md:pb-8 max-md:pt-16"
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

      <p className="absolute left-[1.667vw] top-[4.47917vw] text-[clamp(9px,0.833vw,16px)] font-semibold uppercase leading-[1.5] tracking-[-0.02em] max-md:static max-md:text-[12px]">
        A.I. Analysis
      </p>
      <h1 className="absolute left-[1.51vw] top-[5.98958vw] text-[clamp(24px,3.75vw,72px)] uppercase leading-[3.33333vw] tracking-[-0.225vw] max-md:static max-md:text-[clamp(24px,11vw,40px)] max-md:leading-none max-md:tracking-[-0.05em]">
        Demographics
      </h1>
      <p className="absolute left-[1.667vw] top-[9.89583vw] text-[clamp(8px,0.73vw,14px)] uppercase leading-[1.714] max-md:static max-md:text-[12px]">
        Predicted Race &amp; Age
      </p>

      {detail && (
        <div className="absolute left-[28.23vw] top-[4.79167vw] flex gap-[0.417vw] max-md:static max-md:gap-2">
          <button
            type="button"
            aria-label="Previous demographic category"
            onClick={() => {
              const index = categoryOrder.indexOf(selectedCategory);
              onSelectCategory(categoryOrder[(index + categoryOrder.length - 1) % categoryOrder.length]);
            }}
            className="size-[clamp(22px,2.292vw,44px)]"
          >
            <DiamondControl direction="left" />
          </button>
          <button
            type="button"
            aria-label="Next demographic category"
            onClick={() => {
              const index = categoryOrder.indexOf(selectedCategory);
              onSelectCategory(categoryOrder[(index + 1) % categoryOrder.length]);
            }}
            className="size-[clamp(22px,2.292vw,44px)]"
          >
            <DiamondControl direction="right" />
          </button>
        </div>
      )}

      <section className="absolute left-[1.667vw] top-[15.83333vw] grid w-[10.833vw] gap-[0.41667vw] max-md:static max-md:w-full max-md:gap-2">
        {categoryOrder.map((category) => {
          const categoryScores = sortScores(demographics[category] ?? {});
          const topCategoryValue =
            actualSelections[category] ?? categoryScores[0]?.[0];
          const selected = category === selectedCategory;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              aria-pressed={selected}
              className={`flex h-[5.41667vw] flex-col justify-between border-t border-[#1a1b1c] px-[0.833vw] py-[0.57292vw] text-left text-[clamp(8px,0.833vw,16px)] font-semibold uppercase leading-[1.25vw] tracking-[-0.01667vw] max-md:h-20 max-md:px-4 max-md:py-3 max-md:text-[14px] max-md:leading-5 ${
                selected
                  ? "bg-[#1a1b1c] text-[#fcfcfc]"
                  : "bg-[#f3f3f4] hover:bg-[#e1e1e2]"
              }`}
            >
              <span className="truncate">
                {topCategoryValue ? formatLabel(topCategoryValue) : "—"}
              </span>
              <span>{categoryLabel(category)}</span>
            </button>
          );
        })}
      </section>

      <section className="absolute left-[13.333vw] top-[15.83333vw] h-[28.33333vw] w-[60.833vw] border-t border-[#1a1b1c] bg-[#f3f3f4] max-md:relative max-md:left-0 max-md:top-0 max-md:h-[380px] max-md:w-full">
        <h2 className="absolute left-[0.781vw] top-[1.04167vw] max-w-[32vw] text-[clamp(16px,2.083vw,40px)] leading-[2.08333vw] tracking-[-0.10417vw] max-md:left-4 max-md:top-4 max-md:max-w-[75%] max-md:text-[28px] max-md:leading-8 max-md:tracking-[-0.04em]">
          {detail && selectedCategory === "age" && displayedValue
            ? `${formatLabel(displayedValue)} y.o.`
            : displayedValue
              ? formatLabel(displayedValue)
              : categoryLabel(selectedCategory)}
        </h2>
        <div
          className="absolute bottom-[1.25vw] right-[0.833vw] grid size-[20vw] place-items-center rounded-full max-md:bottom-4 max-md:right-1/2 max-md:size-[min(60vw,240px)] max-md:translate-x-1/2"
          style={{
            background: `conic-gradient(#1a1b1c ${Math.max(0, Math.min(displayedScore, 1)) * 100}%, #c1c2c3 0)`,
          }}
        >
          <div className="absolute inset-[0.15625vw] rounded-full bg-[#f3f3f4]" />
          <div className="relative -translate-y-[0.10417vw] flex items-start">
            <span className="text-[clamp(12px,2.083vw,40px)] leading-none max-md:text-[36px]">
              {(displayedScore * 100).toFixed(2)}
            </span>
            <span className="ml-[0.10417vw] -translate-y-[0.625vw] text-[clamp(8px,1.25vw,24px)] leading-[2.08333vw] tracking-[-0.0625vw] max-md:-translate-y-1 max-md:text-[16px] max-md:leading-none">%</span>
          </div>
        </div>
      </section>

      <section className="absolute right-[1.667vw] top-[15.83333vw] h-[28.33333vw] w-[23.333vw] overflow-hidden bg-[#f3f3f4] max-md:static max-md:h-auto max-md:w-full">
        <header className="flex h-[2.5vw] items-center justify-between border-t border-[#1a1b1c] px-[0.833vw] pt-px text-[clamp(8px,0.833vw,16px)] font-medium uppercase leading-[1.25vw] tracking-[-0.01667vw] max-md:h-11 max-md:px-4 max-md:text-[13px] max-md:leading-5">
          <span>
            {detail && selectedCategory === "age"
              ? "RACE"
              : categoryLabel(selectedCategory)}
          </span>
          <span>A.I. Confidence</span>
        </header>
        <div className="overflow-y-auto">
          {scores.map(([value, score]) => {
            const active = value === selectedValue;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => onSelectAttribute(selectedCategory, value)}
                className={`flex h-[2.5vw] w-full items-center justify-between px-[0.833vw] text-left text-[clamp(8px,0.833vw,16px)] leading-[1.25vw] tracking-[-0.01667vw] max-md:h-12 max-md:px-4 max-md:text-[14px] max-md:leading-5 ${
                  active ? "bg-[#1a1b1c] text-[#fcfcfc]" : "hover:bg-[#e1e1e2]"
                }`}
              >
                <span className="flex items-center gap-[0.625vw]">
                  <span className="grid size-[12px] shrink-0 place-items-center" aria-hidden="true">
                    <span
                      className={`size-[8.49px] rotate-45 border ${
                        active ? "border-[#fcfcfc] bg-[#fcfcfc]" : "border-[#1a1b1c]"
                      }`}
                    />
                  </span>
                  {formatLabel(value)}
                </span>
                <span>{percent(score)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <p className="absolute bottom-[2.1875vw] left-[51.015625%] -translate-x-1/2 whitespace-nowrap text-center text-[clamp(6px,0.833vw,16px)] leading-[1.5] tracking-[-0.01667vw] text-[#a0a4ab] max-md:static max-md:translate-x-0 max-md:whitespace-normal max-md:text-[12px]">
        If A.I. estimate is wrong, selec the correct one.
      </p>

      <button
        type="button"
        onClick={onBack}
        className="absolute bottom-[1.875vw] left-[1.667vw] z-10 flex items-center gap-[0.833vw] text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-4 tracking-[-0.02em] max-md:static max-md:gap-2 max-md:self-start max-md:text-[13px]"
      >
        <span className="size-[clamp(22px,2.292vw,44px)]">
          <DiamondControl direction="left" />
        </span>
        Back
      </button>

      <div className="absolute bottom-[1.875vw] right-[1.667vw] z-10 flex gap-[17px] max-md:static max-md:self-end">
        <button
          type="button"
          onClick={() => onReset(selectedCategory)}
          className="flex h-[35px] w-[73px] items-center border border-[#1a1b1c] px-[16px] text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-4 tracking-[-0.02em]"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex h-[35px] w-[95px] items-center bg-[#1a1b1c] px-[16px] text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-4 tracking-[-0.02em] text-[#fcfcfc]"
        >
          Confirm
        </button>
      </div>
    </main>
  );
}
