import 'server-only';

const dictionaries: Record<string, () => Promise<any>> = {
  id: () => import('@/dictionaries/id.json').then((module) => module.default),
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  const loadDictionary = dictionaries[locale] || dictionaries['id'];
  return loadDictionary();
};
