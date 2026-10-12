"use client";

import { FiArrowLeft, FiChevronRight } from "react-icons/fi";

type Category = "race" | "age" | "gender";

type Demographics = Record<string, Record<string, number>>;

type DemographicsOverviewProps = {
  demographics: Demographics;
  selectedCategory: Category;
  actualSelections: Partial<Record<Category, string>>;
  categoryOrder: readonly Category[];
  categoryLabel: (category: Category) => string;
  formatLabel: (value: string) => string;
  sortScores: (
    scores: Record<string, number>
  ) => Array<[string, number]>;
  onSelectCategory: (category: Category) => void;
  onSelectAttribute: (category: Category, value: string) => void;
  onReset: (category: Category) => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function DemographicsOverview({
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
}: DemographicsOverviewProps) {
  const selectedScores = sortScores(demographics[selectedCategory] ?? {});
  const [topValue, topScore] = selectedScores[0] ?? ["", 0];
  const confidence = Math.max(0, Math.min(100, topScore * 100));
  const selectedActual = actualSelections[selectedCategory];

  return (
    <main
      data-figma-screen="013"
      className="min-h-screen bg-[#fcfcfc] text-[#1a1b1c]"
    >
      <header className="flex h-[72px] items-center justify-between border-b border-zinc-200 px-6 md:px-10">
        <div className="text-[20px] font-semibold tracking-[-0.03em]">
          SKINSTRIC
        </div>

        <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          A.I. ANALYSIS
        </div>
      </header>

      <section className="px-6 py-8 md:px-10 md:py-12">
        <div className="border-b border-zinc-200 pb-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            DEMOGRAPHICS
          </div>

          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-4xl font-light uppercase tracking-[-0.04em] sm:text-5xl md:text-7xl">
              Demographics
            </h1>

            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              Predicted race &amp; age
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[170px_minmax(0,1fr)_280px]">
          <aside>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Select attribute
            </div>

            <div className="mt-3 space-y-2">
              {categoryOrder.map((category) => {
                const ranked = sortScores(demographics[category] ?? {});
                const top = ranked[0];
                const selected = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onSelectCategory(category)}
                    className={`w-full border p-4 text-left transition ${
                      selected
                        ? "border-zinc-900 bg-white"
                        : "border-zinc-200 bg-transparent opacity-65 hover:opacity-100"
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      {categoryLabel(category)}
                    </div>

                    <div className="mt-2 text-lg font-light">
                      {top ? formatLabel(top[0]) : "—"}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 border-t border-zinc-200 pt-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Actual
              </div>

              <div className="mt-4 space-y-4">
                {categoryOrder.map((category) => (
                  <div key={category}>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                      {categoryLabel(category)}
                    </div>

                    <div className="mt-1 text-sm font-medium">
                      {actualSelections[category]
                        ? formatLabel(actualSelections[category] as string)
                        : "Select above"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="border border-zinc-200 bg-zinc-50">
            <div className="border-b border-zinc-200 px-6 py-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                {categoryLabel(selectedCategory)} analysis
              </div>

              <div className="mt-2 text-3xl font-light sm:text-4xl">
                {topValue ? formatLabel(topValue) : "—"}
              </div>
            </div>

            <div className="flex min-h-[360px] items-center justify-center px-6 py-8">
              <div className="relative grid h-56 w-56 place-items-center sm:h-64 sm:w-64">
                <div
                  className="absolute inset-0 rotate-45 border border-dashed border-zinc-300"
                  aria-hidden="true"
                />

                <div
                  className="absolute inset-5 rounded-full border border-zinc-300"
                  aria-hidden="true"
                />

                <div
                  className="absolute inset-9 rounded-full border-[5px] border-transparent border-r-black border-t-black"
                  style={{
                    transform: `rotate(${Math.round(topScore * 360)}deg)`,
                  }}
                  aria-hidden="true"
                />

                <div className="relative text-center">
                  <div className="text-4xl font-light sm:text-5xl">
                    {confidence.toFixed(2)}%
                  </div>

                  <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    A.I. confidence
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-200 px-6 py-4 text-center text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Select a category to view its predicted attribute.
            </div>
          </section>

          <aside className="border border-zinc-200">
            <div className="border-b border-zinc-200 px-5 py-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                {categoryLabel(selectedCategory)}
              </div>

              <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                A.I. confidence
              </div>
            </div>

            <div>
              {selectedScores.map(([value, score], index) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selectedActual === value}
                  onClick={() =>
                    onSelectAttribute(selectedCategory, value)
                  }
                  className={`flex w-full items-center justify-between border-b border-zinc-100 px-5 py-4 text-left transition ${
                    selectedActual === value
                      ? "bg-[#1a1b1c] text-white"
                      : "hover:bg-zinc-50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`text-xs ${
                        selectedActual === value
                          ? "text-white/60"
                          : "text-zinc-400"
                      }`}
                    >
                      {index === 0 ? "01" : String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="text-sm">
                      {formatLabel(value)}
                    </span>
                  </span>

                  <span className="flex items-center gap-3">
                    {selectedActual === value && (
                      <span className="text-[9px] font-semibold uppercase tracking-[0.14em]">
                        Selected
                      </span>
                    )}
                    <span
                      className={`font-mono text-xs ${
                        selectedActual === value ? "text-white/80" : ""
                      }`}
                    >
                      {(score * 100).toFixed(2)}%
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="px-5 py-4 text-[10px] leading-5 text-zinc-400">
              If the A.I. estimate is wrong, select the attribute that
              actually applies to you.
            </div>
          </aside>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm tracking-[0.2em] text-zinc-500"
          >
            <FiArrowLeft size={14} />
            BACK
          </button>

          <div className="flex items-center gap-6">
            {selectedActual && (
              <button
                type="button"
                onClick={() => onReset(selectedCategory)}
                className="text-sm tracking-[0.2em] text-zinc-500"
              >
                RESET
              </button>
            )}
            <button
              type="button"
              onClick={onContinue}
              className="flex items-center gap-2 text-sm tracking-[0.2em]"
            >
              DETAILS
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
