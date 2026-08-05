import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try local filesystem write first
    try {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
      const filename = `${uniqueSuffix}-${safeName}`;
      
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const filePath = join(uploadDir, filename);
      await writeFile(filePath, buffer);

      return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (fsError) {
      // On serverless environments (like Vercel), the filesystem is read-only.
      // Fallback seamlessly to Base64 Data URL so uploaded images persist reliably in the database.
      console.warn('Filesystem read-only, falling back to Base64 Data URL:', fsError);
      
      const mimeType = file.type || 'image/jpeg';
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;

      return NextResponse.json({ url: dataUrl });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 });
  }
}
