/**
 * Utility functions for the image compression application
 */

/**
 * Format file size to human-readable format
 * @param bytes File size in bytes
 * @returns Formatted file size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Calculate compression ratio
 * @param originalSize Original file size in bytes
 * @param compressedSize Compressed file size in bytes
 * @returns Compression ratio as a percentage
 */
export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0;
  const ratio = ((originalSize - compressedSize) / originalSize) * 100;
  return Math.round(ratio * 10) / 10; // Round to 1 decimal place
}

/**
 * Check if a file is an image
 * @param file File to check
 * @returns True if the file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Get file extension from file name
 * @param fileName File name
 * @returns File extension (e.g., "jpg")
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * Convert a File object to a base64 string
 * @param file File to convert
 * @returns Promise that resolves to a base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Convert a base64 string to a Blob
 * @param base64 Base64 string
 * @param mimeType MIME type of the blob
 * @returns Blob object
 */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeType });
}

/**
 * Download a file from a URL
 * @param url URL of the file
 * @param fileName Name to save the file as
 */
export function downloadFile(url: string, fileName: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Create a ZIP file containing multiple files
 * @param files Array of file URLs and names
 * @returns Promise that resolves to a Blob containing the ZIP file
 */
export async function createZipFile(): Promise<Blob> {
  // This is a placeholder. In a real implementation, we would use a library like JSZip
  // Since we're using the server for compression, we'll implement this on the server side
  throw new Error('Not implemented');
}
