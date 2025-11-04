/**
 * Photo Resize API
 * 
 * Handles resizing uploaded photos to create preview versions
 */

import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const quality = parseInt(formData.get('quality') as string) || 25;
    const watermarkUrl = formData.get('watermarkUrl') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get original image metadata
    const metadata = await sharp(buffer).metadata();
    
    if (!metadata.width || !metadata.height) {
      return NextResponse.json(
        { error: 'Invalid image file' },
        { status: 400 }
      );
    }

    // Calculate new dimensions (25% of original by default)
    const scale = quality / 100;
    const newWidth = Math.round(metadata.width * scale);
    const newHeight = Math.round(metadata.height * scale);

    console.log(`Resizing image from ${metadata.width}x${metadata.height} to ${newWidth}x${newHeight} (${quality}%)`);

    // Resize the image with lower quality for preview
    const imageBuffer = await sharp(buffer)
      .resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ 
        quality: 60,  // Lower quality for smaller file size
        progressive: true,
        mozjpeg: true  // Use mozjpeg for better compression
      })
      .toBuffer();

    // Composite watermark onto image
    let resizedBuffer: Buffer;
    
    if (watermarkUrl) {
      try {
        // Fetch watermark image
        const watermarkResponse = await fetch(watermarkUrl);
        if (!watermarkResponse.ok) {
          throw new Error('Failed to fetch watermark');
        }
        
        const watermarkBuffer = Buffer.from(await watermarkResponse.arrayBuffer());
        
        // Get watermark metadata
        const watermarkMeta = await sharp(watermarkBuffer).metadata();
        
        // Calculate watermark size (15% of image width for repeating pattern)
        const watermarkWidth = Math.round(newWidth * 0.15);
        const watermarkHeight = watermarkMeta.width && watermarkMeta.height
          ? Math.round(watermarkWidth * (watermarkMeta.height / watermarkMeta.width))
          : watermarkWidth;
        
        // Create rotated watermark (-45 degrees)
        const rotatedWatermark = await sharp(watermarkBuffer)
          .resize(watermarkWidth, watermarkHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .rotate(-45, { background: { r: 0, g: 0, b: 0, alpha: 0 } }) // Rotate -45 deg with transparent bg
          .png() // Keep PNG for transparency
          .toBuffer();
        
        // Get rotated watermark dimensions
        const rotatedMeta = await sharp(rotatedWatermark).metadata();
        const rotatedWidth = rotatedMeta.width || watermarkWidth;
        const rotatedHeight = rotatedMeta.height || watermarkHeight;
        
        // Calculate how many watermarks needed (with spacing)
        const spacingX = rotatedWidth + Math.round(rotatedWidth * 0.3); // 30% spacing
        const spacingY = rotatedHeight + Math.round(rotatedHeight * 0.3);
        const cols = Math.ceil(newWidth / spacingX) + 1;
        const rows = Math.ceil(newHeight / spacingY) + 1;
        
        // Create composite array with repeating watermarks
        const composites = [];
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            composites.push({
              input: rotatedWatermark,
              left: col * spacingX - Math.round(spacingX / 2),
              top: row * spacingY - Math.round(spacingY / 2),
              blend: 'multiply' as const, // Multiply blend mode
            });
          }
        }
        
        // Composite all watermarks onto image
        resizedBuffer = await sharp(imageBuffer)
          .composite(composites)
          .toBuffer();
        
        console.log(`Watermark applied: ${rows}x${cols} = ${composites.length} instances`);
      } catch (watermarkError) {
        console.error('Watermark error:', watermarkError);
        // Fallback to text watermark if image watermark fails
        resizedBuffer = await addTextWatermark(imageBuffer, newWidth, newHeight);
      }
    } else {
      // Use text watermark if no watermark URL provided
      resizedBuffer = await addTextWatermark(imageBuffer, newWidth, newHeight);
    }

    console.log(`Original size: ${buffer.length} bytes, Resized: ${resizedBuffer.length} bytes`);

    // Return resized image as blob
    return new NextResponse(resizedBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': resizedBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Resize error:', error);
    return NextResponse.json(
      { error: 'Failed to resize image' },
      { status: 500 }
    );
  }
}

// Helper function to add text watermark
async function addTextWatermark(imageBuffer: Buffer, width: number, height: number): Promise<Buffer> {
  const watermarkSvg = `
    <svg width="${width}" height="${height}">
      <style>
        .title { 
          fill: rgba(255, 255, 255, 0.5); 
          font-size: ${Math.max(24, width / 25)}px; 
          font-weight: bold; 
          font-family: Arial, sans-serif;
        }
      </style>
      <text 
        x="50%" 
        y="50%" 
        text-anchor="middle" 
        class="title"
        transform="rotate(-45 ${width / 2} ${height / 2})"
      >
        PREVIEW - LOW RES
      </text>
    </svg>
  `;

  return await sharp(imageBuffer)
    .composite([
      {
        input: Buffer.from(watermarkSvg),
        gravity: 'center',
      }
    ])
    .toBuffer();
}
