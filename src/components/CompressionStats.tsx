import React, { useMemo } from 'react';
import { ImageFile } from '../types';
import { formatFileSize, calculateCompressionRatio } from '../lib/utils';

interface CompressionStatsProps {
  images: ImageFile[];
}

export default function CompressionStats({ images }: CompressionStatsProps) {
  const stats = useMemo(() => {
    const compressedImages = images.filter((img) => img.status === 'compressed');
    
    if (compressedImages.length === 0) {
      return null;
    }
    
    const totalOriginalSize = compressedImages.reduce((sum, img) => sum + img.size, 0);
    const totalCompressedSize = compressedImages.reduce((sum, img) => sum + (img.compressedSize || 0), 0);
    const averageCompressionRatio = calculateCompressionRatio(totalOriginalSize, totalCompressedSize);
    
    return {
      count: compressedImages.length,
      totalOriginalSize,
      totalCompressedSize,
      averageCompressionRatio,
      saved: totalOriginalSize - totalCompressedSize,
    };
  }, [images]);
  
  if (!stats || stats.count === 0) {
    return null;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Statistiques de compression</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Images compressées</p>
          <p className="text-2xl font-bold">{stats.count}</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Taille originale</p>
          <p className="text-2xl font-bold">{formatFileSize(stats.totalOriginalSize)}</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Taille compressée</p>
          <p className="text-2xl font-bold">{formatFileSize(stats.totalCompressedSize)}</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Réduction moyenne</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.averageCompressionRatio}%
          </p>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-green-600 dark:text-green-400 font-medium">
          Vous avez économisé {formatFileSize(stats.saved)} d&apos;espace disque!
        </p>
      </div>
    </div>
  );
}
