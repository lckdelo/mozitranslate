"use client";

import { useState, useCallback } from 'react';

interface Language {
  code: string;
  name: string;
  flag?: string;
}

export const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'en', name: 'Inglês', flag: '🇬🇧' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'es', name: 'Espanhol', flag: '🇪🇸' },
  { code: 'fr', name: 'Francês', flag: '🇫🇷' },
  { code: 'de', name: 'Alemão', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: 'Japonês', flag: '🇯🇵' },
  { code: 'zh-cn', name: 'Chinês (Simplificado)', flag: '🇨🇳' },
  { code: 'ru', name: 'Russo', flag: '🇷🇺' },
  { code: 'ko', name: 'Coreano', flag: '🇰🇷' },
  { code: 'ar', name: 'Árabe', flag: '🇦🇪' },
];

interface UseLanguageSelectionProps {
  initialSourceLang?: string;
  initialTargetLang?: string;
  onLanguageChange?: (sourceLang: string, targetLang: string) => void;
}

interface LanguageSelectionResult {
  sourceLang: string;
  targetLang: string;
  setSourceLang: (lang: string) => void;
  setTargetLang: (lang: string) => void;
  swapLanguages: () => void;
  availableLanguages: Language[];
  getLanguageName: (code: string) => string;
  getLanguageFlag: (code: string) => string | undefined;
}

const useLanguageSelection = ({
  initialSourceLang = 'auto',
  initialTargetLang = 'pt',
  onLanguageChange,
}: UseLanguageSelectionProps = {}): LanguageSelectionResult => {
  const [sourceLang, setSourceLang] = useState(initialSourceLang);
  const [targetLang, setTargetLang] = useState(initialTargetLang);

  const handleSourceLangChange = useCallback(
    (lang: string) => {
      setSourceLang(lang);
      if (onLanguageChange) {
        onLanguageChange(lang, targetLang);
      }
    },
    [targetLang, onLanguageChange]
  );

  const handleTargetLangChange = useCallback(
    (lang: string) => {
      setTargetLang(lang);
      if (onLanguageChange) {
        onLanguageChange(sourceLang, lang);
      }
    },
    [sourceLang, onLanguageChange]
  );

  const swapLanguages = useCallback(() => {
    if (sourceLang !== 'auto') {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
      if (onLanguageChange) {
        onLanguageChange(targetLang, temp);
      }
    }
  }, [sourceLang, targetLang, onLanguageChange]);

  const getLanguageName = useCallback(
    (code: string) => {
      if (code === 'auto') {
        return 'Detecção Automática';
      }
      const lang = AVAILABLE_LANGUAGES.find((l) => l.code === code);
      return lang ? lang.name : code;
    },
    []
  );

  const getLanguageFlag = useCallback(
    (code: string) => {
      if (code === 'auto') {
        return '🔍';
      }
      const lang = AVAILABLE_LANGUAGES.find((l) => l.code === code);
      return lang ? lang.flag : undefined;
    },
    []
  );

  return {
    sourceLang,
    targetLang,
    setSourceLang: handleSourceLangChange,
    setTargetLang: handleTargetLangChange,
    swapLanguages,
    availableLanguages: AVAILABLE_LANGUAGES,
    getLanguageName,
    getLanguageFlag,
  };
};

export default useLanguageSelection;
