import fs from 'fs';
import pdf from 'pdf-parse';
import Tesseract from 'tesseract.js';

export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, buffer) => {
        if (err) {
          reject(new Error(`Error reading file: ${err.message}`));
          return;
        }

        pdf(buffer).then((data: { text: string | PromiseLike<string>; }) => {
          resolve(data.text);
        }).catch((error: { message: any; }) => {
          reject(new Error(`Error parsing PDF: ${error.message}`));
        });
      });
    });
  } else if (mimeType.startsWith('image/')) {
    return Tesseract.recognize(
      filePath,
      'eng',
    ).then(({ data: { text } }) => {
      console.log(text);
      return text;
    });
  } else {
    throw new Error('Unsupported file type');
  }
}