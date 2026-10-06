'use client';

import Image from 'next/image';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { FiArrowLeft, FiCamera, FiImage, FiMapPin, FiUser, FiX } from 'react-icons/fi';

type Demographics = Record<string, Record<string, number>>;

const CATEGORY_ORDER = ['race', 'age', 'gender'];

function validateText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 && !/\d/.test(trimmed);
}

function sortScores(values: Record<string, number>) {
  return Object.entries(values).sort((a, b) => b[1] - a[1]);
}

function formatLabel(value: string) {
  return value
    .replace(/-/g, '\u2192')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function Home() {
  const [phase, setPhase] = useState(1);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [demographics, setDemographics] = useState<Demographics | null>(null);
  const [actualSelections, setActualSelections] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [preview, setPreview] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopCamera = useCallback(() => {
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

    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setCameraActive(false);
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

      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setCameraReady(true);
        setError('');
      } else {
        setError('Camera opened, but no video frame is available yet.');
      }
    } catch (cameraError) {
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
    if (phase !== 3) return;

    const timer = window.setTimeout(() => {
      void startCamera();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [phase, startCamera]);

  const analyzeBase64 = async (base64: string, destinationPhase = 2) => {
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

      if (!result.data) {
        throw new Error('Skinstric returned no demographic data.');
      }

      setDemographics(result.data);
      setActualSelections({});
      setPhase(destinationPhase);
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
    } catch (phaseOneError) {
      setError(phaseOneError instanceof Error ? phaseOneError.message : 'Unable to continue.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    setError('');

    const reader = new FileReader();

    reader.onload = async () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;

      setPreview(result);
      await analyzeBase64(base64, 2);
    };

    reader.onerror = () => setError('Unable to read the selected image.');
    reader.readAsDataURL(file);
  };

  const captureSelfie = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !cameraReady) {
      setError('Wait for the camera preview to become ready.');
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      setError('Camera video is not ready yet. Please wait a moment and try again.');
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    if (!context) {
      setError('Unable to capture the camera image.');
      return;
    }

    context.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64 = dataUrl.split(',')[1];

    setPreview(dataUrl);
    stopCamera();
    await analyzeBase64(base64, 3);
  };

  const selectActual = (category: string, value: string) => {
    setActualSelections((current) => ({
      ...current,
      [category]: value
    }));
  };

  const goBack = () => {
    setError('');

    if (phase === 1) return;

    stopCamera();
    if (phase === 2) {
    setPhase(1);
  } else {
    setPhase(2);
  }
  };

  const beginPhaseThree = () => {
    setError('');
    setPreview('');
    setDemographics(null);
    setActualSelections({});
    setPhase(3);
  };

  return (
    <main className='min-h-screen bg-white text-zinc-900'>
      <header className='border-b border-zinc-200 px-6 py-6 md:px-10'>
        <div className='mx-auto flex max-w-7xl items-start justify-between'>
          <div>
            <div className='text-sm font-semibold tracking-[0.35em]'>SKINSTRIC</div>
            <div className='mt-2 text-xs tracking-[0.18em] text-zinc-500'>AI SKIN ANALYSIS</div>
          </div>
          <div className='text-right text-xs tracking-[0.2em] text-zinc-500'>
            <div>FRONTEND SIMPLIFIED</div>
            <div className='mt-2'>SKINSTRIC AI PROJECT</div>
          </div>
        </div>
      </header>

      <section className='mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14'>
        {phase === 1 && (
          <div className='mx-auto max-w-4xl'>
            <div className='text-center'>
              <div className='text-xs tracking-[0.4em] text-zinc-500'>STEP 01</div>
              <h1 className='mt-5 text-5xl font-light tracking-tight md:text-7xl'>Discover your skin.</h1>
              <p className='mt-6 text-base text-zinc-500'>Let us begin with a little information about you.</p>
            </div>

            <div className='mx-auto mt-16 max-w-2xl space-y-10'>
              <label className='block'>
                <span className='flex items-center gap-2 text-sm font-semibold tracking-[0.18em]'>
                  <FiUser /> NAME
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className='mt-5 w-full border-b border-zinc-300 bg-transparent py-3 text-lg outline-none focus:border-zinc-900'
                  placeholder='Enter your name'
                  aria-label='Name'
                />
              </label>

              <label className='block'>
                <span className='flex items-center gap-2 text-sm font-semibold tracking-[0.18em]'>
                  <FiMapPin /> LOCATION
                </span>
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className='mt-5 w-full border-b border-zinc-300 bg-transparent py-3 text-lg outline-none focus:border-zinc-900'
                  placeholder='Enter your location'
                  aria-label='Location'
                />
              </label>
            </div>

            {error && <p className='mx-auto mt-8 max-w-2xl text-sm text-red-600'>{error}</p>}

            <div className='mt-12 flex items-center justify-between'>
              <button onClick={goBack} className='flex items-center gap-2 text-sm tracking-[0.2em] text-zinc-500'>
                <FiArrowLeft /> BACK
              </button>
              <button
                onClick={handlePhaseOne}
                disabled={loading || !validateText(name) || !validateText(location)}
                className='bg-black px-7 py-4 text-sm tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:bg-zinc-300'
              >
                {loading ? 'PROCESSING...' : 'PROCEED'}
              </button>
            </div>
          </div>
        )}

        {phase === 2 && !demographics && (
          <div className='mx-auto max-w-4xl'>
            <div className='text-center'>
              <div className='text-xs tracking-[0.4em] text-zinc-500'>STEP 02</div>

              <h1 className='mt-5 text-5xl font-light tracking-tight md:text-7xl'>
                Upload your image.
              </h1>

              <p className='mt-6 text-base text-zinc-500'>
                Upload an image so Skinstric AI can analyze your demographics.
              </p>
            </div>

            <div className='mx-auto mt-14 max-w-xl'>
              <label className='flex min-h-64 cursor-pointer flex-col items-center justify-center border border-dashed border-zinc-300 p-10 text-center transition hover:border-zinc-900'>
                <FiImage className='mb-5 text-3xl' />

                <span className='text-sm font-semibold tracking-[0.18em]'>
                  UPLOAD IMAGE
                </span>

                <span className='mt-3 text-sm text-zinc-500'>
                  JPG, PNG, or another supported image format
                </span>

                <input
                  type='file'
                  accept='image/*'
                  onChange={handleImageFile}
                  className='sr-only'
                  disabled={loading}
                />
              </label>

              {loading && (
                <p className='mt-6 text-center text-sm text-zinc-500'>
                  ANALYZING IMAGE...
                </p>
              )}

              {error && (
                <p className='mt-6 text-center text-sm text-red-600'>
                  {error}
                </p>
              )}
            </div>

            <div className='mt-12'>
              <button
                onClick={goBack}
                className='flex items-center gap-2 text-sm tracking-[0.2em] text-zinc-500'
              >
                <FiArrowLeft /> BACK
              </button>
            </div>
          </div>
        )}

        {phase === 2 && demographics && (
          <div>
            <div className='text-center'>
              <div className='text-xs tracking-[0.4em] text-zinc-500'>STEP 02</div>
              <h1 className='mt-5 text-5xl font-light tracking-tight md:text-7xl'>Your skin profile.</h1>
              <p className='mt-6 text-base text-zinc-500'>Review the analysis and select the values that match you.</p>
            </div>

            <div className='mt-12 grid gap-8 lg:grid-cols-[1fr_280px]'>
              <div className='space-y-8'>
                {CATEGORY_ORDER.filter((category) => demographics[category]).map((category) => (
                  <section key={category} className='border-t border-zinc-200 pt-6'>
                    <h2 className='text-sm font-semibold tracking-[0.2em]'>{category.toUpperCase()}</h2>
                    <div className='mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                      {sortScores(demographics[category]).map(([value, score]) => (
                        <button
                          key={value}
                          onClick={() => selectActual(category, value)}
                          className={actualSelections[category] === value ? 'border border-black bg-black p-5 text-left text-white transition' : 'border border-zinc-200 p-5 text-left transition hover:border-zinc-900'}
                        >
                          <div className='flex items-center justify-between gap-4'>
                            <span className='text-sm'>{formatLabel(value)}</span>
                            <span className='font-mono text-sm'>{(score * 100).toFixed(2)}%</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <aside className='border border-zinc-200 p-6'>
                <h2 className='text-xs font-semibold tracking-[0.25em]'>ACTUAL</h2>
                <div className='mt-6 space-y-6'>
                  {CATEGORY_ORDER.map((category) => (
                    <div key={category} className='border-b border-zinc-200 pb-4'>
                      <div className='text-xs uppercase tracking-[0.2em] text-zinc-500'>{category}</div>
                      <div className='mt-2 text-sm font-medium'>
                        {actualSelections[category] ? formatLabel(actualSelections[category]) : 'Select above'}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>

            {demographics && (
              <div className='mt-12'>
                <div className='border-t border-zinc-200 pt-8'>
                  <div className='text-center'>
                    <div className='text-xs tracking-[0.4em] text-zinc-500'>RESULTS</div>
                    <h2 className='mt-4 text-4xl font-light tracking-tight md:text-5xl'>Your selfie analysis.</h2>
                    <p className='mt-4 text-base text-zinc-500'>Review the analysis from your captured selfie.</p>
                  </div>

                  <div className='mt-10 grid gap-8 lg:grid-cols-[1fr_280px]'>
                    <div className='space-y-8'>
                      {CATEGORY_ORDER.filter((category) => demographics[category]).map((category) => (
                        <section key={category} className='border-t border-zinc-200 pt-6'>
                          <h2 className='text-sm font-semibold tracking-[0.2em]'>{category.toUpperCase()}</h2>
                          <div className='mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                            {sortScores(demographics[category]).map(([value, score]) => (
                              <button
                                key={value}
                                onClick={() => selectActual(category, value)}
                                className={actualSelections[category] === value ? 'border border-black bg-black p-5 text-left text-white transition' : 'border border-zinc-200 p-5 text-left transition hover:border-zinc-900'}
                              >
                                <div className='flex items-center justify-between gap-4'>
                                  <span className='text-sm'>{formatLabel(value)}</span>
                                  <span className='font-mono text-sm'>{(score * 100).toFixed(2)}%</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>

                    <aside className='border border-zinc-200 p-6'>
                      <h2 className='text-xs font-semibold tracking-[0.25em]'>ACTUAL</h2>
                      <div className='mt-6 space-y-6'>
                        {CATEGORY_ORDER.map((category) => (
                          <div key={category} className='border-b border-zinc-200 pb-4'>
                            <div className='text-xs uppercase tracking-[0.2em] text-zinc-500'>{category}</div>
                            <div className='mt-2 text-sm font-medium'>
                              {actualSelections[category] ? formatLabel(actualSelections[category]) : 'Select above'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </aside>
                  </div>
                </div>
              </div>
            )}
            {error && <p className='mt-8 text-sm text-red-600'>{error}</p>}

            <div className='mt-12 flex flex-wrap items-center justify-between gap-5'>
              <button onClick={goBack} className='flex items-center gap-2 text-sm tracking-[0.2em] text-zinc-500'>
                <FiArrowLeft /> BACK
              </button>
              <button
                onClick={beginPhaseThree}
                className='bg-black px-7 py-4 text-sm tracking-[0.2em] text-white'
              >
                TAKE A SELFIE
              </button>
            </div>

            </div>
        )}

        {phase === 3 && (
          <div className='mx-auto max-w-7xl'>
            <div className='text-center'>
              <div className='text-xs tracking-[0.4em] text-zinc-500'>STEP 03</div>
                TAKE A SELFIE
              <p className='mt-6 text-base text-zinc-500'>Use your camera or upload another image.</p>
            </div>

            <div className='mt-10 grid gap-8 lg:grid-cols-[1fr_300px]'>
              <div className='overflow-hidden bg-black'>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className='aspect-video h-auto min-h-[360px] w-full object-cover'
                  aria-label='Camera preview'
                />
              </div>

              <div className='space-y-4'>
                <button
                  onClick={captureSelfie}
                  disabled={!cameraReady || loading}
                  className='flex w-full items-center justify-center gap-3 bg-black px-6 py-5 text-sm tracking-[0.15em] text-white disabled:cursor-not-allowed disabled:bg-zinc-300'
                >
                  <FiCamera /> {loading ? 'ANALYZING...' : 'CAPTURE SELFIE'}
                </button>

                <button
                  onClick={stopCamera}
                  disabled={!cameraActive}
                  className='flex w-full items-center justify-center gap-3 border border-zinc-300 px-6 py-5 text-sm tracking-[0.15em] disabled:cursor-not-allowed disabled:text-zinc-300'
                >
                  <FiX /> STOP CAMERA
                </button>

                <label className='flex w-full cursor-pointer items-center justify-center gap-3 border border-zinc-300 px-6 py-5 text-sm tracking-[0.15em]'>
                  <FiImage /> UPLOAD INSTEAD
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageFile}
                    className='sr-only'
                  />
                </label>

                {preview && (
                  <div className='border border-zinc-200 p-2'>
                    <Image src={preview} alt='Selected selfie preview' width={1280} height={720} unoptimized className='h-auto w-full' />
                  </div>
                )}
              </div>
            </div>

            {demographics && (
              <div className='mt-12'>
                <div className='border-t border-zinc-200 pt-8'>
                  <div className='text-center'>
                    <div className='text-xs tracking-[0.4em] text-zinc-500'>RESULTS</div>
                    <h2 className='mt-4 text-4xl font-light tracking-tight md:text-5xl'>Your selfie analysis.</h2>
                    <p className='mt-4 text-base text-zinc-500'>Review the analysis from your captured selfie.</p>
                  </div>

                  <div className='mt-10 grid gap-8 lg:grid-cols-[1fr_280px]'>
                    <div className='space-y-8'>
                      {CATEGORY_ORDER.filter((category) => demographics[category]).map((category) => (
                        <section key={category} className='border-t border-zinc-200 pt-6'>
                          <h2 className='text-sm font-semibold tracking-[0.2em]'>{category.toUpperCase()}</h2>
                          <div className='mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                            {sortScores(demographics[category]).map(([value, score]) => (
                              <button
                                key={value}
                                onClick={() => selectActual(category, value)}
                                className={actualSelections[category] === value ? 'border border-black bg-black p-5 text-left text-white transition' : 'border border-zinc-200 p-5 text-left transition hover:border-zinc-900'}
                              >
                                <div className='flex items-center justify-between gap-4'>
                                  <span className='text-sm'>{formatLabel(value)}</span>
                                  <span className='font-mono text-sm'>{(score * 100).toFixed(2)}%</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>

                    <aside className='border border-zinc-200 p-6'>
                      <h2 className='text-xs font-semibold tracking-[0.25em]'>ACTUAL</h2>
                      <div className='mt-6 space-y-6'>
                        {CATEGORY_ORDER.map((category) => (
                          <div key={category} className='border-b border-zinc-200 pb-4'>
                            <div className='text-xs uppercase tracking-[0.2em] text-zinc-500'>{category}</div>
                            <div className='mt-2 text-sm font-medium'>
                              {actualSelections[category] ? formatLabel(actualSelections[category]) : 'Select above'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </aside>
                  </div>
                </div>
              </div>
            )}
            {error && <p className='mt-8 text-sm text-red-600'>{error}</p>}

            <canvas ref={canvasRef} className='hidden' />

            <div className='mt-12'>
              <button onClick={goBack} className='flex items-center gap-2 text-sm tracking-[0.2em] text-zinc-500'>
                <FiArrowLeft /> BACK
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}



























