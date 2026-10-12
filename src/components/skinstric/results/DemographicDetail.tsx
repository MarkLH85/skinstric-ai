"use client";

import { FiArrowLeft } from "react-icons/fi";

type Category = "race" | "age" | "gender";

type Demographics = Record<string, Record<string, number>>;

type DemographicDetailProps = {
  demographics: Demographics;
  selectedCategory: Category;
  actualSelections: Partial<Record<Category, string>>;
  categoryLabel: (category: Category) => string;
  formatLabel: (value: string) => string;
  sortScores: (
    scores: Record<string, number>
  ) => Array<[string, number]>;
  onBack: () => void;
  onSelectCategory: (category: Category) => void;
};

export default function DemographicDetail({
  demographics,
  selectedCategory,
  actualSelections,
  categoryLabel,
  formatLabel,
  sortScores,
  onBack,
  onSelectCategory,
}: DemographicDetailProps) {
  const scores = sortScores(demographics[selectedCategory] ?? {});
  const selectedActual = actualSelections[selectedCategory];

  return (
    <main
      data-figma-screen="014"
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

          <h1 className="mt-2 text-4xl font-light uppercase tracking-[-0.04em] sm:text-5xl md:text-7xl">
            {categoryLabel(selectedCategory)}
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
            Review the predicted demographic attributes and your selected
            attribute for this category.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)_320px]">
          <aside>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Categories
            </div>

            <div className="mt-4 space-y-2">
              {(["race", "age", "gender"] as const).map((category) => {
                const active = category === selectedCategory;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onSelectCategory(category)}
                    className={`w-full border p-4 text-left transition ${
                      active
                        ? "border-zinc-900 bg-white"
                        : "border-zinc-200 hover:bg-white"
                    }`}
                  >
                    <div className="text-xs uppercase tracking-[0.16em]">
                      {categoryLabel(category)}
                    </div>

                    <div className="mt-2 text-sm text-zinc-500">
                      {actualSelections[category]
                        ? formatLabel(actualSelections[category] as string)
                        : "No selection"}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-6 py-5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Selected category
              </div>

              <div className="mt-2 text-3xl font-light">
                {categoryLabel(selectedCategory)}
              </div>
            </div>

            <div className="px-6 py-8">
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Your selection
              </div>

              <div className="mt-3 text-4xl font-light">
                {selectedActual
                  ? formatLabel(selectedActual)
                  : "Not selected"}
              </div>

              <div className="mt-10 border-t border-zinc-200 pt-6">
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  Predicted attributes
                </div>

                <div className="mt-4 space-y-0">
                  {scores.map(([value, score], index) => (
                    <div
                      key={value}
                      className="flex items-center justify-between border-b border-zinc-100 py-4"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xs text-zinc-400">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="text-sm">
                          {formatLabel(value)}
                        </span>
                      </div>

                      <span className="font-mono text-xs">
                        {(score * 100).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="border border-zinc-200 bg-zinc-50">
            <div className="border-b border-zinc-200 px-5 py-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Confidence
              </div>

              <div className="mt-2 text-3xl font-light">
                {scores[0]
                  ? `${(scores[0][1] * 100).toFixed(2)}%`
                  : "—"}
              </div>
            </div>

            <div className="p-5">
              <div className="relative mx-auto grid aspect-square max-w-[220px] place-items-center">
                <div
                  className="absolute inset-5 rotate-45 border border-dashed border-zinc-300"
                  aria-hidden="true"
                />

                <div
                  className="absolute inset-10 rounded-full border border-zinc-300"
                  aria-hidden="true"
                />

                <div
                  className="absolute inset-16 rounded-full border-[5px] border-transparent border-r-black border-t-black"
                  aria-hidden="true"
                />

                <div className="relative text-center">
                  <div className="text-3xl font-light">
                    {scores[0]
                      ? `${(scores[0][1] * 100).toFixed(1)}%`
                      : "—"}
                  </div>

                  <div className="mt-2 text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                    Top prediction
                  </div>
                </div>
              </div>

              {scores[0] && (
                <div className="mt-6 border-t border-zinc-200 pt-5">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                    Predicted attribute
                  </div>

                  <div className="mt-2 text-lg font-light">
                    {formatLabel(scores[0][0])}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        <div className="mt-10">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm tracking-[0.2em] text-zinc-500"
          >
            <FiArrowLeft size={14} />
            BACK
          </button>
        </div>
      </section>
    </main>
  );
}
