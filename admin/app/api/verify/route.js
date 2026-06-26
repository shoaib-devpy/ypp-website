import { NextResponse } from 'next/server';
import pool from '../../../lib/db.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();

  if (!q) return NextResponse.json({ error: 'Please provide a membership ID' }, { status: 400 });

  const { rows } = await pool.query(
    `SELECT membership_id, full_name, father_name, province, city, profession, photo_path, status, joined_date
     FROM members WHERE membership_id = $1 OR cnic = $1`,
    [q]
  );

  if (!rows.length) return NextResponse.json({ found: false });

  const member = rows[0];
  return NextResponse.json({
    found: true,
    member: {
      membership_id: member.membership_id,
      name: member.full_name,
      father_name: member.father_name,
      province: member.province,
      city: member.city,
      profession: member.profession,
      photo: member.photo_path,
      status: member.status,
      joined_date: member.joined_date,
    }
  });
}
