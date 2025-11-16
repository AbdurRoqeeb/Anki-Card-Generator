import { GoogleGenAI, Type } from '@google/genai';
import type { GeminiResponse } from '../types';
import { CardType } from '../types';

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

type DocumentInput = { base64: string; mimeType: string; } | { text: string };

const isFileData = (input: DocumentInput): input is { base64: string; mimeType: string; } => {
    return (input as { base64: string; mimeType: string; }).base64 !== undefined;
}

export const generateAnkiCards = async (
  documentInput: DocumentInput,
  cardType: CardType,
  numCards?: number,
  customPrompt?: string
): Promise<GeminiResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set. Please configure it in your Vercel deployment settings.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let { prompt, schema } = getPromptAndSchema(cardType);
  const model = 'gemini-2.5-pro';
  
  if (numCards && numCards > 0) {
    prompt += `\n\nPlease generate approximately ${numCards} flashcards.`;
  }

  if (customPrompt && customPrompt.trim()) {
      prompt += `\n\nAdditionally, please adhere to the following instructions: "${customPrompt}"`;
  }

  const documentPart = isFileData(documentInput)
    ? { inlineData: { data: documentInput.base64, mimeType: documentInput.mimeType } }
    : { text: `Analyze the following document content to generate flashcards:\n\n---\n\n${documentInput.text}\n\n---` };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          documentPart,
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
    // It's possible for the model to return an empty string if it can't find content.
    if (!jsonText) {
        throw new Error("The model returned an empty response. It might not have found any content suitable for flashcards in the document.");
    }

    const parsedJson = JSON.parse(jsonText);
    
    if (!parsedJson.cards || !Array.isArray(parsedJson.cards)) {
        throw new Error("API returned an invalid format. Expected a 'cards' array.");
    }
    
    return parsedJson as GeminiResponse;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    let errorMessage = 'Failed to generate cards. The model may be unable to process this document.';

    if (error instanceof Error) {
        const lowerCaseMessage = error.message.toLowerCase();
        
        if (lowerCaseMessage.includes('429') || lowerCaseMessage.includes('rate limit')) {
            errorMessage = 'API rate limit exceeded. Please wait a moment and try again.';
        } else if (lowerCaseMessage.includes('request entity size is larger than') || lowerCaseMessage.includes('too large')) {
            errorMessage = 'The uploaded document is too large. Please try a smaller file.';
        } else if (lowerCaseMessage.includes('unsupported mime type')) {
            errorMessage = 'The file format is not supported by the AI model. Please try a different document.';
        } else if (error instanceof SyntaxError) { // Catches JSON.parse errors
            errorMessage = 'The AI model returned an unexpected format. Please try again or adjust your advanced options.';
        } else {
            // Keep the specific error message if it's already set by a previous check
            errorMessage = error.message;
        }
    }
    
    throw new Error(errorMessage);
  }
};