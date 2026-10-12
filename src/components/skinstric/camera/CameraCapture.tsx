"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FiCamera } from "react-icons/fi";
import { DiamondControl } from "@/components/skinstric/layout/DiamondControl";

export type CameraCaptureScreen =
  | "cameraSetup"
  | "cameraLive"
  | "cameraCountdown"
  | "captureReview"
  | "preparingAnalysis";

type CameraCaptureProps = {
  screen: CameraCaptureScreen;
  source: "camera" | "upload";
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  preview: string;
  cameraReady: boolean;
  loading: boolean;
  error: string;
  onBack: () => void;
  onRetake: () => void;
  onBackToReview: () => void;
  onRetryCamera: () => void;
  onCapture: () => void;
  onStartCountdown: () => void;
  onProceed: () => void;
  onChooseImage: () => void;
};

const guidance = ["Neutral Expression", "Frontal Pose", "Adequate Lighting"];

export function CameraCapture({
  screen,
  source,
  videoRef,
  canvasRef,
  preview,
  cameraReady,
  loading,
  error,
  onBack,
  onRetake,
  onBackToReview,
  onRetryCamera,
  onCapture,
  onStartCountdown,
  onProceed,
  onChooseImage,
}: CameraCaptureProps) {
  const [countdown, setCountdown] = useState(3);
  const captureRef = useRef(onCapture);

  useEffect(() => {
    captureRef.current = onCapture;
  }, [onCapture]);

  useEffect(() => {
    if (screen !== "cameraCountdown") return;

    let remaining = 3;

    const timer = window.setInterval(() => {
      remaining -= 1;
      if (remaining === 0) {
        window.clearInterval(timer);
        captureRef.current();
        return;
      }
      setCountdown(remaining);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [screen]);

  const isDarkScreen =
    screen === "cameraLive" ||
    screen === "cameraCountdown" ||
    screen === "captureReview";

  return (
    <main
      data-figma-screen={
        screen === "cameraSetup"
          ? "007"
          : screen === "cameraLive"
            ? "009"
            : screen === "cameraCountdown"
              ? "008"
              : screen === "captureReview"
                ? "010"
                : "011"
      }
      className={`relative min-h-screen overflow-hidden ${
        isDarkScreen
          ? "bg-[#cdcecc] text-[#fcfcfc]"
          : "bg-[#fcfcfc] text-[#1a1b1c]"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        aria-label={
          screen === "cameraLive" || screen === "cameraCountdown"
            ? "Live camera preview"
            : undefined
        }
        aria-hidden={screen !== "cameraLive" && screen !== "cameraCountdown"}
        className={`fixed z-0 bg-[#cdcecc] object-cover ${
          screen === "cameraLive" || screen === "cameraCountdown"
            ? "left-[15.72vw] top-[3.75vh] h-[96.25vh] w-[64.17vw] opacity-100"
            : "pointer-events-none -left-[2px] -top-[2px] h-px w-px opacity-0"
        }`}
      />
      <canvas ref={canvasRef} className="hidden" />
      {screen === "captureReview" && preview && (
        <Image
          src={preview}
          alt="Captured image preview"
          unoptimized
          width={1232}
          height={924}
          className="fixed left-[15.72vw] top-[3.75vh] z-0 h-[96.25vh] w-[64.17vw] object-cover"
        />
      )}

      {(screen === "cameraLive" ||
        screen === "cameraCountdown" ||
        screen === "captureReview") && (
        <header className="absolute inset-x-0 top-0 z-20 flex h-[3.333vw] items-center px-[1.667vw]">
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
      )}

      {(screen === "cameraSetup" || screen === "preparingAnalysis") && (
        <>
          <Image
            src="/skinstric/camera-rhombuses.svg"
            alt=""
            aria-hidden="true"
            width={740}
            height={740}
            className="pointer-events-none absolute left-1/2 top-[11.57vh] z-0 h-auto w-[min(38.53vw,740px)] -translate-x-1/2"
          />
          {screen === "cameraSetup" && (
            <>
              <Image
                src="/skinstric/camera-shutter-icon.svg"
                alt=""
                aria-hidden="true"
                width={114}
                height={114}
                className="absolute left-1/2 top-[44.17vh] z-10 h-auto w-[min(5.94vw,114px)] -translate-x-1/2"
              />
              <p
                className="absolute left-1/2 top-[58.96vh] z-10 -translate-x-1/2 whitespace-nowrap text-center text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-[1.714] tracking-[-0.02em]"
                role="status"
                aria-live="polite"
              >
                Setting up camera ...
              </p>
              {!error && (
                <>
                  <p className="absolute left-1/2 top-[75.6vh] z-10 -translate-x-1/2 text-center text-[clamp(8px,0.73vw,14px)] uppercase leading-[1.714]">
                    To get better results make sure to have
                  </p>
                  <Guidance className="top-[79.8vh] text-[#1a1b1c]" />
                </>
              )}
              {error && (
                <div className="absolute left-1/2 top-[64%] z-20 -translate-x-1/2 text-center">
                  <p className="max-w-sm text-sm text-red-600" role="alert">
                    {error}
                  </p>
                  <div className="mt-4 flex justify-center gap-5">
                    <button
                      type="button"
                      onClick={onChooseImage}
                      className="text-xs font-semibold uppercase tracking-[0.12em] underline"
                    >
                      Use gallery
                    </button>
                    <button
                      type="button"
                      onClick={onRetryCamera}
                      className="text-xs font-semibold uppercase tracking-[0.12em] underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          {screen === "preparingAnalysis" && (
            <>
              <p
                className="absolute left-1/2 top-[48.75vh] z-10 w-[227px] -translate-x-1/2 whitespace-nowrap text-center text-[clamp(8px,0.833vw,16px)] font-semibold uppercase leading-[1.5] tracking-[-0.02em]"
                role="status"
                aria-live="polite"
              >
                Preparing your analysis ...
              </p>
              {loading && !error && (
                <span className="sr-only">Analysis in progress</span>
              )}
              {error && (
                <div className="absolute left-1/2 top-[56%] z-20 -translate-x-1/2 text-center">
                  <p className="max-w-sm text-sm text-red-600" role="alert">
                    {error}
                  </p>
                  <div className="mt-4 flex justify-center gap-5">
                    <button
                      type="button"
                      onClick={onBackToReview}
                      className="text-xs font-semibold uppercase tracking-[0.12em] underline"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={onProceed}
                      className="text-xs font-semibold uppercase tracking-[0.12em] underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {(screen === "cameraLive" || screen === "cameraCountdown") && (
        <>
          {screen === "cameraCountdown" && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-center text-[#fcfcfc]"
              role="status"
              aria-live="assertive"
            >
              <p className="text-[clamp(10px,0.833vw,16px)] font-semibold uppercase tracking-[0.12em]">
                Hold still
              </p>
              <span className="text-[clamp(48px,8.333vw,160px)] font-light leading-none tabular-nums">
                {countdown}
              </span>
            </div>
          )}
          {error && (
            <p
              className="absolute left-1/2 top-[32%] z-20 -translate-x-1/2 text-center text-sm text-red-200"
              role="alert"
            >
              {error}
            </p>
          )}
          <p className="absolute left-1/2 top-[88.96vh] z-10 -translate-x-1/2 text-center text-[clamp(8px,0.73vw,14px)] uppercase leading-[1.714] text-[#fcfcfc]">
            To get better results make sure to have
          </p>
          <Guidance className="top-[93.125vh] text-[#fcfcfc]" />
          <div className="absolute inset-x-[1.667vw] bottom-[3.75vh] z-20 flex items-end justify-between gap-[1vw]">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-[0.833vw] text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-4 tracking-[-0.02em] opacity-70"
            >
              <span className="size-[clamp(22px,2.292vw,44px)]">
                <DiamondControl direction="left" tone="light" />
              </span>
              Back
            </button>
          </div>
          {screen === "cameraLive" && (
            <button
              type="button"
              onClick={() => {
                setCountdown(3);
                onStartCountdown();
              }}
              disabled={!cameraReady}
              className="absolute right-[1.667vw] top-[46.77vh] z-20 flex items-center gap-[0.833vw] text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-4 tracking-[-0.02em] opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Take picture
              <span className="grid size-[clamp(32px,3.23vw,62px)] place-items-center rounded-full border border-white">
                <FiCamera className="size-[clamp(16px,1.4vw,27px)]" aria-hidden="true" />
              </span>
            </button>
          )}
        </>
      )}

      {screen === "captureReview" && (
        <>
          <p className="sr-only" aria-live="polite">
            {source === "camera" ? "Great shot!" : "Image ready"}
          </p>
          <p className="absolute left-1/2 top-[88.96vh] z-10 -translate-x-1/2 text-center text-[clamp(8px,0.73vw,14px)] uppercase leading-[1.714] text-[#fcfcfc]">
            To get better results make sure to have
          </p>
          <Guidance className="top-[93.125vh] text-[#fcfcfc]" />
          <div className="absolute inset-x-[1.667vw] bottom-[3.75vh] z-20 flex items-center justify-between">
            <button
              type="button"
              onClick={onRetake}
              className="flex items-center gap-[0.833vw] text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-4 tracking-[-0.02em]"
            >
              <span className="size-[clamp(22px,2.292vw,44px)]">
                <DiamondControl direction="left" tone="light" />
              </span>
              Back
            </button>
            <button
              type="button"
              onClick={onProceed}
              className="flex items-center gap-[0.833vw] text-[clamp(8px,0.73vw,14px)] font-semibold uppercase leading-4 tracking-[-0.02em]"
            >
              Proceed
              <span className="size-[clamp(22px,2.292vw,44px)]">
                <DiamondControl direction="right" tone="light" />
              </span>
            </button>
          </div>
        </>
      )}
    </main>
  );
}

function Guidance({ className }: { className: string }) {
  return (
    <div
      className={`absolute left-1/2 z-10 flex -translate-x-1/2 flex-wrap justify-center gap-x-[1.667vw] gap-y-2 px-[1vw] text-[clamp(8px,0.73vw,14px)] uppercase ${className}`}
    >
      {guidance.map((item) => (
        <span key={item} className="flex items-center gap-[0.26vw] whitespace-nowrap leading-[1.714]">
          <span className="size-[clamp(5px,0.417vw,8px)] rotate-45 border border-current" aria-hidden="true" />
          {item}
        </span>
      ))}
    </div>
  );
}
