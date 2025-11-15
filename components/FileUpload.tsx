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
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'  // PPTX
    ];

    if (file && allowedTypes.includes(file.type)) {
      setFileName(file.name);
      onFileChange(file);
    } else {
      setFileName(null);
      onFileChange(null);
      if(file) alert('Invalid file type. Please upload a PDF, DOCX, or PPTX file.');
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
        accept=".pdf,.docx,.pptx"
        className="hidden"
      />
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 overflow-hidden ${isDragging ? 'border-primary bg-blue-900/30 scale-105' : 'border-border hover:border-gray-500 bg-black/20 hover:bg-black/30'}`}
      >
         {isDragging && <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm z-10 transition-opacity"></div>}
         {isDragging && <div className="absolute inset-0 ring-4 ring-primary ring-inset rounded-xl animate-pulse"></div>}

        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center z-20">
            {fileName ? (
                <div className="flex flex-col items-center p-4">
                    <FileIcon className="w-12 h-12 mb-4 text-success" />
                    <p className="font-bold text-lg text-text-primary">{fileName}</p>
                    <p className="text-sm text-text-secondary mt-1">File is ready. Click or drag to replace.</p>
                </div>
            ) : (
                <>
                    <UploadIcon className="w-12 h-12 mb-4 text-text-secondary" />
                    <p className="mb-2 text-lg text-text-primary"><span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Click to upload</span> or drag and drop</p>
                    <p className="text-sm text-text-secondary">PDF, DOCX, or PPTX documents</p>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;