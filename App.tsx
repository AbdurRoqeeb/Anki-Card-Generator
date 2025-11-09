import React, { useState, useCallback } from 'react';
import { CardType } from './types';
import type { AnkiCard, AnkiClozeCard } from './types';
import FileUpload from './components/FileUpload';
import CardTypeSelector from './components/CardTypeSelector';
import GeneratedCards from './components/GeneratedCards';
import { generateAnkiCards } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { GithubIcon, SparklesIcon } from './components/Icons';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [cardType, setCardType] = useState<CardType>(CardType.BASIC);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setGeneratedText(null);
    setError(null);
  };

  const handleCreateCards = useCallback(async () => {
    if (!file) {
      setError('Please upload a document first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedText(null);

    try {
      const { base64, mimeType } = await fileToBase64(file);
      const result = await generateAnkiCards(base64, mimeType, cardType);

      let outputText = '';
      if (cardType === CardType.CLOZE) {
        outputText = (result.cards as AnkiClozeCard[]).map(card => card.text).join('\n');
      } else {
        outputText = (result.cards as AnkiCard[]).map(card => `${card.front}\t${card.back}`).join('\n');
      }
      if (cardType === CardType.BASIC_REVERSED) {
          const reversedText = (result.cards as AnkiCard[]).map(card => `${card.back}\t${card.front}`).join('\n');
          outputText += '\n' + reversedText;
      }

      setGeneratedText(outputText);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [file, cardType]);

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-4xl flex justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Anki Card Generator
        </h1>
        <a href="https://github.com/google/prompt-gallery" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors">
          <GithubIcon className="w-7 h-7" />
        </a>
      </header>
      
      <main className="w-full max-w-4xl flex-grow bg-secondary rounded-xl border border-border shadow-2xl p-6 sm:p-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-text-primary">1. Upload Your Document</h2>
            <p className="text-sm text-text-secondary mb-4">Upload a PDF document. Support for other file types like DOCX and PPTX is coming soon!</p>
            <FileUpload onFileChange={handleFileChange} />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 text-text-primary">2. Select Card Type</h2>
            <CardTypeSelector selectedType={cardType} onTypeChange={setCardType} />
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={handleCreateCards}
              disabled={!file || isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Create Cards
                </>
              )}
            </button>
          </div>
          
          {isLoading && (
            <div className="w-full max-w-md mx-auto mt-4" aria-live="polite" aria-busy="true">
              <p className="text-center text-sm text-text-secondary mb-2">
                Generating cards, this may take a moment...
              </p>
              <div className="w-full bg-border rounded-full h-2.5 overflow-hidden relative">
                <div 
                  className="absolute top-0 left-0 h-full w-full rounded-full bg-primary"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.3), rgba(255,255,255,0))',
                    backgroundSize: '150px 100%',
                    backgroundRepeat: 'no-repeat',
                    animation: 'shimmer 1.5s linear infinite'
                  }}
                ></div>
              </div>
            </div>
          )}

          {error && <p className="text-center text-red-400 mt-4">{error}</p>}
          
          {generatedText && (
            <div className="mt-8">
               <h2 className="text-lg font-semibold mb-4 text-text-primary">3. Your Anki Cards are Ready!</h2>
              <GeneratedCards content={generatedText} fileName={file?.name} />
            </div>
          )}
        </div>
      </main>

       <footer className="w-full max-w-4xl text-center mt-8 text-text-secondary text-sm">
        <p>Powered by the Google Gemini API. Upload your file, select a card type, and generate a .txt file ready for Anki import.</p>
      </footer>
    </div>
  );
}