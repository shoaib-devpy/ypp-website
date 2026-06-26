import { NextResponse } from 'next/server';
import pool from '../../../lib/db.js';

export async function GET() {
  const { rows } = await pool.query('SELECT * FROM gallery_items ORDER BY created_at DESC');
  return NextResponse.json(rows);
}

export async function POST(req) {
  const body = await req.json();
  const { type, title, country, file_path, video_url, video_platform } = body;

  const { rows } = await pool.query(
    `INSERT INTO gallery_items (type, title, country, file_path, video_url, video_platform)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [type || 'image', title, country || 'pakistan', file_path || null, video_url || null, video_platform || null]
  );

  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await pool.query('DELETE FROM gallery_items WHERE id = $1', [id]);
  return NextResponse.json({ deleted: true });
}
