export type LanguageCode =
  | 'en'   // English (Default)
  | 'hi'   // Hindi (हिन्दी)
  | 'bn'   // Bengali (বাংলা)
  | 'as'   // Assamese (অসমীয়া)
  | 'gu'   // Gujarati (ગુજરાતી)
  | 'kn'   // Kannada (ಕನ್ನಡ)
  | 'ml'   // Malayalam (മലയാളം)
  | 'mr'   // Marathi (मराठी)
  | 'ne'   // Nepali (नेपाली)
  | 'od'   // Odia (ଓଡ଼ିଆ)
  | 'pa'   // Punjabi (ਪੰਜਾਬੀ)
  | 'sa'   // Sanskrit (संस्कृतम्)
  | 'ta'   // Tamil (தமிழ்)
  | 'te'   // Telugu (తెలుగు)
  | 'ur'   // Urdu (اردو)
  | 'mai'  // Maithili (मैथिली)
  | 'doi'  // Dogri (डोगरी)
  | 'kok'  // Konkani (कोंकणी)
  | 'mni'  // Manipuri (মৈতৈলোন্)
  | 'sat'  // Santali (ᱥᱟᱱᱛᱟᱲᱤ)
  | 'ks'   // Kashmiri (کٲشُر)
  | 'sd'   // Sindhi (سنڌي)
  | 'brx'; // Bodo (बड़ो)

export interface LanguageInfo {
  code: LanguageCode;
  name: string;        // English name, e.g. "Hindi"
  nativeName: string;  // Native name, e.g. "हिन्दी"
  script: string;      // Devanagari, Bengali, Tamil, Nastaliq, etc.
  isRTL?: boolean;     // true for Urdu, Kashmiri (Arabic script), Sindhi
}

export type TranslationDictionary = Record<string, any>;
