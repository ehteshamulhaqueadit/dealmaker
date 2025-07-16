// mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, // Your email
    pass: process.env.EMAIL_APP_PASSWORD, // App password (not your regular password)
  },
});

const sendMail = async (to, subject, text, link) => {
  // Ensure the link includes the protocol for email clients to recognize it
  if (!link.startsWith("http://") && !link.startsWith("https://")) {
    link = "http://" + link; // Add http:// if missing
  }

  const mailOptions = {
    from: `"${process.env.APP_NAME}" <${process.env.EMAIL}>`,
    to,
    subject,
    text: `${text}\n\nIf the button doesn't work, please copy and paste this URL into your browser: ${link}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333;">Welcome to BFCR!</h2>
        <p>${text}</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${link}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Confirm Email
          </a>
        </p>
        <p style="font-size: 14px; color: #555;">
          If the button doesn't work, copy and paste this URL into your browser:<br />
          <a href="${link}" style="color: #007bff;">${link}</a>
        </p>
        <p>Thank you,<br/>The BFCR Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { status: true, message: "Email sent successfully", info };
  } catch (error) {
    return { status: false, message: "Failed to send email", error };
  }
};

export default sendMail;
