import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name) || '.jpg';
  const filename = `${Date.now()}${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const filePath = path.join(uploadDir, filename);

  await writeFile(filePath, buffer);

  return NextResponse.json({ path: `/uploads/${filename}` });
}
