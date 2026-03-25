import en from './en.json';
import pt from './pt.json';

const translations: Record<string, Record<string, string>> = { en, pt };

export const languages = ['en', 'pt'] as const;
export type Lang = (typeof languages)[number];
export const defaultLang: Lang = 'en';

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (languages.includes(lang as Lang)) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: string): string {
    return translations[lang]?.[key] ?? translations[defaultLang]?.[key] ?? key;
  };
}

export function getLocalizedPath(path: string, lang: Lang): string {
  // Remove any existing lang prefix
  const cleanPath = path.replace(/^\/(en|pt)/, '');
  return `/${lang}${cleanPath || '/'}`;
}
