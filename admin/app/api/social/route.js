import { NextResponse } from 'next/server';
import pool from '../../../lib/db.js';
import { getSession } from '../../../lib/auth.js';

export async function GET() {
  const { rows } = await pool.query('SELECT * FROM social_links ORDER BY id');
  return NextResponse.json(rows);
}

export async function PUT(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { links } = await req.json();
  for (const { platform, url } of links) {
    await pool.query('UPDATE social_links SET url = $1, updated_at = NOW() WHERE platform = $2', [url, platform]);
  }
  return NextResponse.json({ success: true });
}
