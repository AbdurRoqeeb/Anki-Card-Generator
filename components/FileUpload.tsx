
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, FileIcon } from './Icons';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | null) => {
    if (file && ['application/pdf'].includes(file.type)) {
      setFileName(file.name);
      onFileChange(file);
    } else {
      setFileName(null);
      onFileChange(null);
      if(file) alert('Invalid file type. Please upload a PDF file.');
    }
  }, [onFileChange]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  }

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf"
        className="hidden"
      />
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragging ? 'border-primary bg-blue-900/20' : 'border-border hover:border-gray-500 bg-background/50 hover:bg-secondary'}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            {fileName ? (
                <>
                    <FileIcon className="w-10 h-10 mb-3 text-green-400" />
                    <p className="font-semibold text-text-primary">{fileName}</p>
                    <p className="text-xs text-text-secondary">Click or drag to replace the file</p>
                </>
            ) : (
                <>
                    <UploadIcon className="w-10 h-10 mb-3 text-text-secondary" />
                    <p className="mb-2 text-sm text-text-secondary"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-text-secondary">PDF only</p>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
