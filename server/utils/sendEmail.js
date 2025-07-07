// utils/sendEmail.js
import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

dotenv.config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendInvitationEmails = async (inviteeEmails, agreement) => {
  const { title, content, _id } = agreement;

  for (const to of inviteeEmails) {
    const email = {
      to: [{ email: to }],
      sender: {
        email: process.env.FROM_EMAIL,
        name: 'Agreema'
      },
      subject: `You're invited to sign: ${title}`,
      htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 16px; color: #333;">
            <p style="font-size: 16px; font-weight: bold; color: #222;">
              Hello <span style="color: #000;"><strong>${to}</strong></span>,
            </p>
            <p style="font-size: 15px;">You are invited to sign an agreement titled:</p>
            <h2 style="color: #005bbb; font-size: 20px;">${title}</h2>
            <p style="font-size: 15px;">${content}</p>

            <div style="margin: 24px 0;">
              <a href="https://agreema.vercel.app"
                style="display: inline-block; padding: 12px 20px; background-color: #007bff; color: #fff;
                        text-decoration: none; font-weight: bold; border-radius: 5px; font-size: 16px;">
                Click to View and Sign
              </a>
            </div>

            <p style="font-size: 13px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="font-size: 12px; color: #666;">https://agreema.vercel.app</p>
          </div>
        `

    };

    try {
      await apiInstance.sendTransacEmail(email);
      console.log(`✅ Email sent to ${to}`);
    } catch (err) {
      console.error(`❌ Failed to send email to ${to}:`, err?.response?.body || err.message);
    }
  }
};
