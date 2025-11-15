import React, { useState } from 'react';
import { DownloadIcon, CopyIcon, CheckIcon, TrashIcon } from './Icons';
import { AnkiCard, AnkiClozeCard, CardType } from '../types';

// --- CardItem Component ---
interface CardItemProps {
  card: AnkiCard | AnkiClozeCard;
  index: number;
  onUpdate: (index: number, updatedCard: AnkiCard | AnkiClozeCard) => void;
  onDelete: (index: number) => void;
}

const isClozeCard = (card: AnkiCard | AnkiClozeCard): card is AnkiClozeCard => {
  return (card as AnkiClozeCard).text !== undefined;
};

const CardItem: React.FC<CardItemProps> = ({ card, index, onUpdate, onDelete }) => {
  
  const handleFrontChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(index, { ...card, front: e.target.value } as AnkiCard);
  };

  const handleBackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(index, { ...card, back: e.target.value } as AnkiCard);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(index, { text: e.target.value } as AnkiClozeCard);
  };
  
  return (
    <div className="bg-black/30 p-4 rounded-lg border border-border relative group transition-all hover:border-gray-600">
      <button 
        onClick={() => onDelete(index)}
        className="absolute -top-2 -right-2 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:scale-110 focus:opacity-100 z-10"
        aria-label="Delete card"
      >
        <TrashIcon className="w-4 h-4" />
      </button>

      {isClozeCard(card) ? (
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Text (Cloze)</label>
          <textarea
            value={card.text}
            onChange={handleTextChange}
            className="w-full bg-black/40 border border-gray-600 rounded-md p-2 text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary resize-y"
            rows={3}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Front</label>
            <textarea
              value={(card as AnkiCard).front}
              onChange={handleFrontChange}
              className="w-full bg-black/40 border border-gray-600 rounded-md p-2 text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary resize-y"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Back</label>
            <textarea
              value={(card as AnkiCard).back}
              onChange={handleBackChange}
              className="w-full bg-black/40 border border-gray-600 rounded-md p-2 text-sm text-text-primary focus:ring-2 focus:ring-primary focus:border-primary resize-y"
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  );
};


// --- GeneratedCards Component ---
interface GeneratedCardsProps {
  cards: (AnkiCard | AnkiClozeCard)[];
  cardType: CardType;
  fileName?: string;
  onUpdateCard: (index: number, updatedCard: AnkiCard | AnkiClozeCard) => void;
  onDeleteCard: (index: number) => void;
}

const GeneratedCards: React.FC<GeneratedCardsProps> = ({ cards, cardType, fileName, onUpdateCard, onDeleteCard }) => {
  const [isCopied, setIsCopied] = useState(false);

  const formatCardsToString = () => {
    if (cardType === CardType.CLOZE) {
      return (cards as AnkiClozeCard[]).map(card => card.text).join('\n');
    }
    
    let outputText = (cards as AnkiCard[]).map(card => `${card.front || ''}\t${card.back || ''}`).join('\n');
    
    if (cardType === CardType.BASIC_REVERSED) {
      const reversedText = (cards as AnkiCard[]).map(card => `${card.back || ''}\t${card.front || ''}`).join('\n');
      if (outputText && reversedText) {
        outputText += '\n' + reversedText;
      } else if (reversedText) {
        outputText = reversedText;
      }
    }
    return outputText;
  };

  const handleDownload = () => {
    const content = formatCardsToString();
    if (!content) return;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    let downloadFileName = 'anki_cards.txt';
    if (fileName) {
      const lastDotIndex = fileName.lastIndexOf('.');
      const baseName = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
      downloadFileName = `${baseName}_anki.txt`;
    }

    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const content = formatCardsToString();
    if (!content) return;

    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }).catch(err => {
      console.error('Could not copy text: ', err);
      alert('Failed to copy text to clipboard.');
    });
  };

  return (
    <div className="w-full">
       <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 -mr-2 mb-6 border border-border bg-black/20 p-4 rounded-lg">
          {cards.length > 0 ? (
            cards.map((card, index) => (
              <CardItem
                key={index}
                card={card}
                index={index}
                onUpdate={onUpdateCard}
                onDelete={onDeleteCard}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-40 text-text-secondary">
              <p>No cards to display. All cards have been deleted.</p>
            </div>
          )}
        </div>

      <div className="mt-5 flex justify-end gap-4">
         <button
          onClick={handleCopy}
          disabled={isCopied || cards.length === 0}
          className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100 ${
            isCopied
              ? 'bg-emerald-600 text-white focus:ring-emerald-500'
              : 'bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-400'
          }`}
        >
          {isCopied ? (
            <>
              <CheckIcon className="w-5 h-5" />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon className="w-5 h-5" />
              Copy
            </>
          )}
        </button>
        <button
          onClick={handleDownload}
          disabled={cards.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 disabled:from-gray-700 disabled:to-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100"
        >
          <DownloadIcon className="w-5 h-5" />
          Download .txt File
        </button>
      </div>
    </div>
  );
};

export default GeneratedCards;