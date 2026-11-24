import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Cloud,
  Compass,
  Download,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { ConfettiOverlay } from './components/ConfettiOverlay';
import { SearchModal } from './components/SearchModal';
import { getRandomCountryFact } from './data/countryFacts';
import { CONTINENT_BY_ID, CONTINENTS } from './data/worldData';
import { GlobeCanvas, type GlobeHandle } from './engine/GlobeCanvas';
import type {
  ContinentConfig,
  ContinentId,
  CountryFeature,
  MapMode,
} from './types/globe';
import { speakText, stopSpeaking } from './utils/speech';

const PRAISE_PHRASES = [
  'Yes!',
  'Great job!',
  'You found it!',
  'Amazing!',
  'Super!',
];

export default function App() {
  const globeRef = useRef<GlobeHandle>(null);

  const [mapMode, setMapMode] = useState<MapMode>('satellite');
  const [showClouds, setShowClouds] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1);

  // Exploration state
  const [selectedContinent, setSelectedContinent] = useState<ContinentConfig | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryFeature | null>(null);
  const [countryFact, setCountryFact] = useState<string | null>(null);

  // Quiz ("Find it!") state
  const [isPlayingGame, setIsPlayingGame] = useState(false);
  const [targetContinent, setTargetContinent] = useState<ContinentConfig | null>(null);
  const [hintContinent, setHintContinent] = useState<ContinentConfig | null>(null);
  const [score, setScore] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [promptMessage, setPromptMessage] = useState<{
    kind: 'ask' | 'win' | 'retry';
    text: string;
    highlightName: string;
    highlightColor: string;
    animals?: string;
    secondHighlightName?: string;
    secondHighlightColor?: string;
  } | null>(null);

  const [confettiKey, setConfettiKey] = useState(0);
  const [confettiColor, setConfettiColor] = useState('#FFD23F');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number>(0);
  const nextRoundTimerRef = useRef<number>(0);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 6000);
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      window.clearTimeout(toastTimerRef.current);
      window.clearTimeout(nextRoundTimerRef.current);
      stopSpeaking();
    };
  }, []);

  const flyToContinent = useCallback((cont: ContinentConfig, customZoom?: number) => {
    const target = cont.id === 'antarctica' ? ([cont.at[0], -70] as [number, number]) : cont.at;
    const z =
      customZoom ?? (cont.id === 'asia' || cont.id === 'antarctica' ? 1.15 : 1.45);
    globeRef.current?.flyTo(target, z);
  }, []);

  const handleSelectContinent = useCallback(
    (cont: ContinentConfig) => {
      setSelectedContinent(cont);
      setSelectedCountry(null);
      setCountryFact(null);
      flyToContinent(cont);
      speakText(cont.name, soundEnabled, { onToast: showToast });
    },
    [flyToContinent, showToast, soundEnabled],
  );

  const handleSelectCountry = useCallback(
    (country: CountryFeature) => {
      const cIds = (country.properties.c || '').split(' ') as ContinentId[];
      let parentCont = selectedContinent;
      if (!parentCont || !cIds.includes(parentCont.id)) {
        parentCont = CONTINENT_BY_ID[cIds[0]] || parentCont;
      }
      if (parentCont) setSelectedContinent(parentCont);
      setSelectedCountry(country);
      setCountryFact(getRandomCountryFact(country, parentCont));

      const area = Math.max(country.properties.a || 0.01, 0.01);
      const fitZoom = Math.max(1.8, Math.min(8, 35 / Math.sqrt(area)));
      const targetZoom = Math.max(fitZoom, Math.min(currentZoom, 8));
      const targetLonLat = country.properties.l ?? parentCont?.at ?? [0, 0];
      globeRef.current?.flyTo(targetLonLat, targetZoom);

      speakText(country.properties.n, soundEnabled, { onToast: showToast });
    },
    [currentZoom, selectedContinent, showToast, soundEnabled],
  );

  const startNextQuizRound = useCallback(
    (previousTarget: ContinentConfig | null) => {
      let next: ContinentConfig;
      do {
        next = CONTINENTS[Math.floor(Math.random() * CONTINENTS.length)];
      } while (next === previousTarget);

      setTargetContinent(next);
      setWrongAttempts(0);
      setHintContinent(null);
      setSelectedContinent(null);
      setPromptMessage({
        kind: 'ask',
        text: 'Where is',
        highlightName: next.name,
        highlightColor: next.color,
      });
      speakText(`Where is ${next.name}?`, soundEnabled, {
        silentFailure: true,
        onToast: showToast,
      });
    },
    [showToast, soundEnabled],
  );

  const startGame = useCallback(() => {
    window.clearTimeout(nextRoundTimerRef.current);
    setIsPlayingGame(true);
    setScore(0);
    setSelectedContinent(null);
    setSelectedCountry(null);
    setHintContinent(null);
    globeRef.current?.resetView();
    startNextQuizRound(null);
  }, [startNextQuizRound]);

  const stopGame = useCallback(() => {
    window.clearTimeout(nextRoundTimerRef.current);
    setIsPlayingGame(false);
    setTargetContinent(null);
    setHintContinent(null);
    setPromptMessage(null);
  }, []);

  const handleGameGuess = useCallback(
    (guessed: ContinentConfig) => {
      if (!targetContinent) return;
      if (guessed.id === targetContinent.id) {
        const praise = PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
        setScore((prev) => prev + 1);
        setSelectedContinent(guessed);
        setHintContinent(null);
        flyToContinent(guessed);
        setConfettiColor(guessed.color);
        setConfettiKey((k) => k + 1);
        setPromptMessage({
          kind: 'win',
          text: `${praise} That is`,
          highlightName: guessed.name,
          highlightColor: guessed.color,
          animals: guessed.animals.slice(0, 2),
        });
        speakText(`${praise} That is ${guessed.name}!`, soundEnabled, { onToast: showToast });

        const justWon = targetContinent;
        setTargetContinent(null);
        nextRoundTimerRef.current = window.setTimeout(() => {
          startNextQuizRound(justWon);
        }, 3200);
      } else {
        const nextWrong = wrongAttempts + 1;
        setWrongAttempts(nextWrong);
        speakText(`That is ${guessed.name}. Try again!`, soundEnabled, { onToast: showToast });
        setPromptMessage({
          kind: 'retry',
          text: 'That is',
          highlightName: guessed.name,
          highlightColor: guessed.color,
          secondHighlightName: targetContinent.name,
          secondHighlightColor: targetContinent.color,
        });
        if (nextWrong >= 2) {
          setHintContinent(targetContinent);
          flyToContinent(targetContinent, 1.08);
        }
      }
    },
    [flyToContinent, showToast, soundEnabled, startNextQuizRound, targetContinent, wrongAttempts],
  );

  const handleCloseCard = () => {
    if (selectedCountry) {
      setSelectedCountry(null);
      setCountryFact(null);
      if (selectedContinent) {
        flyToContinent(selectedContinent);
      }
      return;
    }
    setSelectedContinent(null);
    globeRef.current?.resetView();
  };

  const handleAnotherCountryFact = () => {
    if (!selectedCountry) return;
    const nextFact = getRandomCountryFact(selectedCountry, selectedContinent, countryFact);
    setCountryFact(nextFact);
  };

  const handleSpeakCard = () => {
    if (selectedCountry) {
      const p = selectedCountry.properties;
      const line = `${p.n}.${selectedContinent ? ` It is in ${selectedContinent.name}.` : ''}${p.k ? ` The capital city is ${p.k}.` : ''}${countryFact ? ` Did you know? ${countryFact}` : ''}`;
      speakText(line, soundEnabled, { onToast: showToast });
    } else if (selectedContinent) {
      const line = `${selectedContinent.name}${selectedContinent.sub ? ` ${selectedContinent.sub}` : ''}. ${selectedContinent.facts.join(' ')}`;
      speakText(line, soundEnabled, { onToast: showToast });
    }
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (!next) stopSpeaking();
      return next;
    });
  };

  const toggleFullscreen = () => {
    const docEl = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      try {
        const res = (docEl.requestFullscreen || docEl.webkitRequestFullscreen)?.call(docEl);
        if (res && typeof res.catch === 'function') res.catch(() => {});
      } catch {
        // Ignore on viewers that forbid fullscreen
      }
    }
  };

  const starCount = score === 0 ? 0 : score % 10 || 10;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#040916] text-slate-50">
      {/* Top Bar */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/90 bg-[#081326] px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl leading-none" aria-hidden="true">
            🌍
          </span>
          <h1 className="text-lg font-extrabold tracking-tight text-white sm:text-2xl">
            Adam&apos;s World
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Google Earth / Maps View Mode Switcher */}
          <div
            role="group"
            aria-label="Map style"
            className="flex items-center rounded-xl border border-slate-700 bg-[#0d1c36] p-0.5 text-xs font-bold sm:text-sm"
          >
            {(['satellite', 'hybrid', 'atlas'] as const).map((mode) => {
              const active = mapMode === mode;
              const label =
                mode === 'satellite'
                  ? 'Satellite'
                  : mode === 'hybrid'
                    ? 'Hybrid'
                    : 'Atlas';
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setMapMode(mode)}
                  className={`rounded-lg px-2.5 py-1.5 transition sm:px-3 ${
                    active
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search places"
            className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-700 bg-[#10213f] px-3 text-sm font-bold text-slate-100 transition hover:bg-[#172e56] active:translate-y-0.5"
          >
            <Search className="h-4 w-4 text-sky-400" />
            <span className="hidden md:inline">Search</span>
          </button>

          {/* Find It! Game Toggle */}
          <button
            type="button"
            onClick={() => (isPlayingGame ? stopGame() : startGame())}
            className={`flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-extrabold shadow-[0_4px_0_rgba(0,0,0,0.45)] transition active:translate-y-1 active:shadow-none sm:px-4 sm:text-base ${
              isPlayingGame
                ? 'bg-sky-400 text-slate-950'
                : 'bg-[#FFD23F] text-slate-950'
            }`}
          >
            <span>{isPlayingGame ? '🌍 Explore' : '⭐ Find it!'}</span>
          </button>

          {/* Save Standalone Offline HTML (hidden when already opened from file://) */}
          {typeof window !== 'undefined' && window.location.protocol !== 'file:' && (
            <a
              href="/adams-world-globe.html"
              download="adams-world-globe.html"
              title="Save single-file offline HTML for tablet HTML Viewer"
              className="flex h-10 items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/25 active:translate-y-0.5"
            >
              <Download className="h-4 w-4" />
              <span className="hidden lg:inline">Save HTML</span>
            </a>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-[#10213f] text-slate-100 transition hover:bg-[#172e56] active:translate-y-0.5"
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <VolumeX className="h-5 w-5 text-slate-400" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-[#10213f] text-slate-100 transition hover:bg-[#172e56] active:translate-y-0.5"
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main 3D Globe Viewport */}
      <main className="relative min-h-0 flex-1">
        <GlobeCanvas
          ref={globeRef}
          mapMode={mapMode}
          showClouds={showClouds}
          isPlayingGame={isPlayingGame}
          selectedContinent={selectedContinent}
          selectedCountry={selectedCountry}
          hintContinent={hintContinent}
          onSelectContinent={handleSelectContinent}
          onSelectCountry={handleSelectCountry}
          onGameGuess={handleGameGuess}
          onZoomChange={setCurrentZoom}
        />

        {/* Google Maps-style Right Controls */}
        <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2.5 sm:right-4">
          <button
            type="button"
            onClick={() => globeRef.current?.zoomBy(1.3)}
            aria-label="Zoom in"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-600/80 bg-[#0d1c36]/95 text-white shadow-[0_4px_0_rgba(0,0,0,0.5)] transition hover:bg-[#15294c] active:translate-y-1 active:shadow-none sm:h-13 sm:w-13"
          >
            <Plus className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => globeRef.current?.zoomBy(0.76)}
            aria-label="Zoom out"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-600/80 bg-[#0d1c36]/95 text-white shadow-[0_4px_0_rgba(0,0,0,0.5)] transition hover:bg-[#15294c] active:translate-y-1 active:shadow-none sm:h-13 sm:w-13"
          >
            <Minus className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCountry(null);
              setSelectedContinent(null);
              globeRef.current?.resetView();
            }}
            aria-label="Reset globe view"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-600/80 bg-[#0d1c36]/95 text-sky-300 shadow-[0_4px_0_rgba(0,0,0,0.5)] transition hover:bg-[#15294c] active:translate-y-1 active:shadow-none sm:h-13 sm:w-13"
          >
            <Compass className="h-6 w-6" />
          </button>
          {mapMode !== 'atlas' && (
            <button
              type="button"
              onClick={() => setShowClouds((c) => !c)}
              aria-label={showClouds ? 'Hide clouds' : 'Show clouds'}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-[0_4px_0_rgba(0,0,0,0.5)] transition active:translate-y-1 active:shadow-none sm:h-13 sm:w-13 ${
                showClouds
                  ? 'border-sky-400/70 bg-sky-500/25 text-sky-200'
                  : 'border-slate-600/80 bg-[#0d1c36]/95 text-slate-400'
              }`}
            >
              <Cloud className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Quiz Prompt Banner */}
        {isPlayingGame && promptMessage && (
          <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex justify-center">
            <div className="max-w-xl rounded-2xl border-2 border-slate-700 bg-white px-5 py-3 text-center text-slate-900 shadow-2xl">
              <div className="text-xl font-extrabold leading-tight sm:text-3xl">
                {promptMessage.kind === 'retry' ? (
                  <>
                    That is{' '}
                    <span
                      className="underline decoration-4 underline-offset-4"
                      style={{ textDecorationColor: promptMessage.highlightColor }}
                    >
                      {promptMessage.highlightName}
                    </span>
                    . Try again! Where is{' '}
                    <span
                      className="underline decoration-4 underline-offset-4"
                      style={{ textDecorationColor: promptMessage.secondHighlightColor }}
                    >
                      {promptMessage.secondHighlightName}
                    </span>
                    ?
                  </>
                ) : (
                  <>
                    {promptMessage.text}{' '}
                    <span
                      className="underline decoration-4 underline-offset-4"
                      style={{ textDecorationColor: promptMessage.highlightColor }}
                    >
                      {promptMessage.highlightName}
                    </span>
                    {promptMessage.kind === 'ask' ? '?' : '!'}{' '}
                    {promptMessage.animals ?? ''}
                  </>
                )}
              </div>
              <div className="mt-1 min-h-[1.3em] text-base sm:text-lg">
                {'⭐'.repeat(starCount)}
              </div>
            </div>
          </div>
        )}

        {/* Continent / Country Info Card */}
        {!isPlayingGame && (selectedContinent || selectedCountry) && (
          <section
            aria-label="Place details"
            className="absolute bottom-3 left-3 right-18 z-20 max-w-sm rounded-3xl border-[5px] bg-white p-4 text-slate-900 shadow-2xl sm:bottom-auto sm:left-4 sm:right-auto sm:top-4 sm:w-[340px] sm:p-5"
            style={{ borderColor: selectedContinent?.color ?? '#FFD23F' }}
          >
            {selectedCountry ? (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">
                      {selectedCountry.properties.n}
                    </h2>
                    {selectedContinent && (
                      <div className="mt-1 flex items-center gap-2 text-base font-bold text-slate-600">
                        <span
                          className="inline-block h-3 w-3 rounded-sm"
                          style={{ backgroundColor: selectedContinent.color }}
                        />
                        <span>in {selectedContinent.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="my-2 text-5xl leading-none sm:text-6xl">
                  {selectedCountry.properties.flag}
                </div>

                {selectedCountry.properties.k && (
                  <p className="mb-2.5 text-base font-semibold text-slate-700 sm:text-lg">
                    Capital city:{' '}
                    <strong className="font-extrabold text-slate-950">
                      {selectedCountry.properties.k}
                    </strong>
                  </p>
                )}

                {countryFact && (
                  <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-slate-800">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wide text-amber-900 sm:text-sm">
                        💡 Did you know?
                      </span>
                      <button
                        type="button"
                        onClick={handleAnotherCountryFact}
                        aria-label="Show another fun fact"
                        className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold text-amber-900 transition hover:bg-amber-200/70 active:scale-95"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>More</span>
                      </button>
                    </div>
                    <p className="text-sm font-semibold leading-snug text-slate-800 sm:text-[15px]">
                      {countryFact}
                    </p>
                  </div>
                )}
              </>
            ) : selectedContinent ? (
              <>
                <h2 className="text-2xl font-extrabold leading-none text-slate-950 sm:text-4xl">
                  {selectedContinent.name}
                </h2>
                {selectedContinent.sub && (
                  <div className="mt-0.5 text-base font-bold text-slate-500">
                    {selectedContinent.sub}
                  </div>
                )}

                <div className="my-2 text-4xl tracking-wider sm:text-5xl">
                  {selectedContinent.animals}
                </div>

                <ul className="mb-3 space-y-1.5 pl-5 text-sm font-medium leading-snug text-slate-800 sm:text-base">
                  {selectedContinent.facts.map((fact) => (
                    <li key={fact} className="list-disc">
                      {fact}
                    </li>
                  ))}
                  <li className="-ml-5 list-none pt-1 font-extrabold text-[#0B4FA8]">
                    👆 Tap a country to hear its name!
                  </li>
                </ul>
              </>
            ) : null}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleSpeakCard}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#FFD23F] px-4 py-2.5 text-base font-extrabold text-slate-950 shadow-[0_4px_0_#b8901a] transition active:translate-y-1 active:shadow-none sm:text-lg"
              >
                <span>🔊 Tell me!</span>
              </button>
              <button
                type="button"
                onClick={handleCloseCard}
                aria-label="Close"
                className="flex h-11 w-12 items-center justify-center rounded-2xl bg-slate-200 text-slate-800 shadow-[0_4px_0_#94a3b8] transition active:translate-y-1 active:shadow-none"
              >
                <X className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Bottom Continent Selector Bar */}
      <nav
        aria-label="Continents"
        className="no-scrollbar relative z-20 flex gap-2 overflow-x-auto border-t border-slate-800/80 bg-[#081326] px-2.5 py-2.5 sm:px-3"
      >
        {CONTINENTS.map((cont) => {
          const isActive = selectedContinent?.id === cont.id;
          return (
            <button
              key={cont.id}
              type="button"
              onClick={() => {
                if (isPlayingGame) handleGameGuess(cont);
                else handleSelectContinent(cont);
              }}
              style={{ backgroundColor: cont.color }}
              className={`flex min-w-[104px] flex-1 shrink-0 flex-col items-center rounded-2xl px-2.5 py-2 text-slate-950 shadow-[0_5px_0_rgba(0,0,0,0.45)] transition active:translate-y-1 active:shadow-none ${
                isActive ? '-translate-y-1 ring-4 ring-white' : ''
              }`}
            >
              <span className="text-xl leading-tight sm:text-2xl">
                {cont.animals.slice(0, 2)}
              </span>
              <span className="whitespace-nowrap text-xs font-extrabold sm:text-sm md:text-base">
                {cont.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Search Modal */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onPickContinent={handleSelectContinent}
        onPickCountry={handleSelectCountry}
      />

      {/* Confetti FX */}
      <ConfettiOverlay burstKey={confettiKey} accentColor={confettiColor} />

      {/* Toast Status Message */}
      {toastMsg && (
        <div
          role="status"
          className="pointer-events-none fixed bottom-28 left-1/2 z-50 max-w-[92vw] -translate-x-1/2 rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3 text-center text-sm font-bold text-white shadow-2xl sm:text-base"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
