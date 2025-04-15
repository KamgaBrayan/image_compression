'use client';

import React, { useState } from 'react';
import DropZone from '@/components/DropZone';
import ImagePreview from '@/components/ImagePreview';
import CompressionStats from '@/components/CompressionStats';
import DownloadSection from '@/components/DownloadSection';
import { useImageStore } from '@/lib/store';
import { compressImage, downloadAllAsZip } from '@/lib/imageCompression';
import { downloadFile } from '@/lib/utils';

export default function Home() {
  const { images, options, updateImageStatus } = useImageStore();
  const [isCompressing, setIsCompressing] = useState(false);
  
  const handleCompress = async (id: string) => {
    const image = images.find((img) => img.id === id);
    
    if (!image) return;
    
    try {
      updateImageStatus(id, 'compressing');
      
      const result = await compressImage(image.file, id, options);
      
      updateImageStatus(id, 'compressed', {
        compressedUrl: result.compressedUrl,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio,
      });
    } catch (error) {
      updateImageStatus(id, 'error', {
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    }
  };
  
  const handleCompressAll = async () => {
    const pendingImages = images.filter((img) => img.status === 'idle');
    
    if (pendingImages.length === 0) return;
    
    setIsCompressing(true);
    
    try {
      for (const image of pendingImages) {
        await handleCompress(image.id);
      }
    } finally {
      setIsCompressing(false);
    }
  };
  
  const handleDownloadAll = async () => {
    const compressedImages = images.filter((img) => img.status === 'compressed');
    
    if (compressedImages.length <= 1) {
      // If there's only one image, download it directly
      const image = compressedImages[0];
      if (image && image.compressedUrl) {
        downloadFile(image.compressedUrl, `compressed-${image.name}`);
      }
      return;
    }
    
    try {
      // For multiple images, use the ZIP download
      await downloadAllAsZip(
        compressedImages.map((img) => ({
          id: img.id,
          compressedUrl: img.compressedUrl || '',
          compressedSize: img.compressedSize || 0,
          originalSize: img.size,
          compressionRatio: img.compressionRatio || 0,
        }))
      );
    } catch (error) {
      console.error('Error downloading all images:', error);
      alert('Erreur lors du téléchargement des images');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Compression d&apos;Images</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Compressez vos images sans perte de qualité visible
          </p>
        </header>
        
        <main>
          <section className="mb-8">
            <DropZone />
          </section>
          
          {images.length > 0 && (
            <>
              <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Images ({images.length})
                  </h2>
                  
                  {images.some((img) => img.status === 'idle') && (
                    <button
                      onClick={handleCompressAll}
                      disabled={isCompressing}
                      className={`
                        px-4 py-2 rounded font-medium text-white transition-colors
                        ${isCompressing
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                        }
                      `}
                    >
                      {isCompressing ? 'Compression en cours...' : 'Tout compresser'}
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((image) => (
                    <ImagePreview
                      key={image.id}
                      image={image}
                      onCompress={handleCompress}
                    />
                  ))}
                </div>
              </section>
              
              <CompressionStats images={images} />
              
              <DownloadSection
                images={images}
                onDownloadAll={handleDownloadAll}
              />
            </>
          )}
        </main>
        
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Compression d&apos;Images</p>
          <p className="mt-1">
            Compressez vos images efficacement et sans perte de qualité visible
          </p>
        </footer>
      </div>
    </div>
  );
}
