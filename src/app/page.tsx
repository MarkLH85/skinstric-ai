'use client';

import Image from 'next/image';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { FiArrowLeft, FiCamera, FiImage, FiMapPin, FiUser, FiX } from 'react-icons/fi';

import { IntroduceYourself } from '@/components/skinstric/onboarding/IntroduceYourself';
import { NameEntry } from '@/components/skinstric/onboarding/NameEntry';
import { ExitConfirmation } from '@/components/skinstric/onboarding/ExitConfirmation';
import { ImageChoice } from '@/components/skinstric/onboarding/ImageChoice';
import { CameraPermission } from '@/components/skinstric/camera/CameraPermission';
import { CameraCapture } from '@/components/skinstric/camera/CameraCapture';
import { AnalysisCategories } from '@/components/skinstric/onboarding/AnalysisCategories';
import { DemographicResults } from '@/components/skinstric/results/DemographicResults';

type Demographics = Record<string, Record<string, number>>;

type Category = 'race' | 'age' | 'gender';

const CATEGORY_ORDER: Category[] = ['race', 'age', 'gender'];

function validateText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 && !/\d/.test(trimmed);
}

function sortScores(values: Record<string, number>) {
  return Object.entries(values).sort((a, b) => b[1] - a[1]);
}

function formatLabel(value: string) {
  return value
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function categoryLabel(category: Category) {
  if (category === 'gender') return 'SEX';
  return category.toUpperCase();
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [landingExpanded, setLandingExpanded] = useState(false);
  const [phase, setPhase] = useState(1);

  // Figma screen state for the reconstructed Skinstric flow.
  const [figmaScreen, setFigmaScreen] = useState<
    | 'landing'
    | 'landingTransition'
    | 'introduction'
    | 'nameEntry'
    | 'exit'
    | 'imageChoice'
    | 'cameraPermission'
    | 'cameraSetup'
    | 'cameraLive'
    | 'cameraCountdown'
    | 'captureReview'
    | 'preparingAnalysis'
    | 'analysisCategories'
    | 'demographics'
    | 'demographicDetail'
  >('landing');
  const [entryStep, setEntryStep] = useState<'location' | 'name'>('location');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [demographics, setDemographics] = useState<Demographics | null>(null);
  const [actualSelections, setActualSelections] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<Category>('race');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [preview, setPreview] = useState('');
  const [pendingImageBase64, setPendingImageBase64] = useState('');
  const [imageSource, setImageSource] = useState<'camera' | 'upload'>('camera');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraRequestRef = useRef(0);

  const stopCamera = useCallback(() => {
    cameraRequestRef.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError('');
    setCameraReady(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not available in this browser. Please use Upload Instead.');
      return;
    }

    let requestId: number | undefined;

    try {
      stopCamera();
      requestId = cameraRequestRef.current;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (requestId !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      const video = videoRef.current;

      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setError('Camera preview could not be initialized.');
        return;
      }

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      setCameraActive(true);

      await new Promise<void>((resolve, reject) => {
        if (video.readyState >= 2) {
          resolve();
          return;
        }

        const handleLoaded = () => {
          cleanup();
          resolve();
        };
        const handleError = () => {
          cleanup();
          reject(new Error('Video preview failed to load.'));
        };
        const cleanup = () => {
          video.removeEventListener('loadedmetadata', handleLoaded);
          video.removeEventListener('error', handleError);
        };

        video.addEventListener('loadedmetadata', handleLoaded, { once: true });
        video.addEventListener('error', handleError, { once: true });
      });

      await video.play();
      const ready = video.videoWidth > 0 && video.videoHeight > 0;
      setCameraReady(ready);

      if (!video.videoWidth || !video.videoHeight) {
        setError('Camera opened, but no video frame is available yet.');
      } else {
        setFigmaScreen((current) => (current === 'cameraSetup' ? 'cameraLive' : current));
      }
    } catch (cameraError) {
      if (requestId !== cameraRequestRef.current) return;
      stopCamera();

      if (cameraError instanceof DOMException) {
        if (cameraError.name === 'NotAllowedError') {
          setError('Camera permission was denied. Allow camera access for localhost, then try again.');
          return;
        }
        if (cameraError.name === 'NotFoundError') {
          setError('No camera was found. Please connect a camera or use Upload Instead.');
          return;
        }
      }

      setError(
        cameraError instanceof Error
          ? cameraError.message
          : 'Unable to access the camera. Please use Upload Instead.'
      );
    }
  }, [stopCamera]);

  useEffect(() => {
    if (phase !== 3 && figmaScreen !== 'cameraSetup') return;

    const timer = window.setTimeout(() => {
      void startCamera();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [phase, figmaScreen, startCamera]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const analyzeBase64 = async (base64: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/phase-two', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Image: base64 })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Skinstric image analysis failed.');
      }

      if (!result.data?.race || !result.data?.age || !result.data?.gender) {
        throw new Error('Skinstric returned incomplete demographic data.');
      }

      setDemographics(result.data);
      setActualSelections({});
      setSelectedCategory('race');
      stopCamera();
      setPhase(4);
      setFigmaScreen('analysisCategories');
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : 'Image analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhaseOne = async () => {
    if (!validateText(name) || !validateText(location)) {
      setError('Name and location are required and cannot contain numbers.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/phase-one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), location: location.trim() })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to save your information.');
      }

      localStorage.setItem('skinstric-name', name.trim());
      localStorage.setItem('skinstric-location', location.trim());
      setPhase(2);
      setFigmaScreen('imageChoice');
    } catch (phaseOneError) {
      setError(phaseOneError instanceof Error ? phaseOneError.message : 'Unable to continue.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      event.target.value = '';
      return;
    }

    setError('');
    const reader = new FileReader();

    reader.onload = async () => {
      if (typeof reader.result !== 'string') {
        setError('Unable to read the selected image.');
        event.target.value = '';
        return;
      }

      const result = reader.result;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      if (!base64) {
        setError('The selected image is empty.');
        event.target.value = '';
        return;
      }

      setPreview(result);
      setPendingImageBase64(base64);
      setImageSource('upload');
      setError('');
      setFigmaScreen('captureReview');
    };

    reader.onerror = () => {
      setError('Unable to read the selected image.');
      event.target.value = '';
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const setCaptureError = (message: string) => {
    setError(message);
    setFigmaScreen((current) =>
      current === 'cameraCountdown' ? 'cameraLive' : current
    );
  };

  const captureSelfie = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !cameraReady) {
      setCaptureError('Wait for the camera preview to become ready.');
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      setCaptureError('Camera video is not ready yet. Please wait a moment and try again.');
      return;
    }

    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (!context) {
      setCaptureError('Unable to capture the camera image.');
      return;
    }

    context.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64 = dataUrl.split(',')[1];

    if (!base64) {
      setCaptureError('Unable to capture a usable camera image.');
      return;
    }

    setPreview(dataUrl);
    setPendingImageBase64(base64);
    setImageSource('camera');
    stopCamera();
    setFigmaScreen('captureReview');
  };

  const proceedWithImage = () => {
    if (!pendingImageBase64) {
      setError('No image is ready to analyze. Please capture or upload an image.');
      return;
    }

    setError('');
    setFigmaScreen('preparingAnalysis');
    void analyzeBase64(pendingImageBase64);
  };

  const selectActual = (category: Category, value: string) => {
    setSelectedCategory(category);
    setActualSelections((current) => ({ ...current, [category]: value }));
  };

  const goBack = () => {
    setError('');
    stopCamera();

    if (phase === 1) {
      setStarted(false);
      return;
    }

    if (phase === 2 || phase === 3) {
      setPhase(1);
      return;
    }

    setPhase(2);
    setDemographics(null);
    setActualSelections({});
  };

  if (figmaScreen === 'introduction') {
    return (
      <IntroduceYourself
        onContinue={() => {
          setEntryStep('location');
          setFigmaScreen('nameEntry');
        }}
        onBack={() => {
          setFigmaScreen('landing');
          setStarted(false);
        }}
      />
    );
  }

  if (figmaScreen === 'nameEntry') {
    return (
      <NameEntry
        step={entryStep}
        name={name}
        location={location}
        error={error}
        loading={loading}
        onNameChange={(value) => {
          setName(value);
          setError('');
        }}
        onLocationChange={(value) => {
          setLocation(value);
          setError('');
        }}
        onContinue={() => {
          if (entryStep === 'location') {
            setError('');
            setEntryStep('name');
            return;
          }

          void handlePhaseOne();
        }}
        onBack={() => {
          setError('');
          if (entryStep === 'name') {
            setEntryStep('location');
            return;
          }
          setFigmaScreen('introduction');
        }}
      />
    );
  }

  if (figmaScreen === 'exit') {
    return (
      <ExitConfirmation
        onStay={() => setFigmaScreen('nameEntry')}
        onExit={() => {
          setFigmaScreen('landing');
          setStarted(false);
        }}
      />
    );
  }

  if (figmaScreen === 'imageChoice') {
    return (
      <ImageChoice
        error={error}
        loading={loading}
        onBack={() => {
          setEntryStep('name');
          setFigmaScreen('nameEntry');
        }}
        onTakePicture={() => setFigmaScreen('cameraPermission')}
        onImageSelected={(event) => {
          setPhase(2);
          handleImageFile(event);
        }}
      />
    );
  }

  if (figmaScreen === 'cameraPermission') {
    return (
      <CameraPermission
        onBack={() => setFigmaScreen('imageChoice')}
        onAllow={() => {
          setError('');
          setImageSource('camera');
          setFigmaScreen('cameraSetup');
          setCameraReady(false);
          setCameraActive(false);
        }}
      />
    );
  }

  if (
    figmaScreen === 'cameraSetup' ||
    figmaScreen === 'cameraLive' ||
    figmaScreen === 'cameraCountdown' ||
    figmaScreen === 'captureReview' ||
    figmaScreen === 'preparingAnalysis'
  ) {
    return (
      <CameraCapture
        screen={figmaScreen}
        source={imageSource}
        videoRef={videoRef}
        canvasRef={canvasRef}
        preview={preview}
        cameraReady={cameraReady}
        loading={loading}
        error={error}
        onBack={() => {
          stopCamera();
          setError('');
          setFigmaScreen('imageChoice');
        }}
        onRetake={() => {
          setError('');
          if (imageSource === 'camera') {
            setPreview('');
            setPendingImageBase64('');
            setCameraReady(false);
            setFigmaScreen('cameraSetup');
            return;
          }
          setPreview('');
          setPendingImageBase64('');
          setFigmaScreen('imageChoice');
        }}
        onBackToReview={() => {
          setError('');
          setFigmaScreen('captureReview');
        }}
        onRetryCamera={() => {
          setError('');
          void startCamera();
        }}
        onCapture={captureSelfie}
        onStartCountdown={() => {
          setError('');
          setFigmaScreen('cameraCountdown');
        }}
        onProceed={proceedWithImage}
        onChooseImage={() => {
          stopCamera();
          setError('');
          setFigmaScreen('imageChoice');
        }}
      />
    );
  }

  if (figmaScreen === 'analysisCategories') {
    return (
      <AnalysisCategories
        onBack={() => setFigmaScreen('captureReview')}
        onContinue={() => setFigmaScreen('demographics')}
      />
    );
  }

  if (
    (figmaScreen === 'demographics' || figmaScreen === 'demographicDetail') &&
    demographics
  ) {
    const detail = figmaScreen === 'demographicDetail';

    return (
      <DemographicResults
        detail={detail}
        demographics={demographics}
        selectedCategory={selectedCategory}
        actualSelections={actualSelections}
        categoryOrder={CATEGORY_ORDER}
        categoryLabel={categoryLabel}
        formatLabel={formatLabel}
        sortScores={sortScores}
        onSelectCategory={setSelectedCategory}
        onSelectAttribute={selectActual}
        onReset={(category) => {
          setActualSelections((current) => {
            const next = { ...current };
            delete next[category];
            return next;
          });
        }}
        onBack={() => {
          if (detail) {
            setSelectedCategory('race');
            setFigmaScreen('demographics');
            return;
          }
          setFigmaScreen('analysisCategories');
        }}
        onContinue={() => {
          if (!detail) setSelectedCategory('age');
          setFigmaScreen(detail ? 'demographics' : 'demographicDetail');
        }}
      />
    );
  }

  return (
    <main className='min-h-screen bg-white text-zinc-900'>
      {!started ? (
        <main
          data-figma-screen={landingExpanded ? '001' : '000'}
          className='relative min-h-screen overflow-hidden bg-[#fcfcfc] text-[#1a1b1c]'
        >
          <header className='absolute inset-x-0 top-0 z-30 flex items-start justify-between px-[clamp(16px,1.667vw,32px)] pt-[clamp(10px,2.4vh,23px)]'>
            <div className='flex items-center gap-[clamp(8px,0.625vw,12px)]'>
              <button
                type='button'
                onClick={() => {
                  setFigmaScreen('introduction');
                  setStarted(true);
                }}
                className='text-[clamp(8px,0.73vw,14px)] font-semibold leading-[1.14] tracking-[-0.02em] uppercase'
                style={{
                  fontSize: 'clamp(8px, 0.73vw, 14px)',
                  fontWeight: 600,
                  lineHeight: 1.14,
                }}
              >
                SKINSTRIC
              </button>

              <span className='flex items-center gap-[6px] opacity-60'>
                <svg aria-hidden='true' className='h-[17px] w-[4px]' viewBox='0 0 4 17' fill='none'>
                  <path d='M3.5 0.5H0.5V16.5H3.5' stroke='currentColor' />
                </svg>
                <span className='text-[clamp(8px,0.73vw,14px)] font-semibold leading-[1.14] tracking-[-0.02em] uppercase'>
                  Intro
                </span>
                <svg aria-hidden='true' className='h-[17px] w-[4px]' viewBox='0 0 4 17' fill='none'>
                  <path d='M0.5 0.5H3.5V16.5H0.5' stroke='currentColor' />
                </svg>
              </span>
            </div>

            <button
              type='button'
              className='absolute right-[clamp(16px,1.667vw,32px)] top-[clamp(8px,1.5625vh,15px)] bg-[#1a1b1c] px-[clamp(8px,0.833vw,16px)] py-[clamp(5px,0.833vh,8px)] text-[clamp(7px,0.52vw,10px)] font-semibold leading-4 tracking-[-0.02em] text-[#fcfcfc] uppercase max-md:text-[10px]'
              style={{
                fontSize: 'clamp(7px, 0.52vw, 10px)',
                fontWeight: 600,
                lineHeight: '16px',
              }}
            >
              Enter code
            </button>
          </header>

          <Image
            src='/skinstric/landing-rhombus.svg'
            alt=''
            aria-hidden='true'
            width={604}
            height={604}
            loading='eager'
            className={`pointer-events-none absolute top-[18.65vh] h-auto w-[clamp(240px,31.46vw,604px)] transition-[opacity,translate] duration-700 ease-in-out ${
              landingExpanded
                ? 'left-[-40vw] opacity-0 max-md:left-[-15.68vw] max-md:opacity-100'
                : 'left-[-15.68vw] opacity-100'
            }`}
          />
          <Image
            src='/skinstric/landing-rhombus.svg'
            alt=''
            aria-hidden='true'
            width={604}
            height={604}
            loading='eager'
            className={`pointer-events-none absolute right-[-15.68vw] top-[18.65vh] h-auto w-[clamp(240px,31.46vw,604px)] transition-opacity duration-700 ease-in-out ${
              landingExpanded ? 'opacity-0 max-md:opacity-100' : 'opacity-100'
            }`}
          />
          <Image
            src='/skinstric/intro-rhombuses.svg'
            alt=''
            aria-hidden='true'
            width={764}
            height={764}
            loading='eager'
            className={`pointer-events-none absolute right-[-19.84vw] top-[10.31vh] h-auto w-[min(39.6875vw,762px)] transition-opacity duration-700 ease-in-out ${
              landingExpanded ? 'opacity-100 max-md:opacity-0' : 'opacity-0'
            }`}
          />

          <h1
            className={`absolute z-10 whitespace-nowrap text-[clamp(40px,6.667vw,128px)] font-light leading-[clamp(40px,6.25vw,120px)] tracking-[-0.07em] max-md:text-[clamp(44px,15vw,80px)] max-md:leading-[clamp(44px,14vw,76px)] transition-[left,top,translate] duration-700 ease-in-out ${
              landingExpanded
                ? 'left-[clamp(24px,1.667vw,32px)] top-[37.6vh] translate-x-0 text-left max-md:left-1/2 max-md:top-[30vh] max-md:-translate-x-1/2 max-md:text-center'
                : 'left-1/2 top-[37.6vh] -translate-x-1/2 text-center max-md:top-[30vh]'
            }`}
          >
            Sophisticated
            <br />
            skincare
          </h1>

          <button
            type='button'
            onClick={() => {
              setFigmaScreen('introduction');
              setStarted(true);
            }}
            className={`group absolute left-[clamp(12px,1.667vw,32px)] top-[47.7083vh] z-20 flex items-center gap-[clamp(8px,0.833vw,16px)] transition-opacity duration-700 ease-in-out ${
              landingExpanded ? 'pointer-events-none opacity-0 max-md:pointer-events-auto max-md:opacity-100' : 'opacity-100'
            }`}
          >
            <span className='relative size-[clamp(28px,2.292vw,44px)] shrink-0 opacity-70 transition-transform duration-300 group-hover:rotate-90'>
              <Image
                src='/skinstric/landing-cta-diamond.svg'
                alt=''
                aria-hidden='true'
                width={44}
                height={44}
                loading='eager'
                className='absolute inset-0 h-full w-full'
              />
              <Image
                src='/skinstric/landing-cta-arrow.svg'
                alt=''
                aria-hidden='true'
                width={9.42857}
                height={10.8872}
                loading='eager'
                className='absolute left-[35.71%] top-[37.63%] w-[21.43%]'
                style={{ height: 'auto' }}
              />
            </span>
            <span className='text-[clamp(9px,0.73vw,14px)] font-semibold leading-4 tracking-[-0.02em] uppercase opacity-70 max-md:text-[13px]'>
              Discover A.I.
            </span>
          </button>

          <button
            type='button'
            onClick={() => {
              setFigmaScreen('introduction');
              setStarted(true);
            }}
            onPointerEnter={() => setLandingExpanded(true)}
            onPointerLeave={() => setLandingExpanded(false)}
            onFocus={() => setLandingExpanded(true)}
            onBlur={() => setLandingExpanded(false)}
            className={`group absolute right-[clamp(18px,1.667vw,32px)] z-20 flex w-max items-center ${
              landingExpanded
                ? 'top-[45.9375vh] gap-[clamp(8px,1.25vw,24px)] max-md:top-[47.7083vh] max-md:gap-[clamp(8px,0.833vw,16px)]'
                : 'top-[47.7083vh] gap-[clamp(8px,0.833vw,16px)]'
            }`}
          >
            <span className='shrink-0 whitespace-nowrap text-right text-[clamp(9px,0.73vw,14px)] font-semibold leading-4 tracking-[-0.02em] uppercase opacity-70 max-md:text-[13px]'>
              Take test
            </span>
            <span
              className={`relative shrink-0 opacity-70 transition-[width,height,transform] duration-300 group-hover:rotate-90 ${
                landingExpanded
                  ? 'size-[clamp(28px,4.0625vw,78px)] max-md:size-[clamp(28px,2.292vw,44px)]'
                  : 'size-[clamp(28px,2.292vw,44px)]'
              }`}
            >
              <Image
                src='/skinstric/landing-cta-diamond.svg'
                alt=''
                aria-hidden='true'
                width={44}
                height={44}
                loading='eager'
                className='absolute inset-0 h-full w-full'
              />
              <Image
                src='/skinstric/landing-cta-arrow.svg'
                alt=''
                aria-hidden='true'
                width={9.42857}
                height={10.8872}
                loading='eager'
                className='absolute left-[42.53%] top-[37.63%] w-[21.43%] -scale-x-100'
                style={{ height: 'auto' }}
              />
            </span>
          </button>

          <p className='absolute left-[clamp(16px,1.667vw,32px)] top-[89.8vh] z-20 w-max whitespace-nowrap text-[clamp(8px,0.73vw,14px)] font-normal leading-[1.714] uppercase max-md:text-[11px]'>
            Skinstric developed an A.I. that creates
            <br />
            a highly-personalised routine tailored to
            <br />
            what your skin needs.
          </p>
        </main>
      ) : (
        <>
          <header className='flex items-start justify-between px-5 py-6 sm:px-8 md:px-10'>
            <button onClick={() => setStarted(false)} className='text-left text-[10px] font-semibold tracking-[0.18em] sm:text-xs'>
              SKINSTRIC <span className='ml-3 text-zinc-400'>[ INTRO ]</span>
            </button>
            <button className='bg-black px-3 py-2 text-[9px] font-semibold tracking-[0.1em] text-white sm:px-4'>ENTER CODE</button>
          </header>

          <section className='mx-auto max-w-7xl px-5 pb-10 sm:px-8 md:px-10'>
            {phase === 1 && (
              <div className='mx-auto max-w-4xl py-8 md:py-14'>
                <div className='text-center'>
                  <div className='text-xs tracking-[0.4em] text-zinc-500'>STEP 01</div>
                  <h1 className='mt-5 text-5xl font-light tracking-tight md:text-7xl'>Discover your skin.</h1>
                  <p className='mt-6 text-base text-zinc-500'>Let us begin with a little information about you.</p>
                </div>

                <div className='mx-auto mt-14 max-w-2xl space-y-10'>
                  <label className='block'>
                    <span className='flex items-center gap-2 text-sm font-semibold tracking-[0.18em]'><FiUser /> NAME</span>
                    <input value={name} onChange={(event) => setName(event.target.value)} className='mt-5 w-full border-b border-zinc-300 bg-transparent py-3 text-lg outline-none focus:border-zinc-900' placeholder='Enter your name' aria-label='Name' />
                  </label>
                  <label className='block'>
                    <span className='flex items-center gap-2 text-sm font-semibold tracking-[0.18em]'><FiMapPin /> LOCATION</span>
                    <input value={location} onChange={(event) => setLocation(event.target.value)} className='mt-5 w-full border-b border-zinc-300 bg-transparent py-3 text-lg outline-none focus:border-zinc-900' placeholder='Enter your location' aria-label='Location' />
                  </label>
                </div>

                {error && <p className='mx-auto mt-8 max-w-2xl text-sm text-red-600'>{error}</p>}

                <div className='mt-12 flex items-center justify-between'>
                  <button onClick={goBack} className='flex items-center gap-2 text-sm tracking-[0.2em] text-zinc-500'><FiArrowLeft /> BACK</button>
                  <button onClick={handlePhaseOne} disabled={loading || !validateText(name) || !validateText(location)} className='bg-black px-7 py-4 text-sm tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:bg-zinc-300'>{loading ? 'PROCESSING...' : 'PROCEED'}</button>
                </div>
              </div>
            )}

            {phase === 2 && (
              <div className='mx-auto max-w-5xl py-8 md:py-14'>
                <div className='text-center'>
                  <div className='text-xs tracking-[0.4em] text-zinc-500'>STEP 02</div>
                  <h1 className='mt-5 text-5xl font-light tracking-tight md:text-7xl'>Upload your image.</h1>
                  <p className='mt-6 text-base text-zinc-500'>Upload an image so Skinstric AI can analyze your demographics.</p>
                </div>

                <div className='mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2'>
                  <label className='flex min-h-56 cursor-pointer flex-col items-center justify-center border border-zinc-200 bg-transparent p-8 text-center transition hover:border-zinc-900'>
                    <FiImage className='mb-5 text-3xl' />
                    <span className='text-sm font-semibold tracking-[0.18em]'>UPLOAD IMAGE</span>
                    <span className='mt-3 text-sm text-zinc-500'>JPG, PNG, or another supported image format</span>
                    <input ref={fileInputRef} type='file' accept='image/*' onChange={handleImageFile} className='sr-only' disabled={loading} />
                  </label>

                  <button onClick={() => { setError(''); setPhase(3); }} disabled={loading} className='flex min-h-56 flex-col items-center justify-center border border-zinc-200 bg-transparent p-8 text-center transition hover:border-black hover:bg-zinc-50 disabled:cursor-not-allowed'>
                    <FiCamera className='mb-5 text-3xl' />
                    <span className='text-sm font-semibold tracking-[0.18em]'>TAKE A PICTURE</span>
                    <span className='mt-3 text-sm text-zinc-500'>Open your camera and take a selfie</span>
                  </button>
                </div>

                {loading && <p className='mt-6 text-center text-sm text-zinc-500'>ANALYZING IMAGE...</p>}
                {error && <p className='mt-6 text-center text-sm text-red-600'>{error}</p>}

                <div className='mt-12'><button onClick={goBack} className='flex items-center gap-2 text-sm tracking-[0.2em] text-zinc-500'><FiArrowLeft /> BACK</button></div>
              </div>
            )}

            {phase === 3 && (
              <div className='mx-auto max-w-5xl py-8 md:py-14'>
                <div className='text-center'>
                  <div className='text-xs tracking-[0.4em] text-zinc-500'>STEP 03</div>
                  <h1 className='mt-5 text-5xl font-light tracking-tight md:text-7xl'>Take a selfie.</h1>
                  <p className='mt-6 text-base text-zinc-500'>Center your face in the frame, then take your picture.</p>
                </div>

                <div className='mx-auto mt-10 max-w-3xl overflow-hidden border border-zinc-200 bg-black'>
                  <video ref={videoRef} autoPlay muted playsInline className='aspect-video h-auto w-full object-cover' aria-label='Camera preview' />
                </div>

                <div className='mx-auto mt-7 grid max-w-3xl gap-4 sm:grid-cols-2'>
                  <button onClick={captureSelfie} disabled={!cameraReady || loading} className='flex items-center justify-center gap-3 bg-black px-6 py-4 text-xs tracking-[0.18em] text-white disabled:cursor-not-allowed disabled:bg-zinc-300'><FiCamera /> {loading ? 'ANALYZING...' : 'TAKE PICTURE'}</button>
                  <button onClick={stopCamera} disabled={!cameraActive} className='flex items-center justify-center gap-3 border border-zinc-300 px-6 py-4 text-xs tracking-[0.18em] disabled:cursor-not-allowed disabled:text-zinc-300'><FiX /> STOP CAMERA</button>
                </div>

                {error && <p className='mt-6 text-center text-sm text-red-600'>{error}</p>}
                <div className='mt-10'><button onClick={goBack} className='flex items-center gap-2 text-sm tracking-[0.2em] text-zinc-500'><FiArrowLeft /> BACK</button></div>
                <canvas ref={canvasRef} className='hidden' />
              </div>
            )}

            {phase === 4 && demographics && (
              <div className='py-4 md:py-8'>
                <div className='mb-8 border-b border-zinc-200 pb-6'>
                  <div className='text-xs font-semibold tracking-[0.12em]'>A.I. ANALYSIS</div>
                  <div className='mt-1 flex flex-wrap items-end justify-between gap-4'>
                    <h1 className='text-5xl font-light uppercase tracking-tight md:text-7xl'>DEMOGRAPHICS</h1>
                    <div className='text-xs font-medium uppercase tracking-[0.18em] text-zinc-500'>
                      PREDICTED RACE &amp; AGE
                    </div>
                  </div>
                </div>

                <div className='grid gap-8 lg:grid-cols-[150px_minmax(0,1fr)_260px]'>
                  <aside className='order-2 lg:order-1'>
                    <div className='mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500'>
                      SELECT ATTRIBUTE
                    </div>

                    <div className='space-y-2'>
                      {CATEGORY_ORDER.map((category) => {
                        const ranked = sortScores(demographics[category]);
                        const top = ranked[0];
                        const selected = selectedCategory === category;

                        return (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`w-full border p-4 text-left transition ${selected ? "" : "opacity-70"}`}
                          >
                            <div className='text-[10px] uppercase tracking-[0.18em] opacity-60'>
                              {categoryLabel(category)}
                            </div>
                            <div className='mt-2 text-lg font-light'>
                              {top ? formatLabel(top[0]) : 'ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â'}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className='mt-6 border-t border-zinc-200 pt-5'>
                      <div className='text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500'>
                        ACTUAL
                      </div>

                      <div className='mt-4 space-y-4'>
                        {CATEGORY_ORDER.map((category) => (
                          <div key={category}>
                            <div className='text-[10px] uppercase tracking-[0.18em] text-zinc-400'>
                              {categoryLabel(category)}
                            </div>
                            <div className='mt-1 text-sm font-medium'>
                              {actualSelections[category]
                                ? formatLabel(actualSelections[category])
                                : 'Select above'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </aside>

                  <section className='order-1 border border-zinc-200 bg-zinc-50 lg:order-2'>
                    {(() => {
                      const ranked = sortScores(demographics[selectedCategory]);
                      const [topValue, topScore] = ranked[0] || ['ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â', 0];
                      const confidence = Math.max(0, Math.min(100, topScore * 100));
                      const rotation = Math.round(topScore * 360);


                      return (
                        <div className='flex min-h-[420px] flex-col'>
                          <div className='border-b border-zinc-200 px-6 py-5'>
                            <div className='text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500'>
                              {categoryLabel(selectedCategory)} ANALYSIS
                            </div>
                            <div className='mt-2 text-3xl font-light sm:text-4xl'>
                              {formatLabel(topValue)}
                            </div>
                          </div>

                          <div className='flex flex-1 items-center justify-center px-4 py-6'>
                            <div className='relative grid h-56 w-56 place-items-center sm:h-64 sm:w-64'>
                              <div
                                className='absolute inset-0 rotate-45 border border-dashed border-zinc-300'
                                aria-hidden='true'
                              />
                              <div
                                className='absolute inset-5 rounded-full border border-zinc-300'
                                aria-hidden='true'
                              />
                              <div
                                className='absolute inset-9 rounded-full border-[5px] border-transparent border-r-black border-t-black'
                                 style={{ transform: `rotate(${rotation}deg)` }}

                                aria-hidden='true'
                              />
                              <div className='relative text-center'>
                                <div className='text-4xl font-light sm:text-5xl'>
                                  {confidence.toFixed(2)}%
                                </div>
                                <div className='mt-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500'>
                                  A.I. CONFIDENCE
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className='border-t border-zinc-200 px-6 py-4 text-center text-[10px] uppercase tracking-[0.18em] text-zinc-500'>
                            Select a category to view its predicted attribute.
                          </div>
                        </div>
                      );
                    })()}
                  </section>

                  <aside className='order-3 border border-zinc-200'>
                    <div className='border-b border-zinc-200 px-5 py-4'>
                      <div className='text-[10px] font-semibold uppercase tracking-[0.2em]'>
                        {categoryLabel(selectedCategory)}
                      </div>
                      <div className='mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-400'>
                        A.I. CONFIDENCE
                      </div>
                    </div>

                    <div>
                      {sortScores(demographics[selectedCategory]).map(
                        ([value, score], index) => {

                          return (
                            <button
                              key={value}
                              onClick={() => selectActual(selectedCategory, value)}
                              className={`flex w-full items-center justify-between border-b border-zinc-100 px-5 py-4 text-left transition`}
                            >
                              <span className='flex items-center gap-3'>
                                <span className='text-xs'>
                                  {index === 0 ? '?' : '?'}
                                </span>
                                <span className='text-sm'>
                                  {formatLabel(value)}
                                </span>
                              </span>

                              <span className='font-mono text-xs'>
                                {(score * 100).toFixed(2)}%
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>

                    <div className='px-5 py-4 text-[10px] leading-5 text-zinc-400'>
                      If the A.I. estimate is wrong, select the attribute that
                      actually applies to you.
                    </div>
                  </aside>
                </div>

                {preview && (
                  <div className='mx-auto mt-6 max-w-sm'>
                    <Image
                      src={preview}
                      alt='Analysis image'
                      width={1280}
                      height={720}
                      unoptimized
                      className='h-auto w-full border border-zinc-200'
                    />
                  </div>
                )}

                <div className='mt-10 flex items-center justify-between'>
                  <button
                    onClick={goBack}
                    className='flex items-center gap-2 text-sm tracking-[0.2em] text-zinc-500'
                  >
                    <FiArrowLeft /> BACK
                  </button>

                  <button
                    onClick={() => {
                      setDemographics(null);
                      setActualSelections({});
                      setPhase(2);
                    }}
                    className='text-sm tracking-[0.2em]'
                  >
                    HOME
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
