import { useCallback } from 'react';
import { Platform } from 'react-native';

interface SpeechSynthesisHook {
  speak: (text: string, options?: SpeechOptions) => void;
  stop: () => void;
  isSupported: boolean;
}

interface SpeechOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onEnd?: () => void;
  onError?: () => void;
}

export function useSpeechSynthesis(): SpeechSynthesisHook {
  const isSupported = Platform.OS === 'web' && 
    typeof window !== 'undefined' && 
    'speechSynthesis' in window;

  const speak = useCallback((text: string, options: SpeechOptions = {}) => {
    if (!isSupported) return;

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set default options
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // Set voice if specified
      if (options.voice) {
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes(options.voice!.toLowerCase())
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Set event handlers
      utterance.onend = () => {
        options.onEnd?.();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        options.onError?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      options.onError?.();
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
  }, [isSupported]);

  return {
    speak,
    stop,
    isSupported,
  };
}