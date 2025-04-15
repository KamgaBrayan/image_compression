import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { calculateCompressionRatio } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const quality = Number(formData.get('quality') || 80);
    const format = (formData.get('format') as string) || 'original';
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File is not an image' },
        { status: 400 }
      );
    }
    
    // Get the file buffer
    const buffer = await file.arrayBuffer();
    const originalSize = buffer.byteLength;
    
    // Process the image with Sharp
    const sharpInstance = sharp(Buffer.from(buffer));
    let outputFormat: string;
    
    // Determine the output format
    if (format === 'original') {
      // Keep the original format
      outputFormat = file.type.split('/')[1];
    } else {
      outputFormat = format;
    }
    
    // Apply compression based on the format
    let compressedBuffer: Buffer;
    
    switch (outputFormat) {
      case 'jpeg':
      case 'jpg':
        compressedBuffer = await sharpInstance
          .jpeg({ quality })
          .toBuffer();
        break;
      case 'png':
        compressedBuffer = await sharpInstance
          .png({ quality: Math.max(1, Math.floor(quality / 10)) })
          .toBuffer();
        break;
      case 'webp':
        compressedBuffer = await sharpInstance
          .webp({ quality })
          .toBuffer();
        break;
      default:
        // Default to JPEG if format is not recognized
        compressedBuffer = await sharpInstance
          .jpeg({ quality })
          .toBuffer();
        outputFormat = 'jpeg';
    }
    
    // Calculate compression stats
    const compressedSize = compressedBuffer.byteLength;
    const compressionRatio = calculateCompressionRatio(originalSize, compressedSize);
    
    // Convert the compressed buffer to base64 for the response
    const base64Data = `data:image/${outputFormat};base64,${compressedBuffer.toString('base64')}`;
    
    // Return the compressed image data
    return NextResponse.json({
      success: true,
      data: {
        compressedUrl: base64Data,
        compressedSize,
        originalSize,
        compressionRatio,
      },
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
