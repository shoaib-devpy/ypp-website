import { NextResponse } from 'next/server';
import pool from '../../../lib/db.js';

export async function GET() {
  const [gallery, members, certificates] = await Promise.all([
    pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE type = \'image\') as images, COUNT(*) FILTER (WHERE type = \'video\') as videos FROM gallery_items'),
    pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = \'active\') as active FROM members'),
    pool.query('SELECT COUNT(*) as total FROM certificates'),
  ]);

  const countryRes = await pool.query('SELECT country, COUNT(*) as count FROM gallery_items GROUP BY country ORDER BY count DESC LIMIT 10');
  const recentMembers = await pool.query('SELECT id, membership_id, full_name, photo_path, status, created_at FROM members ORDER BY created_at DESC LIMIT 5');
  const recentGallery = await pool.query('SELECT id, title, type, file_path, created_at FROM gallery_items ORDER BY created_at DESC LIMIT 5');

  return NextResponse.json({
    gallery: { total: +gallery.rows[0].total, images: +gallery.rows[0].images, videos: +gallery.rows[0].videos },
    members: { total: +members.rows[0].total, active: +members.rows[0].active },
    certificates: { total: +certificates.rows[0].total },
    countries: countryRes.rows,
    recentMembers: recentMembers.rows,
    recentGallery: recentGallery.rows,
  });
}
