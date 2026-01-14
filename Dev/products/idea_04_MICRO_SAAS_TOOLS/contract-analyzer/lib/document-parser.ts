import mammoth from 'mammoth';
const pdf = require('pdf-parse');

export type ParsedDocument = {
  text: string;
  metadata?: any;
};

export async function parseDocument(file: File): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileType = file.type;

  if (fileType === 'application/pdf') {
    return await parsePdf(buffer);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  ) {
    return await parseDocx(buffer);
  } else if (fileType === 'text/plain') {
    return parseTxt(buffer);
  } else {
    throw new Error('Unsupported file type');
  }
}

async function parsePdf(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const data = await pdf(buffer);
    return {
      text: cleanText(data.text),
      metadata: data.info,
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF document');
  }
}

async function parseDocx(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: cleanText(result.value),
      metadata: result.messages,
    };
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse Word document');
  }
}

function parseTxt(buffer: Buffer): ParsedDocument {
  return {
    text: cleanText(buffer.toString('utf-8')),
  };
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}
