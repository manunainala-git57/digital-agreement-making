// controllers/agreementController.js
import Agreement from '../models/agreement.js';
import { sendInvitationEmails } from '../utils/sendEmail.js';
import { generateAgreementPdf } from '../utils/pdfGenerator.js';


export async function createAgreement(req, res) {
  try {
    console.log("🟡 Incoming request:", req.body);

    const { title, content, inviteeEmails } = req.body;

    const newAgreement = await Agreement.create({
      title,
      content,
      inviteeEmails,
      creator: req.user.id,
      status: inviteeEmails?.length ? 'pending' : 'fully-signed'
    });

    console.log("🟢 Agreement created:", newAgreement);

    await sendInvitationEmails(
      inviteeEmails,
      title,
      content,
      newAgreement._id
    );

    console.log("✅ All emails sent!");

    res.status(201).json({
      message: 'Agreement created and invites sent',
      agreement: newAgreement
    });
  } catch (err) {
    console.error("❌ Error in createAgreement:", err);
    res.status(400).json({ error: 'Failed to create agreement' });
  }
}

export async function getMyAgreements(req, res) {
  try {
    const agreements = await Agreement.find({ creator: req.user.id });
    res.json({ agreements });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching agreements' });
  }
}

export const signAgreement = async (req, res) => {
  const { id } = req.params;
  const { email, type, value } = req.body;

  if (!email || !type || !value) {
    return res.status(400).json({ error: 'Email, type, and value are required' });
  }

  const validTypes = ['typed', 'image', 'drawn'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid signature type' });
  }

  if (type === 'typed' && value.length < 2) {
    return res.status(400).json({ error: 'Typed name too short' });
  }

  if ((type === 'image' || type === 'drawn') && !value.startsWith('data:image')) {
    return res.status(400).json({ error: 'Signature must be a valid image (base64)' });
  }

  try {
    const agreement = await Agreement.findById(id);
    if (!agreement) return res.status(404).json({ error: 'Agreement not found' });

    const alreadySigned = agreement.signedBy.some(s => s.email === email);
    if (alreadySigned) return res.status(400).json({ error: 'Already signed' });

    const isAllowed =
      agreement.inviteeEmails.includes(email) ||
      (req.user && req.user.email === email);

    if (!isAllowed) {
      return res.status(403).json({ error: 'Unauthorized to sign' });
    }

    agreement.signedBy.push({ email, type, value, signedAt: new Date() });

    const allParties = [...agreement.inviteeEmails, req.user?.email].filter(Boolean);
    const signedEmails = [...new Set(agreement.signedBy.map(s => s.email))];

    if (allParties.length === 0) {
      agreement.status = 'pending';
    } else if (allParties.every(e => signedEmails.includes(e))) {
      agreement.status = 'fully-signed';
    } else {
      agreement.status = 'partially-signed';
    }

    await agreement.save();
    console.log("📩 Signing request body:", req.body);
    console.log("🆔 Agreement ID:", req.params.id);

    res.json({ message: 'Signed successfully', agreement });
  } catch (err) {
    console.error('❌ Error signing:', err);
    res.status(500).json({ error: 'Failed to sign' });
  }
};

export const removeSignature = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  try {
    const agreement = await Agreement.findById(id);
    if (!agreement) return res.status(404).json({ error: 'Agreement not found' });

    agreement.signedBy = agreement.signedBy.filter(sig => sig.email !== email);

    const allParties = [...agreement.inviteeEmails, agreement.creator?.email].filter(Boolean);
    const signedEmails = [...new Set(agreement.signedBy.map(s => s.email))];

    if (signedEmails.length === 0) {
      agreement.status = 'pending';
    } else if (allParties.every(e => signedEmails.includes(e))) {
      agreement.status = 'fully-signed';
    } else {
      agreement.status = 'partially-signed';
    }

    await agreement.save();
    res.json({ message: 'Signature removed successfully', agreement });
  } catch (err) {
    console.error('❌ Error removing signature:', err);
    res.status(500).json({ error: 'Failed to remove signature' });
  }
};


export const downloadAgreementPdf = async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id);
    if (!agreement) return res.status(404).json({ error: 'Agreement not found' });

    const pdfBytes = await generateAgreementPdf(agreement);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="agreement-${agreement._id}.pdf"`,
    });

    res.send(pdfBytes);
  } catch (err) {
    console.error('❌ PDF generation failed:', err);
    res.status(500).json({ error: 'Could not generate PDF' });
  }
};

export const searchByTitle = async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({ error: 'Title is required for search' });
    }

    const agreements = await Agreement.find({
      title: { $regex: title, $options: 'i' } // 'i' makes it case-insensitive
    });

    res.status(200).json(agreements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
