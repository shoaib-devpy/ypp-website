import nodemailer from 'nodemailer';
import pool from './db.js';

export async function sendEmail(to, subject, html) {
  const { rows } = await pool.query('SELECT * FROM email_settings LIMIT 1');
  const cfg = rows[0];
  if (!cfg?.smtp_host || !cfg?.smtp_user) return { sent: false, error: 'Email not configured' };

  const transporter = nodemailer.createTransport({
    host: cfg.smtp_host,
    port: cfg.smtp_port,
    secure: cfg.smtp_port === 465,
    auth: { user: cfg.smtp_user, pass: cfg.smtp_pass },
  });

  try {
    await transporter.sendMail({
      from: `"${cfg.from_name}" <${cfg.from_email || cfg.smtp_user}>`,
      to, subject, html,
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err.message };
  }
}

export function applicationEmail(name, status, comment, membershipId) {
  const statusMap = {
    received: { color: '#1a4fd6', label: 'Received', msg: 'Your membership application has been received. We will review it and get back to you soon.' },
    approved: { color: '#2e7d32', label: 'Approved', msg: `Congratulations! Your membership application has been approved.${membershipId ? ` Your Membership ID is: <strong>${membershipId}</strong>` : ''}` },
    rejected: { color: '#c62828', label: 'Rejected', msg: 'We regret to inform you that your membership application has been rejected.' },
    reapply: { color: '#e65100', label: 'Reapply Required', msg: 'Your application needs some changes. Please review the comments and reapply.' },
  };
  const s = statusMap[status] || { color: '#888', label: status, msg: '' };

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="text-align:center;margin-bottom:24px">
        <h2 style="color:#1a2e23;margin:0">Youth Parliament Pakistan</h2>
        <p style="color:#888;margin:4px 0 0">Membership Application Update</p>
      </div>
      <div style="padding:24px;border-radius:12px;border:1px solid #e8e8e8;background:#fff">
        <p>Dear <strong>${name}</strong>,</p>
        <div style="padding:14px 20px;border-radius:8px;background:${s.color}15;border-left:4px solid ${s.color};margin:16px 0">
          <strong style="color:${s.color}">Status: ${s.label}</strong>
        </div>
        <p>${s.msg}</p>
        ${comment ? `<div style="padding:14px;border-radius:8px;background:#f5f5f5;margin:16px 0"><strong>Admin Comment:</strong><br/>${comment}</div>` : ''}
        <p style="color:#888;font-size:13px;margin-top:24px">If you have any questions, please contact us at info@ypp.org.pk</p>
      </div>
    </div>
  `;
}
