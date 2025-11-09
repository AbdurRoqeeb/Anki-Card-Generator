import React from 'react';
import { DownloadIcon } from './Icons';

interface GeneratedCardsProps {
  content: string;
  fileName?: string;
}

const GeneratedCards: React.FC<GeneratedCardsProps> = ({ content, fileName }) => {
  const handleDownload = () => {
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

  return (
    <div className="w-full">
      <textarea
        readOnly
        value={content}
        className="w-full h-64 p-4 font-mono text-sm bg-background/50 border border-border rounded-lg focus:ring-primary focus:border-primary"
        placeholder="Your generated cards will appear here..."
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300"
        >
          <DownloadIcon className="w-5 h-5" />
          Download .txt File
        </button>
      </div>
    </div>
  );
};

export default GeneratedCards;