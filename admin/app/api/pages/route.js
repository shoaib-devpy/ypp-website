import { NextResponse } from 'next/server';
import pool from '../../../lib/db.js';
import { getSession } from '../../../lib/auth.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });
  const { rows } = await pool.query('SELECT * FROM page_content WHERE page_key = $1', [key]);
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { page_key, title, subtitle, content } = await req.json();
  await pool.query(
    'UPDATE page_content SET title=$1, subtitle=$2, content=$3, updated_at=NOW() WHERE page_key=$4',
    [title, subtitle, JSON.stringify(content), page_key]
  );
  return NextResponse.json({ success: true });
}
