import { NextResponse } from 'next/server';
import pool from '../../../lib/db.js';
import { getSession } from '../../../lib/auth.js';

export async function GET() {
  const { rows } = await pool.query('SELECT * FROM programs WHERE active = true ORDER BY sort_order ASC');
  return NextResponse.json(rows);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json();
  const slug = b.slug || b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const { rows } = await pool.query(
    `INSERT INTO programs (slug, title, eyebrow, lead, intro_title, intro_text, hero_image, partner_label, partner, donor_label, donor, focus, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [slug, b.title, b.eyebrow, b.lead, b.intro_title, b.intro_text, b.hero_image, b.partner_label || 'Partner', b.partner, b.donor_label || 'Donor', b.donor, JSON.stringify(b.focus || []), b.sort_order || 0]
  );
  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  await pool.query('DELETE FROM programs WHERE id = $1', [searchParams.get('id')]);
  return NextResponse.json({ deleted: true });
}
