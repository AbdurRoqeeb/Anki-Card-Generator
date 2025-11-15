import React from 'react';

interface AdvancedOptionsProps {
  numCards: number | undefined;
  onNumCardsChange: (value: number | undefined) => void;
  customPrompt: string;
  onCustomPromptChange: (value: string) => void;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  numCards,
  onNumCardsChange,
  customPrompt,
  onCustomPromptChange,
}) => {
  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onNumCardsChange(undefined);
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num > 0) {
        onNumCardsChange(num);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="num-cards" className="block text-sm font-medium text-text-secondary mb-2">
          Number of Cards (approx.)
        </label>
        <input
          type="number"
          id="num-cards"
          value={numCards || ''}
          onChange={handleNumChange}
          min="1"
          placeholder="Default (AI decides)"
          className="w-full bg-black/30 border border-border rounded-md shadow-sm px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
        />
      </div>
      <div>
        <label htmlFor="custom-prompt" className="block text-sm font-medium text-text-secondary mb-2">
          Custom Instructions
        </label>
        <textarea
          id="custom-prompt"
          rows={3}
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          placeholder="e.g., Focus on definitions and key historical dates."
          className="w-full bg-black/30 border border-border rounded-md shadow-sm px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-y"
        />
      </div>
    </div>
  );
};

export default AdvancedOptions;