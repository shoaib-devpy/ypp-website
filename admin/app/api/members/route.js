import { NextResponse } from 'next/server';
import pool from '../../../lib/db.js';
import { getSession } from '../../../lib/auth.js';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { rows } = await pool.query('SELECT * FROM members ORDER BY created_at DESC');
  return NextResponse.json(rows);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { membership_id, full_name, father_name, cnic, province, city, phone, email, blood_group, profession, photo_path, status } = body;

  const { rows } = await pool.query(
    `INSERT INTO members (membership_id, full_name, father_name, cnic, province, city, phone, email, blood_group, profession, photo_path, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [membership_id, full_name, father_name, cnic, province, city, phone, email, blood_group, profession, photo_path, status || 'active']
  );

  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await pool.query('DELETE FROM members WHERE id = $1', [id]);
  return NextResponse.json({ deleted: true });
}
