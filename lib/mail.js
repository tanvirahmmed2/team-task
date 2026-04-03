export async function sendEmail({ to, subject, htmlContent }) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "noreply@teamtask.com";
  const SENDER_NAME = process.env.BREVO_SENDER_NAME || "Team Task";

  if (!BREVO_API_KEY) {
    console.warn("BREVO_API_KEY is not defined. Email skipping ->", to, subject);
    return;
  }

  const endpoint = "https://api.brevo.com/v3/smtp/email";

  const payload = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: to }],
    subject: subject,
    htmlContent: htmlContent
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
        "accept": "application/json",
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error("Brevo Email Error:", errData);
    } else {
      console.log(`Email sent successfully to ${to}`);
    }
  } catch (error) {
    console.error("Failed to send email via Brevo API:", error);
  }
}

export async function sendWelcomeEmail(toEmail, toName, plainPassword, loginUrl) {
  const subject = "Welcome to Team Task! Here are your credentials";
  const html = `
    <h2>Welcome aboard, ${toName}!</h2>
    <p>Your account has been created successfully.</p>
    <p>You can log in at: <a href="${loginUrl}">${loginUrl}</a></p>
    <br/>
    <p><strong>Your Temporary Password:</strong> ${plainPassword}</p>
    <br/>
    <p>We recommend changing this password after your first login.</p>
  `;
  await sendEmail({ to: toEmail, subject, htmlContent: html });
}

export async function sendPasswordResetEmail(toEmail, resetUrl) {
  const subject = "Reset Your Password - Team Task";
  const html = `
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password for your Team Task account.</p>
    <p>Click the link below to securely reset your password:</p>
    <br/>
    <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <br/><br/>
    <p>If you did not request this, you can safely ignore this email.</p>
    <p>This link will expire in 1 hour.</p>
  `;
  await sendEmail({ to: toEmail, subject, htmlContent: html });
}
