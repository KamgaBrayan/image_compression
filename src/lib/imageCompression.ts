import { ApiResponse, CompressionOptions, CompressionResult } from '../types';

/**
 * Compress an image using the API
 * @param file Image file to compress
 * @param options Compression options
 * @returns Promise with compression result
 */
export async function compressImage(
  file: File,
  id: string,
  options: CompressionOptions
): Promise<CompressionResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', options.quality.toString());
  formData.append('format', options.format);
  
  const response = await fetch('/api/compress', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to compress image');
  }
  
  const data: ApiResponse = await response.json();
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to compress image');
  }
  
  return {
    ...data.data,
    id,
  };
}

/**
 * Compress multiple images in sequence
 * @param files Array of image files to compress
 * @param options Compression options
 * @param onProgress Callback for progress updates
 * @returns Promise with array of compression results
 */
export async function compressMultipleImages(
  files: { file: File; id: string }[],
  options: CompressionOptions,
  onProgress?: (id: string, status: 'compressing' | 'compressed' | 'error', 
                data?: CompressionResult | { error: string } | undefined ) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];
  
  for (const { file, id } of files) {
    try {
      if (onProgress) {
        onProgress(id, 'compressing');
      }
      
      const result = await compressImage(file, id, options);
      results.push(result);
      
      if (onProgress) {
        onProgress(id, 'compressed', result);
      }
    } catch (error) {
      if (onProgress) {
        onProgress(id, 'error', { error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  }
  
  return results;
}

/**
 * Download all compressed images as a ZIP file
 * @param images Array of compressed images
 * @returns Promise that resolves when the download is complete
 */
export async function downloadAllAsZip(images: CompressionResult[]): Promise<void> {
  try {
    const response = await fetch('/api/download-zip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ images }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create ZIP file');
    }
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed-images-${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading ZIP:', error);
    throw error;
  }
}
