
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cardOptions.map((option) => (
        <label
          key={option.id}
          htmlFor={option.id}
          className={`relative flex flex-col p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
            selectedType === option.id
              ? 'border-primary bg-blue-900/30 ring-2 ring-primary'
              : 'border-border bg-background/50 hover:border-gray-600'
          }`}
        >
          <input
            type="radio"
            id={option.id}
            name="cardType"
            value={option.id}
            checked={selectedType === option.id}
            onChange={() => onTypeChange(option.id)}
            className="absolute top-4 right-4"
          />
          <span className="font-semibold text-text-primary">{option.label}</span>
          <span className="text-sm text-text-secondary mt-1">{option.description}</span>
        </label>
      ))}
    </div>
  );
};

export default CardTypeSelector;
