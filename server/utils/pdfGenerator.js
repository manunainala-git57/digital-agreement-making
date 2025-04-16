import { PDFDocument, rgb } from 'pdf-lib';

export const generateAgreementPdf = async (agreement) => {
  const { title, content, signedBy, _id } = agreement;

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Embed a standard font (Helvetica)
  const font = await pdfDoc.embedStandardFont('Helvetica'); // Correct way to use Helvetica

  // Set up margins and page size
  const page = pdfDoc.addPage([600, 800]); // Standard A4 size
  const { height } = page.getSize();
  const margin = 50; // Margin size from the edges
  const lineHeight = 15;
  let yPosition = height - margin;

  // Title: Add the Agreement title
  page.drawText(title, {
    x: margin,
    y: yPosition,
    font,
    size: 24,
    color: rgb(0, 0, 0),
  });
  yPosition -= lineHeight * 2; // Add some space after the title

  // Content: Add the content of the agreement
  page.drawText(content, {
    x: margin,
    y: yPosition,
    font,
    size: 12,
    color: rgb(0, 0, 0),
    maxWidth: 500,
  });
  yPosition -= lineHeight * 4; // Add space after content

  // Draw Signatures Section with better styling
  page.drawText('Signatures:', {
    x: margin,
    y: yPosition,
    font,
    size: 18,
    color: rgb(0, 0, 0),
  });
  yPosition -= lineHeight * 2;

  // Loop through each signature and display them
  signedBy.forEach(({ email, type, value }, index) => {
    page.drawText(`Email: ${email}`, {
      x: margin,
      y: yPosition,
      font,
      size: 12,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;

    page.drawText(`Type: ${type}`, {
      x: margin,
      y: yPosition,
      font,
      size: 12,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;

    page.drawText(`Signature: ${value}`, {
      x: margin,
      y: yPosition,
      font,
      size: 12,
      color: rgb(0, 0, 0),
      maxWidth: 500,
    });

    // Add a signature line (like an actual signature box)
    page.drawLine({
      start: { x: margin, y: yPosition - 5 },
      end: { x: 500, y: yPosition - 5 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    yPosition -= lineHeight * 3; // Space for the next signature
  });

  // Add the Agreement ID as a footer (optional)
  page.drawText(`Agreement ID: ${_id}`, {
    x: margin,
    y: 50,
    font,
    size: 10,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Add a watermark (e.g., "CONFIDENTIAL")
  page.drawText('CONFIDENTIAL', {
    x: 200,
    y: height / 2,
    font,
    size: 50,
    color: rgb(0.9, 0.9, 0.9),
    opacity: 0.3, // Make the watermark faint
  });

  // Password protect the PDF (optional)
  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

  return pdfBytes;
};
