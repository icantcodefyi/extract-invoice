import fs from 'fs';
import pdf from 'pdf-parse';
import { createWorker } from "tesseract.js";
import path from 'path';

export async function extractTextFromFile(
  filePath: string, 
  mimeType: string, 
  setStatus: (status: string) => void = () => {}
): Promise<string> {
  // Vercel function hack
  const vercelFunctionHack = path.resolve('./public', '');

  setStatus('Starting text extraction...');

  if (mimeType === 'application/pdf') {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, async (err, buffer) => {
        if (err) {
          reject(new Error(`Error reading file: ${err.message}`));
          return;
        }

        try {
          setStatus('Parsing PDF...');
          const data = await pdf(buffer);
          setStatus('PDF parsed successfully');
          resolve(data.text);
        } catch (error: any) {
          reject(new Error(`Error parsing PDF: ${error.message}`));
        }
      });
    });
  } else if (mimeType.startsWith('image/')) {
    try {
      setStatus('Initializing OCR...');
      const worker = await createWorker('eng');
      setStatus('Performing OCR...');
      const { data: { text } } = await worker.recognize(filePath);
      await worker.terminate();
      setStatus('OCR completed successfully');
      return text;
    } catch (error: any) {
      throw new Error(`Error performing OCR: ${error.message}`);
    }
  } else {
    throw new Error('Unsupported file type');
  }
}