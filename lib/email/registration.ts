/**
 * Admin notification emails
 * Uses Resend (free tier) to alert admins of pending registrations.
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'Fermidas <reports@fermidas.com>';

const ADMIN_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, '') ||
  'https://www.fermidas.com';

/**
 * Notify an admin that a new registration is awaiting approval.
 * Fire-and-forget: callers should not block user-facing responses on this.
 */
export async function sendRegistrationPendingNotification(
  to: string,
  user: { name?: string | null; email: string },
) {
  const userName = user.name || 'No name provided';
  const adminUrl = `${ADMIN_URL}/digital/admin/system`;

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
          line-height: 1.6;
          color: #111213;
          background: #f7faf9;
          padding: 2rem 1rem;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          padding: 2rem;
          border-radius: 0.5rem;
        }
        .header {
          border-bottom: 3px solid #749694;
          padding-bottom: 1rem;
          margin-bottom: 2rem;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: #141a1b;
        }
        .title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #141a1b;
          margin-bottom: 1rem;
        }
        .detail {
          background: #edf3f3;
          border-radius: 0.5rem;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          color: #354848;
        }
        .detail strong {
          color: #141a1b;
        }
        .footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 2px solid #dce7e6;
          text-align: center;
          color: #5f7b7b;
          font-size: 0.875rem;
        }
        .action-btn {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: #749694;
          color: #ffffff;
          text-decoration: none;
          border-radius: 0.5rem;
          font-weight: 600;
        }
        .action-btn:hover {
          background: #5f7b7b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Fermidas</div>
        </div>
        <div class="title">New registration awaiting approval</div>
        <p style="color: #354848;">
          A new account has been created and is waiting for your review before
          the user can sign in.
        </p>
        <div class="detail">
          <strong>Name:</strong> ${escapeHtml(userName)}<br />
          <strong>Email:</strong> ${escapeHtml(user.email)}<br />
          <strong>Status:</strong> Pending approval
        </div>
        <div style="text-align: center;">
          <a href="${adminUrl}" class="action-btn">Review in System Admin</a>
        </div>
        <div class="footer">
          <p>Fermidas Digital</p>
          <p>
            You are receiving this because your email is set as the
            registration notification contact in System Admin.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: FROM,
    to: to.split(',').map((email) => email.trim()).filter(Boolean),
    subject: 'New signup awaiting approval — Fermidas',
    html: emailHtml,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
