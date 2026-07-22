import es from './es.json';
import en from './en.json';

export type Lang = 'es' | 'en';

const dictionaries = { es, en } as const;

export function useTranslations(lang: Lang) {
  return dictionaries[lang];
}

export const locales: Lang[] = ['es', 'en'];
export const defaultLocale: Lang = 'es';
