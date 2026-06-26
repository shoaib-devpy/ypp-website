import { NextResponse } from 'next/server';
import pool from '../../../lib/db.js';
import { getSession } from '../../../lib/auth.js';

export async function GET() {
  const { rows } = await pool.query('SELECT * FROM partners ORDER BY sort_order ASC, created_at ASC');
  return NextResponse.json(rows);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, logo_path, sort_order } = await req.json();
  const { rows } = await pool.query(
    'INSERT INTO partners (name, logo_path, sort_order) VALUES ($1,$2,$3) RETURNING *',
    [name, logo_path, sort_order || 0]
  );
  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  await pool.query('DELETE FROM partners WHERE id = $1', [searchParams.get('id')]);
  return NextResponse.json({ deleted: true });
}
