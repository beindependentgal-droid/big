export interface EmailPayload {
  subject: string;
  text: string;
  html: string;
}

export function buildOtpEmailPayload(code: string, actionName = 'Sensitive Action'): EmailPayload {
  const subject = '🔐 One-Time Security Authorization Passcode';
  const text = `Your one-time authorization code for the action "${actionName}" is: ${code}. Please enter this code in the BIG platform to authorize your request. This code will expire in 5 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #be185d; margin-top: 0;">🔐 One-Time Passcode</h2>
      <p>Your security authorization code for <strong>${actionName}</strong> is:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; padding: 12px; background: #f1f5f9; text-align: center; border-radius: 8px; margin: 16px 0; color: #0f172a;">${code}</div>
      <p style="font-size: 12px; color: #64748b;">This code expires in 5 minutes. Do not share it with anyone.</p>
    </div>
  `;

  return { subject, text, html };
}

export function buildWelcomeEmailPayload(name: string): EmailPayload {
  const subject = '🌸 Welcome to Be Independent Gal';
  const text = `Hi ${name},\n\nWelcome to the BIG global sisterhood! Your account has been created successfully. You now have access to community feeds, BIG Academy resources, mentorship circles, and more.\n\nWarmly,\nThe BIG Foundation Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="background-color: #be185d; padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px;">Welcome to the Sisterhood! 🌸</h1>
        <p style="margin: 8px 0 0; font-size: 13px;">Be Independent Gal (BIG) Platform</p>
      </div>
      <div style="padding: 24px 8px; font-size: 14px; color: #334155; line-height: 1.6;">
        <p>Hi ${name},</p>
        <p>Welcome to the BIG global platform connecting African female entrepreneurs, tech builders, and community leaders.</p>
        <p>Your account is ready. You now have access to BIG Academy resources, mentorship circles, funding campaigns, and community feeds.</p>
        <p>Warmly,<br><strong>The BIG Foundation Team</strong></p>
      </div>
    </div>
  `;

  return { subject, text, html };
}

export function buildPasswordResetEmailPayload(code: string): EmailPayload {
  const subject = '🔐 Password Reset Code';
  const text = `Your password reset code is ${code}. Enter it in the BIG platform to continue. This code expires in 5 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #be185d; margin-top: 0;">🔐 Password Reset</h2>
      <p>Your password reset code is:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; padding: 12px; background: #f1f5f9; text-align: center; border-radius: 8px; margin: 16px 0; color: #0f172a;">${code}</div>
      <p style="font-size: 12px; color: #64748b;">This code expires in 5 minutes. If you did not request it, you can ignore this email.</p>
    </div>
  `;

  return { subject, text, html };
}
