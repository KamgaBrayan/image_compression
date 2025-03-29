// Types for the image compression application

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
  status: 'idle' | 'compressing' | 'compressed' | 'error';
  compressedUrl?: string;
  compressedSize?: number;
  compressionRatio?: number;
  error?: string;
}

export interface CompressionOptions {
  quality: number;
  format: 'jpeg' | 'png' | 'webp' | 'original';
}

export interface CompressionResult {
  id: string;
  compressedUrl: string;
  compressedSize: number;
  originalSize: number;
  compressionRatio: number;
}

export interface ApiResponse {
  success: boolean;
  data?: CompressionResult;
  error?: string;
}
