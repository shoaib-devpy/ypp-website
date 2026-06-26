import { NextResponse } from 'next/server';
import pool from '../../../lib/db.js';
import { getSession } from '../../../lib/auth.js';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { rows } = await pool.query('SELECT * FROM email_settings LIMIT 1');
  const cfg = rows[0] || {};
  delete cfg.smtp_pass;
  return NextResponse.json(cfg);
}

export async function PUT(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { smtp_host, smtp_port, smtp_user, smtp_pass, from_email, from_name } = body;

  await pool.query(
    `UPDATE email_settings SET smtp_host=$1, smtp_port=$2, smtp_user=$3, smtp_pass=$4, from_email=$5, from_name=$6, updated_at=NOW() WHERE id=1`,
    [smtp_host, smtp_port || 587, smtp_user, smtp_pass, from_email, from_name || 'Youth Parliament Pakistan']
  );

  return NextResponse.json({ success: true });
}
