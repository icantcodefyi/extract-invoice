import fs from 'fs';
import pdf from 'pdf-parse';

export async function extractTextFromFile(filePath: string): Promise<string> {
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
}