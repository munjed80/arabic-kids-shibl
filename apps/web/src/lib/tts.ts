"use client";

import type { SupportedLocale } from "@/i18n/config";

const voiceLangByLocale: Record<SupportedLocale, string> = {
  en: "en",
  nl: "nl",
  de: "de",
  sv: "sv",
};

const loadVoices = (synth: SpeechSynthesis) =>
  new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const voices = synth.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    const handleVoices = () => {
      const available = synth.getVoices();
      resolve(available);
      synth.removeEventListener("voiceschanged", handleVoices);
    };
    const fallback = setTimeout(() => {
      synth.removeEventListener("voiceschanged", handleVoices);
      resolve(synth.getVoices());
    }, 300);
    synth.addEventListener("voiceschanged", handleVoices);
    synth.addEventListener(
      "voiceschanged",
      () => {
        clearTimeout(fallback);
      },
      { once: true },
    );
  });

const pickVoice = (voices: SpeechSynthesisVoice[], lang: string) => {
  const normalized = lang.toLowerCase();
  return (
    voices.find((voice) => voice.lang?.toLowerCase().startsWith(normalized)) ??
    voices.find((voice) => voice.lang?.toLowerCase().startsWith(normalized.split("-")[0])) ??
    null
  );
};

export const speak = async (text: string, lang: string): Promise<void> => {
  if (!text) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  const voices = await loadVoices(synth);
  const utterance = new SpeechSynthesisUtterance(text);
  const chosen = pickVoice(voices, lang);
  utterance.lang = chosen?.lang ?? lang;
  if (chosen) {
    utterance.voice = chosen;
  }

  return new Promise<void>((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    synth.cancel();
    synth.speak(utterance);
  });
};

export const speakUiPrompt = async (i18nText: string, locale: SupportedLocale): Promise<void> => {
  const lang = voiceLangByLocale[locale] ?? locale;
  await speak(i18nText, lang);
};

const fatha = "\u064e";

const letterToFatha: Record<string, string> = {
  "\u0627": "\u0623" + fatha,
  "\u0628": "\u0628" + fatha,
  "\u062a": "\u062a" + fatha,
  "\u062b": "\u062b" + fatha,
  "\u062c": "\u062c" + fatha,
  "\u062d": "\u062d" + fatha,
  "\u062e": "\u062e" + fatha,
  "\u062f": "\u062f" + fatha,
  "\u0630": "\u0630" + fatha,
  "\u0631": "\u0631" + fatha,
  "\u0632": "\u0632" + fatha,
  "\u0633": "\u0633" + fatha,
  "\u0634": "\u0634" + fatha,
  "\u0635": "\u0635" + fatha,
  "\u0636": "\u0636" + fatha,
  "\u0637": "\u0637" + fatha,
  "\u0638": "\u0638" + fatha,
  "\u0639": "\u0639" + fatha,
  "\u063a": "\u063a" + fatha,
  "\u0641": "\u0641" + fatha,
  "\u0642": "\u0642" + fatha,
  "\u0643": "\u0643" + fatha,
  "\u0644": "\u0644" + fatha,
  "\u0645": "\u0645" + fatha,
  "\u0646": "\u0646" + fatha,
  "\u0647": "\u0647" + fatha,
  "\u0648": "\u0648" + fatha,
  "\u064a": "\u064a" + fatha,
  "\u0629": "\u062a" + fatha,
};

export const speakArabicLetter = async (letter: string): Promise<void> => {
  const normalized = letter.trim();
  const firstChar = normalized.charAt(0);
  const vowelized = letterToFatha[firstChar] ?? (firstChar || normalized);
  await speak(vowelized, "ar");
};
