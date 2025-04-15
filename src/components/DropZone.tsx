import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useImageStore } from '../lib/store';
import { isImageFile } from '../lib/utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
// const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function DropZone() {
  const addImages = useImageStore((state) => state.addImages);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out non-image files and files that are too large
    const validFiles = acceptedFiles.filter(
      (file) => isImageFile(file) && file.size <= MAX_FILE_SIZE
    );
    
    if (validFiles.length > 0) {
      addImages(validFiles);
    }
  }, [addImages]);
  
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
    },
    maxSize: MAX_FILE_SIZE,
  });
  
  return (
    <div 
      {...getRootProps()} 
      className={`
        flex flex-col items-center justify-center w-full p-8 border-2 border-dashed 
        rounded-lg transition-colors cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'}
        ${isDragReject ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
        hover:bg-gray-50 dark:hover:bg-gray-900/20
      `}
    >
      <input {...getInputProps()} />
      
      <svg 
        className="w-12 h-12 mb-4 text-gray-400" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      
      {isDragActive ? (
        <p className="text-lg text-blue-500 dark:text-blue-400">Déposez les images ici...</p>
      ) : isDragReject ? (
        <p className="text-lg text-red-500 dark:text-red-400">Fichier non supporté ou trop volumineux</p>
      ) : (
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Glissez-déposez vos images ici, ou cliquez pour sélectionner
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Formats supportés: JPG, PNG, WebP, GIF (max 5MB)
          </p>
        </div>
      )}
    </div>
  );
}
