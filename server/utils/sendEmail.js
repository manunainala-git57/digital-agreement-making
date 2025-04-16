
// utils/sendEmail.js
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendInvitationEmails = async (inviteeEmails, title, content, agreementId) => {
  // Loop through each email and send the invitation
  for (const to of inviteeEmails) {
    const msg = {
      to, // Recipient's email
      from: process.env.FROM_EMAIL, // Your sender email (e.g., noreply@yourapp.com)
      templateId: process.env.SENDGRID_TEMPLATE_ID, // Use your SendGrid dynamic template ID here
      dynamic_template_data: {
        email: to,
        title: title,
        content: content,
        link: `http://localhost:3000/agreements/${agreementId}`, // Replace with your actual frontend link
      }
    };

    try {
      // Send the email using SendGrid
      await sgMail.send(msg);
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      // Optional: Add error handling (e.g., add to failed list)
    }
  }
};
