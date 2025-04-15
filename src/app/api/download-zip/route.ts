import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';

interface ImageForZip {
  id: string;
  compressedUrl: string;
  compressedSize: number;
  originalSize: number;
  compressionRatio: number;
}

export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json() as { images: ImageForZip[] };
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images provided' },
        { status: 400 }
      );
    }
    
    // Create a ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    const chunks: Uint8Array[] = [];
    
    // Collect data chunks
    archive.on('data', (chunk: Uint8Array) => {
      chunks.push(chunk);
    });
    
    // Handle errors
    archive.on('error', (err: Error) => {
      console.error('Archive error:', err);
      throw new Error('Failed to create ZIP archive');
    });
    
    // Process each image
    for (const image of images) {
      if (!image.compressedUrl) continue;
      
      try {
        // Extract base64 data
        const base64Data = image.compressedUrl.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Get file extension from MIME type
        const mimeType = image.compressedUrl.split(';')[0].split(':')[1];
        const extension = mimeType.split('/')[1];
        
        // Generate a filename
        const filename = `compressed-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
        
        // Add the file to the archive
        archive.append(buffer, { name: filename });
      } catch (error) {
        console.error('Error processing image for ZIP:', error);
        // Continue with other images
      }
    }
    
    // Finalize the archive
    archive.finalize();
    
    // Create a buffer from the chunks
    const buffer = Buffer.concat(chunks);
    
    // Return the ZIP file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="compressed-images-${new Date().toISOString().slice(0, 10)}.zip"`,
      },
    });
  } catch (error) {
    console.error('Error creating ZIP:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
