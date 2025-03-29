import React from 'react';
import Image from 'next/image';
import { ImageFile } from '../types';
import { formatFileSize } from '../lib/utils';
import { useImageStore } from '../lib/store';

interface ImagePreviewProps {
  image: ImageFile;
  onCompress: (id: string) => void;
}

export default function ImagePreview({ image, onCompress }: ImagePreviewProps) {
  const removeImage = useImageStore((state) => state.removeImage);
  
  const handleRemove = () => {
    removeImage(image.id);
  };
  
  const handleCompress = () => {
    onCompress(image.id);
  };
  
  return (
    <div className="relative flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="relative h-40 bg-gray-100 dark:bg-gray-700">
        <Image
          src={image.preview}
          alt={image.name}
          fill
          style={{ objectFit: 'contain' }}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium truncate" title={image.name}>
            {image.name}
          </h3>
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Supprimer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          <p>Taille: {formatFileSize(image.size)}</p>
          <p>Type: {image.type.split('/')[1].toUpperCase()}</p>
          
          {image.status === 'compressed' && (
            <div className="mt-2 text-green-600 dark:text-green-400">
              <p>Taille compressée: {formatFileSize(image.compressedSize || 0)}</p>
              <p>Réduction: {image.compressionRatio}%</p>
            </div>
          )}
          
          {image.status === 'error' && (
            <p className="mt-2 text-red-500">{image.error || 'Erreur de compression'}</p>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          {image.status === 'idle' && (
            <button
              onClick={handleCompress}
              className="w-full py-1.5 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
            >
              Compresser
            </button>
          )}
          
          {image.status === 'compressing' && (
            <button
              disabled
              className="w-full py-1.5 px-3 bg-blue-300 text-white text-sm font-medium rounded flex items-center justify-center"
            >
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Compression...
            </button>
          )}
          
          {image.status === 'compressed' && (
            <button
              onClick={() => image.compressedUrl && window.open(image.compressedUrl)}
              className="w-full py-1.5 px-3 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded transition-colors"
            >
              Télécharger
            </button>
          )}
          
          {image.status === 'error' && (
            <button
              onClick={handleCompress}
              className="w-full py-1.5 px-3 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded transition-colors"
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
