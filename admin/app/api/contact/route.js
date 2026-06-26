import { NextResponse } from 'next/server';
import pool from '../../../lib/db.js';
import { getSession } from '../../../lib/auth.js';

export async function POST(req) {
  const { full_name, email, subject, message } = await req.json();
  if (!full_name || !email || !message) return NextResponse.json({ error: 'Name, email, and message required' }, { status: 400 });
  const { rows } = await pool.query(
    'INSERT INTO contact_messages (full_name, email, subject, message) VALUES ($1,$2,$3,$4) RETURNING *',
    [full_name, email, subject, message]
  );
  return NextResponse.json(rows[0], { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { rows } = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
  return NextResponse.json(rows);
}

export async function PATCH(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await pool.query('UPDATE contact_messages SET is_read = true WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  await pool.query('DELETE FROM contact_messages WHERE id = $1', [searchParams.get('id')]);
  return NextResponse.json({ deleted: true });
}
