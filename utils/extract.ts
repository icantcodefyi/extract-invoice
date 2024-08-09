import fs from 'fs';
import pdf from 'pdf-parse';
import Tesseract from 'tesseract.js';

export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(filePath);
  } else if (mimeType.startsWith('image/')) {
    return extractTextFromImage(filePath);
  } else {
    throw new Error('Unsupported file type');
  }
}

async function extractTextFromPDF(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, buffer) => {
      if (err) {
        reject(new Error(`Error reading file: ${err.message}`));
        return;
      }

      pdf(buffer).then((data: { text: string }) => {
        resolve(data.text);
      }).catch((error: { message: any }) => {
        reject(new Error(`Error parsing PDF: ${error.message}`));
      });
    });
  });
}

async function extractTextFromImage(filePath: string): Promise<string> {
  const { data: { text } } = await Tesseract.recognize(filePath);
  return text;
}