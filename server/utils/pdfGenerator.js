import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Buffer } from 'buffer';

// Ensure Buffer is available in case the environment doesn't provide it globally (like Render)
if (typeof global !== 'undefined' && !global.Buffer) {
  global.Buffer = Buffer;
}

// Utility to safely embed a signature image
const embedSignatureImage = async (pdfDoc, base64String) => {
  if (!base64String || typeof base64String !== 'string') {
    throw new Error('Invalid signature image');
  }

  const base64 = base64String.split(',')[1];
  if (!base64) throw new Error('Base64 data missing in signature');

  if (base64String.startsWith('data:image/png')) {
    return await pdfDoc.embedPng(Buffer.from(base64, 'base64'));
  } else if (base64String.startsWith('data:image/jpeg')) {
    return await pdfDoc.embedJpg(Buffer.from(base64, 'base64'));
  } else {
    throw new Error('Unsupported image format for signature');
  }
};

export const generateAgreementPdf = async (agreement, senderSignature, recipientSignature) => {
  try {
    if (!senderSignature || !recipientSignature) {
      throw new Error('Both sender and recipient signatures are required to generate the PDF');
    }

    const { title, content, _id, creator } = agreement;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { height, width } = page.getSize();

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const margin = 50;
    let y = height - margin;

    // Title
    const titleWidth = boldFont.widthOfTextAtSize(title, 24);
    page.drawText(title, {
      x: (width - titleWidth) / 2,
      y,
      font: boldFont,
      size: 24,
      color: rgb(0, 0, 0),
    });

    y -= 60;

    // Section Heading
    page.drawText('Agreement Objective', {
      x: margin,
      y,
      font: boldFont,
      size: 18,
      color: rgb(0, 0, 0),
    });

    y -= 30;

    // Content
    const safeContent = content || 'No content available';
    const wrappedContent = safeContent.match(/.{1,80}(\s|$)/g) || [];

    for (const line of wrappedContent) {
      page.drawText(line.trim(), {
        x: margin,
        y,
        font: normalFont,
        size: 14,
        color: rgb(0, 0, 0),
      });
      y -= 20;
    }

    const sigBaseY = 150;

    // Created By
    page.drawText('Created By', {
      x: margin,
      y: sigBaseY,
      font: boldFont,
      size: 16,
      color: rgb(0, 0, 0),
    });

    if (senderSignature.type === 'typed') {
      page.drawText(senderSignature.value, {
        x: margin,
        y: sigBaseY - 25,
        font: normalFont,
        size: 14,
      });
    } else if (senderSignature.type === 'image') {
      const img = await embedSignatureImage(pdfDoc, senderSignature.value);
      page.drawImage(img, {
        x: margin,
        y: sigBaseY - 60,
        width: 100,
        height: 50,
      });
    } else {
      page.drawText(creator?.fullName || agreement.creatorEmail, {
        x: margin,
        y: sigBaseY - 25,
        font: normalFont,
        size: 14,
      });
    }

    // Accepted By
    page.drawText('Accepted By', {
      x: width - margin - 100,
      y: sigBaseY,
      font: boldFont,
      size: 16,
      color: rgb(0, 0, 0),
    });

    if (recipientSignature.type === 'typed') {
      page.drawText(recipientSignature.value, {
        x: width - margin - 100,
        y: sigBaseY - 25,
        font: normalFont,
        size: 14,
      });
    } else if (recipientSignature.type === 'image') {
      const img = await embedSignatureImage(pdfDoc, recipientSignature.value);
      page.drawImage(img, {
        x: width - margin - 100,
        y: sigBaseY - 60,
        width: 100,
        height: 50,
      });
    }

    // Footer
    page.drawText(`Agreement ID: ${_id}`, {
      x: margin,
      y: 40,
      font: normalFont,
      size: 10,
      color: rgb(0.5, 0.5, 0.5),
    });

    return await pdfDoc.save();
  } catch (err) {
    console.error('PDF Generation Failed:', err);
    throw new Error('PDF generation failed');
  }
};

// import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
// import { Buffer } from 'buffer';

// export const generateAgreementPdf = async (agreement, senderSignature, recipientSignature) => {
//   try{
//         const { title, content, _id, creator } = agreement;

//         const pdfDoc = await PDFDocument.create();
//         const page = pdfDoc.addPage([600, 800]);
//         const { height, width } = page.getSize();

//         const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//         const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

//         const margin = 50;
//         let y = height - margin;

//         // Title
//         const titleWidth = boldFont.widthOfTextAtSize(title, 24);
//         page.drawText(title, {
//           x: (width - titleWidth) / 2,
//           y,
//           font: boldFont,
//           size: 24,
//           color: rgb(0, 0, 0),
//         });

//         y -= 60;

//         // Agreement Objective
//         page.drawText('Agreement Objective', {
//           x: margin,
//           y,
//           font: boldFont,
//           size: 18,
//           color: rgb(0, 0, 0),
//         });

//         y -= 30;

//         // Wrap and render content
//         const wrappedContent = content?.match(/.{1,80}(\s|$)/g) || [content];
//         for (const line of wrappedContent) {
//           page.drawText(line.trim(), {
//             x: margin,
//             y,
//             font: normalFont,
//             size: 14,
//             color: rgb(0, 0, 0),
//           });
//           y -= 20;
//         }

//         // Fixed Y for signatures
//         const sigBaseY = 150;

//         // === Created By (left) ===
//         page.drawText('Created By', {
//           x: margin,
//           y: sigBaseY,
//           font: boldFont,
//           size: 16,
//           color: rgb(0, 0, 0),
//         });

//         if (senderSignature?.type === 'typed') {
//           page.drawText(senderSignature.value, {
//             x: margin,
//             y: sigBaseY - 25,
//             font: normalFont,
//             size: 14,
//           });
//         } else if (senderSignature?.type === 'image') {
//           const base64 = senderSignature.value.split(',')[1];

//           let img;
//           if (senderSignature.value.startsWith('data:image/png')) {
//             img = await pdfDoc.embedPng(Buffer.from(base64, 'base64'));
//           } else if (senderSignature.value.startsWith('data:image/jpeg')) {
//             img = await pdfDoc.embedJpg(Buffer.from(base64, 'base64'));
//           } else {
//             throw new Error('Unsupported image format for sender signature');
//           }

//           page.drawImage(img, {
//             x: margin,
//             y: sigBaseY - 60, // push image further down
//             width: 100,
//             height: 50,
//           });
//         } else {
//           page.drawText(creator?.fullName || agreement.creatorEmail, {
//             x: margin,
//             y: sigBaseY - 25,
//             font: normalFont,
//             size: 14,
//           });
//         }

//         // === Accepted By (right) ===
//         page.drawText('Accepted By', {
//           x: width - margin - 100,
//           y: sigBaseY,
//           font: boldFont,
//           size: 16,
//           color: rgb(0, 0, 0),
//         });

//         if (recipientSignature?.type === 'typed') {
//           page.drawText(recipientSignature.value, {
//             x: width - margin - 100,
//             y: sigBaseY - 25,
//             font: normalFont,
//             size: 14,
//           });
//         } else if (recipientSignature?.type === 'image') {
//           const base64 = recipientSignature.value.split(',')[1];

//           let img;
//           if (recipientSignature.value.startsWith('data:image/png')) {
//             img = await pdfDoc.embedPng(Buffer.from(base64, 'base64'));
//           } else if (recipientSignature.value.startsWith('data:image/jpeg')) {
//             img = await pdfDoc.embedJpg(Buffer.from(base64, 'base64'));
//           } else {
//             throw new Error('Unsupported image format for recipient signature');
//           }

//           page.drawImage(img, {
//             x: width - margin - 100,
//             y: sigBaseY - 60, // push image below the heading
//             width: 100,
//             height: 50,
//           });
//         }

//         // === Footer ===
//         page.drawText(`Agreement ID: ${_id}`, {
//           x: margin,
//           y: 40,
//           font: normalFont,
//           size: 10,
//           color: rgb(0.5, 0.5, 0.5),
//         });

//         return await pdfDoc.save();
//       }

//   catch (err) {
//       console.error('PDF Generation Failed:', err);
//       throw new Error('PDF generation failed');
//     }

// };






