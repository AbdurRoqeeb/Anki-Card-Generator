
import { GoogleGenAI, Type } from '@google/genai';
import type { GeminiResponse } from '../types';
import { CardType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getPromptAndSchema = (cardType: CardType) => {
  switch (cardType) {
    case CardType.CLOZE:
      return {
        prompt: `Based on the provided document, identify key sentences and facts. Convert them into Cloze Deletion Anki flashcards. The cloze deletion should hide the most critical part of the sentence. Format the output with the cloze syntax {{c1::text to hide}}. For example, 'The powerhouse of the cell is the {{c1::mitochondria}}.'`,
        schema: {
          type: Type.OBJECT,
          properties: {
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: {
                    type: Type.STRING,
                    description: "The full sentence with cloze deletion syntax, e.g., 'The capital of France is {{c1::Paris}}.'",
                  },
                },
                required: ['text'],
              },
            },
          },
          required: ['cards'],
        },
      };
    case CardType.BASIC:
    case CardType.BASIC_REVERSED:
    default:
      return {
        prompt: `Based on the provided document, extract the most important key concepts, definitions, and facts. Generate a list of Basic Anki flashcards. Each flashcard should have a 'front' (a question or a term) and a 'back' (the answer or definition). Ensure the cards are atomic and test a single piece of information.`,
        schema: {
          type: Type.OBJECT,
          properties: {
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING, description: 'The question or term.' },
                  back: { type: Type.STRING, description: 'The answer or definition.' },
                },
                required: ['front', 'back'],
              },
            },
          },
          required: ['cards'],
        },
      };
  }
};

export const generateAnkiCards = async (
  fileBase64: string,
  mimeType: string,
  cardType: CardType
): Promise<GeminiResponse> => {
  const { prompt, schema } = getPromptAndSchema(cardType);
  const model = 'gemini-2.5-pro';

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { data: fileBase64, mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.5,
      },
      systemInstruction: "You are an expert learning assistant. Your task is to analyze documents and create high-quality, concise flashcards in a structured JSON format, suitable for importing into Anki.",
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    
    if (!parsedJson.cards || !Array.isArray(parsedJson.cards)) {
        throw new Error("API returned an invalid format. Expected a 'cards' array.");
    }
    
    return parsedJson as GeminiResponse;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate cards. The model may be unable to process this document.');
  }
};
