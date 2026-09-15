import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { LanguageCode, LanguageInfo, TranslationDictionary } from './types';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './languages';

// Import all 23 locale dictionaries
import { en } from './locales/en';
import { hi } from './locales/hi';
import { bn } from './locales/bn';
import { ta } from './locales/ta';
import { te } from './locales/te';
import { mr } from './locales/mr';
import { gu } from './locales/gu';
import { kn } from './locales/kn';
import { ml } from './locales/ml';
import { pa } from './locales/pa';
import { od } from './locales/od';
import { as } from './locales/as';
import { ur } from './locales/ur';
import { sa } from './locales/sa';
import { ne } from './locales/ne';
import { mai } from './locales/mai';
import { doi } from './locales/doi';
import { kok } from './locales/kok';
import { mni } from './locales/mni';
import { sat } from './locales/sat';
import { ks } from './locales/ks';
import { sd } from './locales/sd';
import { brx } from './locales/brx';

const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en,
  hi,
  bn,
  ta,
  te,
  mr,
  gu,
  kn,
  ml,
  pa,
  od,
  as,
  ur,
  sa,
  ne,
  mai,
  doi,
  kok,
  mni,
  sat,
  ks,
  sd,
  brx,
};

const STORAGE_KEY = 'app_language';

interface I18nContextType {
  currentLanguage: LanguageCode;
  languageInfo: LanguageInfo;
  setLanguage: (code: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  languages: LanguageInfo[];
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj) return undefined;
  const keys = path.split('.');
  let current = obj;
  for (const k of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[k];
  }
  return typeof current === 'string' ? current : undefined;
}

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
        return stored as LanguageCode;
      }
    } catch {
      // Ignore localStorage errors (e.g. in private browsing or testing)
    }
    return DEFAULT_LANGUAGE as LanguageCode;
  });

  const languageInfo = useMemo(() => {
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
      SUPPORTED_LANGUAGES[0]
    );
  }, [currentLanguage]);

  const isRTL = Boolean(languageInfo.isRTL);

  const setLanguage = (code: LanguageCode) => {
    if (SUPPORTED_LANGUAGES.some((l) => l.code === code)) {
      setCurrentLanguageState(code);
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {
        // Ignore
      }
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLanguage;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    }
  }, [currentLanguage, isRTL]);

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>): string => {
      const activeDict = TRANSLATIONS[currentLanguage];
      const fallbackDict = TRANSLATIONS.en;

      let value = getNestedValue(activeDict, key);
      if (!value) {
        value = getNestedValue(fallbackDict, key);
      }
      if (!value) {
        return key;
      }

      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          value = value!.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramVal));
        });
      }

      return value;
    };
  }, [currentLanguage]);

  const value = useMemo(
    () => ({
      currentLanguage,
      languageInfo,
      setLanguage,
      t,
      languages: SUPPORTED_LANGUAGES,
      isRTL,
    }),
    [currentLanguage, languageInfo, t, isRTL]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    // Graceful fallback if called outside provider (e.g., isolated test)
    const fallbackT = (key: string, params?: Record<string, string | number>) => {
      let val = getNestedValue(en, key) || key;
      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          val = val.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramVal));
        });
      }
      return val;
    };
    return {
      currentLanguage: 'en' as LanguageCode,
      languageInfo: SUPPORTED_LANGUAGES[0],
      setLanguage: () => {},
      t: fallbackT,
      languages: SUPPORTED_LANGUAGES,
      isRTL: false,
    };
  }
  return context;
}

export * from './types';
export * from './languages';
