import { NextResponse } from 'next/server';
import pool from '../../../lib/db.js';
import { getSession } from '../../../lib/auth.js';

export async function GET() {
  const { rows } = await pool.query('SELECT * FROM leadership ORDER BY sort_order ASC, created_at ASC');
  return NextResponse.json(rows);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { rows } = await pool.query(
    'INSERT INTO leadership (full_name, designation, photo_path, quote, bio, sign_text, wiki_url, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [body.full_name, body.designation, body.photo_path, body.quote, body.bio, body.sign_text, body.wiki_url, body.sort_order || 0]
  );
  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  await pool.query('DELETE FROM leadership WHERE id = $1', [searchParams.get('id')]);
  return NextResponse.json({ deleted: true });
}
