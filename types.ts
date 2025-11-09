
export enum CardType {
  BASIC = 'Basic',
  BASIC_REVERSED = 'Basic (and reversed card)',
  CLOZE = 'Cloze Deletion',
}

export interface AnkiCard {
  front: string;
  back: string;
}

export interface AnkiClozeCard {
  text: string;
}

export interface GeminiResponse {
  cards: (AnkiCard | AnkiClozeCard)[];
}
