import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '../../../../lib/db.js';
import { createToken } from '../../../../lib/auth.js';

export async function POST(req) {
  const { email, password } = await req.json();

  const { rows } = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
  if (!rows.length) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = await createToken({ id: user.id, email: user.email, name: user.name });

  const res = NextResponse.json({ success: true, name: user.name });
  res.cookies.set('ypp_admin_token', token, {
    httpOnly: true,
    maxAge: 86400,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
