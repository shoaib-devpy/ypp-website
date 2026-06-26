import { NextResponse } from 'next/server';
import pool from '../../../lib/db.js';
import { getSession } from '../../../lib/auth.js';

export async function GET() {
  const { rows } = await pool.query('SELECT * FROM slider_items WHERE active = true ORDER BY sort_order ASC, created_at DESC');
  return NextResponse.json(rows);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, file_path, sort_order } = body;

  const { rows } = await pool.query(
    'INSERT INTO slider_items (title, file_path, sort_order) VALUES ($1, $2, $3) RETURNING *',
    [title || '', file_path, sort_order || 0]
  );

  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await pool.query('DELETE FROM slider_items WHERE id = $1', [id]);
  return NextResponse.json({ deleted: true });
}
