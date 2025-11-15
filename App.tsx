import React, { useState, useCallback } from 'react';
import { CardType } from './types';
import type { AnkiCard, AnkiClozeCard } from './types';
import FileUpload from './components/FileUpload';
import CardTypeSelector from './components/CardTypeSelector';
import GeneratedCards from './components/GeneratedCards';
import AdvancedOptions from './components/AdvancedOptions';
import { generateAnkiCards } from './services/geminiService';
import { fileToBase64, extractTextFromDocx, extractTextFromPptx } from './utils/fileUtils';
import { GithubIcon, SparklesIcon } from './components/Icons';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [cardType, setCardType] = useState<CardType>(CardType.BASIC);
  const [numCards, setNumCards] = useState<number | undefined>(undefined);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [generatedCards, setGeneratedCards] = useState<(AnkiCard | AnkiClozeCard)[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setGeneratedCards([]);
    setError(null);
  };

  const handleUpdateCard = (index: number, updatedCard: AnkiCard | AnkiClozeCard) => {
    setGeneratedCards(prevCards => {
      const newCards = [...prevCards];
      newCards[index] = updatedCard;
      return newCards;
    });
  };

  const handleDeleteCard = (index: number) => {
    setGeneratedCards(prevCards => prevCards.filter((_, i) => i !== index));
  };

  const handleCreateCards = useCallback(async () => {
    if (!file) {
      setError('Please upload a document first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedCards([]);

    try {
      setLoadingMessage('Analyzing your document...');
      const fileType = file.type;
      let documentInput: { base64: string; mimeType: string; } | { text: string };

      if (fileType === 'application/pdf') {
          const { base64, mimeType } = await fileToBase64(file);
          documentInput = { base64, mimeType };
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const text = await extractTextFromDocx(file);
          documentInput = { text };
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
          const text = await extractTextFromPptx(file);
          documentInput = { text };
      } else {
        throw new Error('Unsupported file type. Please upload a PDF, DOCX, or PPTX.');
      }
      
      setLoadingMessage('Generating flashcards with AI...');
      const result = await generateAnkiCards(documentInput, cardType, numCards, customPrompt);

      setLoadingMessage('Formatting your cards...');
      setGeneratedCards(result.cards);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [file, cardType, numCards, customPrompt]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl mx-auto">
        <header className="w-full flex justify-between items-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Anki Card Generator
          </h1>
          <a href="https://github.com/google/prompt-gallery" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors duration-300">
            <GithubIcon className="w-8 h-8" />
          </a>
        </header>
        
        <main className="w-full bg-secondary glass-effect rounded-2xl border border-border shadow-2xl p-6 sm:p-10">
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-bold mb-2 text-text-primary">1. Upload Your Document</h2>
              <p className="text-base text-text-secondary mb-5">Upload a PDF, DOCX, or PPTX document to get started.</p>
              <FileUpload onFileChange={handleFileChange} />
            </div>

            <div>
              <h2 className="text-xl font-bold mb-5 text-text-primary">2. Select Card Type</h2>
              <CardTypeSelector selectedType={cardType} onTypeChange={setCardType} />
            </div>

            <div>
               <details className="group rounded-lg transition-all duration-300">
                  <summary className="list-none flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-primary transition-colors font-medium">
                    <svg className="w-5 h-5 transform group-open:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    Advanced Options
                  </summary>
                  <div className="mt-4 p-5 bg-black/20 rounded-lg border border-border">
                    <AdvancedOptions
                        numCards={numCards}
                        onNumCardsChange={setNumCards}
                        customPrompt={customPrompt}
                        onCustomPromptChange={setCustomPrompt}
                    />
                  </div>
              </details>
            </div>

            <div className="flex flex-col items-center pt-6 border-t border-border">
              <button
                onClick={handleCreateCards}
                disabled={!file || isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-primary-light to-purple-600 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 disabled:bg-gray-700 disabled:from-gray-700 disabled:to-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100 animate-pulse disabled:animate-none"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-6 h-6" />
                    Create Anki Cards
                  </>
                )}
              </button>
            </div>
            
            {isLoading && (
              <div className="w-full max-w-lg mx-auto mt-6" aria-live="polite" aria-busy="true">
                <p className="text-center text-base text-text-secondary mb-3 font-medium">
                  {loadingMessage}
                </p>
                <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden relative border border-border">
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.2), rgba(255,255,255,0))',
                      backgroundSize: '200px 100%',
                      backgroundRepeat: 'no-repeat',
                      animation: 'shimmer 2s linear infinite'
                    }}
                  ></div>
                </div>
              </div>
            )}

            {error && <p className="text-center text-red-400 bg-red-900/30 border border-red-500/50 p-4 rounded-lg mt-6">{error}</p>}
            
            {generatedCards.length > 0 && (
              <div className="mt-10 border-t border-border pt-8">
                 <h2 className="text-xl font-bold mb-5 text-text-primary">3. Your Anki Cards are Ready!</h2>
                <GeneratedCards
                  cards={generatedCards}
                  cardType={cardType}
                  fileName={file?.name}
                  onUpdateCard={handleUpdateCard}
                  onDeleteCard={handleDeleteCard}
                />
              </div>
            )}
          </div>
        </main>

         <footer className="w-full text-center mt-10 text-text-secondary text-sm">
          <p>Powered by the Google Gemini API. Upload your file, select a card type, and generate a .txt file ready for Anki import.</p>
        </footer>
      </div>
    </div>
  );
}