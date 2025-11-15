import React from 'react';
import { CardType } from '../types';

interface CardTypeSelectorProps {
  selectedType: CardType;
  onTypeChange: (type: CardType) => void;
}

const cardOptions = [
  { id: CardType.BASIC, label: 'Basic', description: 'Simple front and back cards.' },
  { id: CardType.BASIC_REVERSED, label: 'Basic + Reversed', description: 'Creates both front->back and back->front cards.' },
  { id: CardType.CLOZE, label: 'Cloze Deletion', description: 'Cards that hide parts of a sentence.' },
];

const CardTypeSelector: React.FC<CardTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cardOptions.map((option) => (
        <label
          key={option.id}
          htmlFor={option.id}
          className={`relative flex flex-col p-5 border rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
            selectedType === option.id
              ? 'border-primary bg-gradient-to-br from-blue-900/30 to-purple-900/20 ring-2 ring-primary shadow-lg shadow-blue-500/20'
              : 'border-border bg-black/20 hover:border-gray-600'
          }`}
        >
          <input
            type="radio"
            id={option.id}
            name="cardType"
            value={option.id}
            checked={selectedType === option.id}
            onChange={() => onTypeChange(option.id)}
            className="sr-only" // Hide the radio button but keep it accessible
          />
          <span className="font-bold text-lg text-text-primary">{option.label}</span>
          <span className="text-sm text-text-secondary mt-2">{option.description}</span>
           {selectedType === option.id && (
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </label>
      ))}
    </div>
  );
};

export default CardTypeSelector;