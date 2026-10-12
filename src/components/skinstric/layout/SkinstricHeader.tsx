"use client";

type SkinstricHeaderProps = {
  showIntro?: boolean;
  onLogoClick?: () => void;
};

export function SkinstricHeader({
  showIntro = true,
  onLogoClick,
}: SkinstricHeaderProps) {
  return (
    <header className="absolute left-0 right-0 top-0 z-30 h-16">
      <button
        type="button"
        onClick={onLogoClick}
        className="absolute left-8 top-[23px] text-[14px] font-semibold uppercase leading-4 tracking-[-0.28px]"
      >
        SKINSTRIC
      </button>

      {showIntro && (
        <div className="absolute left-[117px] top-[23px] flex items-start gap-[6px] opacity-60">
          <span className="mt-[1px] h-[17px] w-[4px] border-x border-[#1a1b1c]" />
          <span className="text-[14px] font-semibold uppercase leading-4 tracking-[-0.28px]">
            INTRO
          </span>
          <span className="mt-[1px] h-[17px] w-[4px] border-x border-[#1a1b1c]" />
        </div>
      )}
    </header>
  );
}
