import { NextResponse } from 'next/server';
import pool from '../../../lib/db.js';
import { getSession } from '../../../lib/auth.js';

export async function GET() {
  const { rows } = await pool.query('SELECT * FROM certificates ORDER BY created_at DESC');
  return NextResponse.json(rows);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, description, file_path } = body;

  const { rows } = await pool.query(
    'INSERT INTO certificates (title, description, file_path) VALUES ($1, $2, $3) RETURNING *',
    [title, description || '', file_path]
  );

  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await pool.query('DELETE FROM certificates WHERE id = $1', [id]);
  return NextResponse.json({ deleted: true });
}
