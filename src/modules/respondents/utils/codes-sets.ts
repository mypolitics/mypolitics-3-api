import CODES_PL from '../../../assets/respondents/pl.json';
import CODES_EN from '../../../assets/respondents/en.json';
import { Language } from '../../../shared/enums/language.enum';

interface CodesSet {
  colors: string[];
  adjectives: string[];
  nouns: string[];
  verbs: string[];
}

export const codesSets: Record<Language, CodesSet> = {
  pl: CODES_PL,
  en: CODES_EN,
};

const getRandomInt = (min: number, max: number) => (
  Math.floor(Math.random() * (max - min)) + min
);

export const getRandomCode = (set: CodesSet = CODES_EN): string[] => {
  const [colors, adjectives, nouns, verbs] = Object.keys(set).map(k => set[k].sort(() => Math.random() - 0.5));
  const randomNumber = getRandomInt(1, 999);
  return [colors[0], adjectives[0], nouns[0], verbs[0], nouns[1], randomNumber];
};

