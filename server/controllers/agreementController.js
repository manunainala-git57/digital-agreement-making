
// controllers/agreementController.js
import Agreement from '../models/agreement.js';
import { sendInvitationEmails } from '../utils/sendEmail.js';
import { generateAgreementPdf } from '../utils/pdfGenerator.js';

// Only allows 'typed' and 'image' signatures now

export async function createAgreement(req, res) {
  try {
    const { title, content, inviteeEmails, signature } = req.body;

    const newAgreement = await Agreement.create({
      title,
      content,
      inviteeEmails,
      creator: req.user.id,
      creatorEmail: req.user.email,
      signedBy: [signature],
      status: inviteeEmails?.length ? 'pending' : 'fully-signed',
    });

    // Send invitation emails
    if (inviteeEmails && inviteeEmails.length > 0) {
      await sendInvitationEmails(inviteeEmails, newAgreement);
    }

    res.status(201).json({
      message: 'Agreement created.',
      agreement: newAgreement,
    });
  } catch (err) {
    console.error('❌ Error in createAgreement:', err);
    res.status(400).json({ error: 'Failed to create agreement' });
  }
}

export const signAgreement = async (req, res) => {
  const { id } = req.params;
  const { email, type, value } = req.body;

  if (!email || !type || !value) {
    return res.status(400).json({ error: 'Email, type, and value are required' });
  }

  const validTypes = ['typed', 'image']; // Removed 'drawn'
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid signature type' });
  }

  try {
    const agreement = await Agreement.findById(id);
    if (!agreement) return res.status(404).json({ error: 'Agreement not found' });

    const alreadySigned = agreement.signedBy.some((s) => s.email === email);
    if (alreadySigned) return res.status(400).json({ error: 'Already signed' });

    const isAllowed =
      agreement.inviteeEmails.includes(email) || (req.user && req.user.email === email);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Unauthorized to sign' });
    }

    const signature = { email, type, value, signedAt: new Date() };
    agreement.signedBy.push(signature);

    const allParties = [...agreement.inviteeEmails, req.user?.email].filter(Boolean);
    const signedEmails = [...new Set(agreement.signedBy.map((s) => s.email))];

    if (allParties.length === 0) {
      agreement.status = 'pending';
    } else if (allParties.every((e) => signedEmails.includes(e))) {
      agreement.status = 'fully-signed';
    } else {
      agreement.status = 'partially-signed';
    }

    await agreement.save();

    // Generate updated PDF with sender/recipient signatures
    const senderSignature = agreement.signedBy.find((s) => s.email === agreement.creatorEmail);
    const recipientSignature = agreement.signedBy.find((s) => s.email !== agreement.creatorEmail);

    const pdfBytes = await generateAgreementPdf(agreement, senderSignature, recipientSignature);

    res.json({
      message: 'Signed successfully',
      agreement,
      previewPdf: pdfBytes.toString('base64'),
    });
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

    agreement.signedBy = agreement.signedBy.filter((sig) => sig.email !== email);

    const allParties = [...agreement.inviteeEmails, agreement.creator?.email].filter(Boolean);
    const signedEmails = [...new Set(agreement.signedBy.map((s) => s.email))];

    if (signedEmails.length === 0) {
      agreement.status = 'pending';
    } else if (allParties.every((e) => signedEmails.includes(e))) {
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

// export async function createAgreement(req, res) {
//   try {
//     const { title, content, inviteeEmails , signature } = req.body;

//     const newAgreement = await Agreement.create({
//       title,
//       content,
//       inviteeEmails,
//       creator: req.user.id,
//       creatorEmail: req.user.email,
//       signedBy: [signature],
//       status: inviteeEmails?.length ? 'pending' : 'fully-signed'
//     });

//     // Send invitation emails
//     if (inviteeEmails && inviteeEmails.length > 0) {
//       await sendInvitationEmails(inviteeEmails, newAgreement);
//     }

//     res.status(201).json({
//       message: 'Agreement created.',
//       agreement: newAgreement
//     });
//   } catch (err) {
//     console.error("❌ Error in createAgreement:", err);
//     res.status(400).json({ error: 'Failed to create agreement' });
//   }
// }


// export const signAgreement = async (req, res) => {
//   const { id } = req.params;
//   const { email, type, value } = req.body;

//   if (!email || !type || !value) {
//     return res.status(400).json({ error: 'Email, type, and value are required' });
//   }

//   const validTypes = ['typed', 'image', 'drawn'];
//   if (!validTypes.includes(type)) {
//     return res.status(400).json({ error: 'Invalid signature type' });
//   }

//   try {
//     const agreement = await Agreement.findById(id);
//     if (!agreement) return res.status(404).json({ error: 'Agreement not found' });

//     const alreadySigned = agreement.signedBy.some(s => s.email === email);
//     if (alreadySigned) return res.status(400).json({ error: 'Already signed' });

//     const isAllowed =
//       agreement.inviteeEmails.includes(email) || (req.user && req.user.email === email);
//     if (!isAllowed) {
//       return res.status(403).json({ error: 'Unauthorized to sign' });
//     }

//     const signature = { email, type, value, signedAt: new Date() };
//     agreement.signedBy.push(signature);

//     const allParties = [...agreement.inviteeEmails, req.user?.email].filter(Boolean);
//     const signedEmails = [...new Set(agreement.signedBy.map(s => s.email))];

//     if (allParties.length === 0) {
//       agreement.status = 'pending';
//     } else if (allParties.every(e => signedEmails.includes(e))) {
//       agreement.status = 'fully-signed';
//     } else {
//       agreement.status = 'partially-signed';
//     }

//     await agreement.save();

//     // Generate updated PDF with sender/recipient signatures
//     const senderSignature = agreement.signedBy.find(s => s.email === agreement.creatorEmail);
//     const recipientSignature = agreement.signedBy.find(s => s.email !== agreement.creatorEmail);

//     const pdfBytes = await generateAgreementPdf(agreement, senderSignature, recipientSignature);

//     // Optional: Save PDF to file system or cloud (e.g., S3, Firebase)

//     res.json({
//       message: 'Signed successfully',
//       agreement,
//       previewPdf: pdfBytes.toString('base64') // return as base64 for frontend rendering
//     });
//   } catch (err) {
//     console.error('❌ Error signing:', err);
//     res.status(500).json({ error: 'Failed to sign' });
//   }
// };


// export const removeSignature = async (req, res) => {
//   const { id } = req.params;
//   const { email } = req.body;

//   try {
//     const agreement = await Agreement.findById(id);
//     if (!agreement) return res.status(404).json({ error: 'Agreement not found' });

//     agreement.signedBy = agreement.signedBy.filter(sig => sig.email !== email);

//     const allParties = [...agreement.inviteeEmails, agreement.creator?.email].filter(Boolean);
//     const signedEmails = [...new Set(agreement.signedBy.map(s => s.email))];

//     if (signedEmails.length === 0) {
//       agreement.status = 'pending';
//     } else if (allParties.every(e => signedEmails.includes(e))) {
//       agreement.status = 'fully-signed';
//     } else {
//       agreement.status = 'partially-signed';
//     }

//     await agreement.save();
//     res.json({ message: 'Signature removed successfully', agreement });
//   } catch (err) {
//     console.error('❌ Error removing signature:', err);
//     res.status(500).json({ error: 'Failed to remove signature' });
//   }
// };

export async function getMyAgreements(req, res) {
  try {
    const agreements = await Agreement.find({ creator: req.user.id })
      .sort({ createdAt: -1 }); // Sorting by createdAt, latest first

    res.json({
      agreements,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching agreements' });
  }
}

export const downloadAgreementPdf = async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id).populate('creator'); // <- now we have agreement.creator

    if (!agreement) return res.status(404).json({ error: 'Agreement not found' });

    // sender's and recipient's signatures (optional)
    const senderSignature = agreement.signedBy?.find(s => s.email === agreement.creatorEmail);
    const recipientSignature = agreement.signedBy?.find(s => s.email !== agreement.creatorEmail);

    console.log('Sender Signature from DB', senderSignature);

    // Generate PDF
    const pdfBytes = await generateAgreementPdf(agreement, senderSignature, recipientSignature);

    res.set({ 
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="agreement-${agreement._id}.pdf"`
    });

    res.send(pdfBytes);
  } catch (err) {
    console.error('❌ PDF generation failed!', err);
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

export const getPendingAgreementsToSign = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const agreements = await Agreement.find({
      inviteeEmails: userEmail, // user is an invitee
      'signedBy.email': { $ne: userEmail } // and hasn't signed yet
    }).populate('creator', 'email').sort({ createdAt: -1 }); // in order to get the sender email in the UI (most recent appears first)

    res.status(200).json(agreements);
  } catch (err) {
    console.error('❌ Error fetching agreements to sign:', err);
    res.status(500).json({ error: 'Failed to fetch agreements' });
  }
};

export const getAllAgreementsForUser = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const agreements = await Agreement.find({ 
      status: 'fully-signed',
      inviteeEmails: userEmail, // the person was invited to sign
      signedBy: { $elemMatch: { email: userEmail } },
      creatorEmail: { $ne: userEmail } // the sender is NOT the current user
    }).populate('creator', 'email').sort({ createdAt: -1 });

    res.status(200).json(agreements);
  } catch (err) {
    console.error('Error fetching agreements for user!', err);
    res.status(500).json({ error: 'Failed to fetch agreements' });
  }
};



