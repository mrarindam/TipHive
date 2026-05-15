/**
 * Stylish HTML Email Templates for SuperPay
 */

const BASE_STYLE = `
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #ffffff;
  background-color: #0a0a0a;
  margin: 0;
  padding: 0;
`;

const CONTAINER_STYLE = `
  max-width: 600px;
  margin: 20px auto;
  background: #111111;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
`;

const HEADER_STYLE = `
  padding: 40px 20px;
  text-align: center;
  background: linear-gradient(135deg, #222222 0%, #111111 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const CONTENT_STYLE = `
  padding: 40px;
`;

const FOOTER_STYLE = `
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: #666666;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const BUTTON_STYLE = `
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 20px;
`;

const wrapTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  </style>
</head>
<body style="${BASE_STYLE}">
  <div style="${CONTAINER_STYLE}">
    <div style="${HEADER_STYLE}">
      <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.5px; color: #ffffff;">TipHive</h1>
    </div>
    <div style="${CONTENT_STYLE}">
      ${content}
    </div>
    <div style="${FOOTER_STYLE}">
      <p>&copy; 2026 TipHive. Built on Mezo Network.</p>
      <p>If you didn't expect this email, please ignore it.</p>
    </div>
  </div>
</body>
</html>
`;

export const welcomeTemplate = (username: string) => wrapTemplate(`
  <h2 style="margin-top: 0; color: #ffffff;">Welcome to the hive, ${username}! 🚀</h2>
  <p>We're thrilled to have you join TipHive. Your Web3 creator journey starts now.</p>
  <p>With TipHive, you can:</p>
  <ul style="padding-left: 20px; color: #aaaaaa;">
    <li>Create exclusive content for your community.</li>
    <li>Receive tips and subscriptions in crypto.</li>
    <li>Grow your influence on the Mezo Network.</li>
  </ul>
  <a href="https://tiphive.xyz/dashboard" style="${BUTTON_STYLE}">Go to Dashboard</a>
`);

export const notificationTemplate = (content: string, actionUrl?: string) => wrapTemplate(`
  <h2 style="margin-top: 0; color: #ffffff;">New Notification</h2>
  <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
    <p style="margin: 0; font-size: 16px;">${content}</p>
  </div>
  ${actionUrl ? `<a href="${actionUrl}" style="${BUTTON_STYLE}">View Details</a>` : ''}
`);

export const emailUpdateTemplate = () => wrapTemplate(`
  <h2 style="margin-top: 0; color: #ffffff;">Email Updated Successfully ✅</h2>
  <p>Your notification email has been successfully updated. From now on, you'll receive alerts and updates at this address.</p>
  <p>If you didn't make this change, please contact support immediately.</p>
  <a href="https://tiphive.xyz/dashboard/email-notifications" style="${BUTTON_STYLE}">Check Settings</a>
`);
