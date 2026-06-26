import { NextResponse } from 'next/server';
import pool from '../../../lib/db.js';
import { getSession } from '../../../lib/auth.js';
import { sendEmail, applicationEmail } from '../../../lib/mailer.js';

// Public POST — submit application
export async function POST(req) {
  const body = await req.json();
  const { full_name, father_name, cnic, province, city, country_code, phone, email, blood_group, profession, why_join, photo_path, cv_path, mail_address } = body;

  if (!full_name || !email) return NextResponse.json({ error: 'Name and email required' }, { status: 400 });

  const { rows } = await pool.query(
    `INSERT INTO member_applications (full_name, father_name, cnic, province, city, country_code, phone, email, blood_group, profession, why_join, photo_path, cv_path, mail_address)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
    [full_name, father_name, cnic, province, city, country_code || '+92', phone, email, blood_group, profession, why_join, photo_path, cv_path, mail_address]
  );

  // Send confirmation email
  sendEmail(email, 'Application Received — Youth Parliament Pakistan',
    applicationEmail(full_name, 'received', null, null)
  ).catch(() => {});

  return NextResponse.json(rows[0], { status: 201 });
}

// Admin GET — list all applications
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { rows } = await pool.query('SELECT * FROM member_applications ORDER BY created_at DESC');
  return NextResponse.json(rows);
}

// Admin PATCH — update status
export async function PATCH(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, status, admin_comment, membership_id } = body;

  const { rows } = await pool.query(
    `UPDATE member_applications SET status=$1, admin_comment=$2, membership_id=$3, updated_at=NOW() WHERE id=$4 RETURNING *`,
    [status, admin_comment || '', membership_id || '', id]
  );

  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const app = rows[0];

  // If approved, also add to members table
  if (status === 'approved' && membership_id) {
    await pool.query(
      `INSERT INTO members (membership_id, full_name, father_name, cnic, province, city, country_code, phone, email, blood_group, profession, photo_path, mail_address, why_join, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'active') ON CONFLICT (membership_id) DO NOTHING`,
      [membership_id, app.full_name, app.father_name, app.cnic, app.province, app.city, app.country_code, app.phone, app.email, app.blood_group, app.profession, app.photo_path, app.mail_address, app.why_join]
    );
  }

  // Send status email
  sendEmail(app.email, `Application ${status.charAt(0).toUpperCase() + status.slice(1)} — Youth Parliament Pakistan`,
    applicationEmail(app.full_name, status, admin_comment, membership_id)
  ).catch(() => {});

  return NextResponse.json(rows[0]);
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await pool.query('DELETE FROM member_applications WHERE id = $1', [id]);
  return NextResponse.json({ deleted: true });
}
