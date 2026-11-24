// Tablet-hardened Web Speech API helper (Huawei HarmonyOS & Android 15 compatible)

let cachedVoice: SpeechSynthesisVoice | null = null;

const hasSpeech =
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  'SpeechSynthesisUtterance' in window;

function pickBestVoice() {
  if (!hasSpeech) return;
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    cachedVoice =
      voices.find((v) => /en[-_]US/i.test(v.lang) && v.localService) ||
      voices.find((v) => /en[-_]US/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      null;
  } catch {
    // Ignore restricted WebView voice enumeration errors
  }
}

if (hasSpeech) {
  pickBestVoice();
  try {
    window.speechSynthesis.onvoiceschanged = pickBestVoice;
  } catch {
    // Some Android WebViews don't allow property assignment on speechSynthesis
  }
}

export function stopSpeaking() {
  if (!hasSpeech) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore
  }
}

export function speakText(
  text: string,
  soundEnabled: boolean,
  options?: {
    silentFailure?: boolean;
    onToast?: (message: string) => void;
  },
) {
  const silent = options?.silentFailure ?? false;
  const notify = options?.onToast;

  if (!soundEnabled) {
    if (!silent && notify) {
      notify('🔇 Sound is off. Tap the speaker button at the top to turn it on.');
    }
    return;
  }

  if (!hasSpeech) {
    if (!silent && notify) {
      notify('🔇 This app cannot talk in this viewer. Open in the tablet browser for voice.');
    }
    return;
  }

  try {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (!cachedVoice) pickBestVoice();

    if (cachedVoice) {
      utterance.voice = cachedVoice;
      utterance.lang = cachedVoice.lang;
    } else {
      utterance.lang = 'en-US';
    }

    utterance.rate = 0.88;
    utterance.pitch = 1.12;
    utterance.volume = 1;

    let started = false;
    utterance.onstart = () => {
      started = true;
    };
    utterance.onerror = (evt) => {
      if (!silent && notify && evt.error !== 'interrupted' && evt.error !== 'canceled') {
        notify(`🔇 No sound (${evt.error}). Check volume or install an English Text-to-speech voice.`);
      }
    };

    window.setTimeout(() => {
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      } catch {
        // Ignore
      }

      window.setTimeout(() => {
        if (!started && !silent && notify && !window.speechSynthesis.speaking) {
          let voiceCount = 0;
          try {
            voiceCount = (window.speechSynthesis.getVoices() || []).length;
          } catch {
            voiceCount = 0;
          }
          notify(
            voiceCount
              ? '🔇 No sound. Turn up the volume and check the tablet is not on silent.'
              : '🔇 No voice installed. Go to Settings → Text-to-speech to add an English voice.',
          );
        }
      }, 2400);
    }, 60);
  } catch {
    if (!silent && notify) {
      notify('🔇 This app cannot talk right now. Try opening in Chrome or Huawei Browser.');
    }
  }
}
