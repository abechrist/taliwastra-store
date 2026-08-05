import idDict from '@/dictionaries/id.json';
import enDict from '@/dictionaries/en.json';

const dictionaries: Record<string, any> = {
  id: idDict,
  en: enDict,
};

export const getClientDictionary = (locale: string) => dictionaries[locale] || dictionaries['id'];
