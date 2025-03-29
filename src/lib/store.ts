import { create } from 'zustand';
import { ImageFile, CompressionOptions } from '../types';

interface ImageStore {
  images: ImageFile[];
  options: CompressionOptions;
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  updateImageStatus: (id: string, status: ImageFile['status'], data?: Partial<ImageFile>) => void;
  clearImages: () => void;
  setOptions: (options: Partial<CompressionOptions>) => void;
}

export const useImageStore = create<ImageStore>((set) => ({
  images: [],
  options: {
    quality: 80,
    format: 'original',
  },
  
  addImages: (files) => {
    set((state) => {
      const newImages = files.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'idle' as const,
      }));
      
      return { images: [...state.images, ...newImages] };
    });
  },
  
  removeImage: (id) => {
    set((state) => ({
      images: state.images.filter((image) => image.id !== id),
    }));
  },
  
  updateImageStatus: (id, status, data = {}) => {
    set((state) => ({
      images: state.images.map((image) => 
        image.id === id ? { ...image, status, ...data } : image
      ),
    }));
  },
  
  clearImages: () => {
    set({ images: [] });
  },
  
  setOptions: (options) => {
    set((state) => ({
      options: { ...state.options, ...options },
    }));
  },
}));
