import { NextApiRequest, NextApiResponse } from 'next';
import Instructor from "@instructor-ai/instructor";
import OpenAI from "openai"
import { z } from "zod"
import { extractTextFromFile } from '@/utils/extract';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';

const oai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? undefined
});

const client = Instructor({
  client: oai,
  mode: "FUNCTIONS"
});

const ProductSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  price: z.number(),
});

const InvoiceSchema = z.object({
  customerName: z.string(),
  customerAddress: z.string().optional(),
  customerEmail: z.string().optional(),
  products: z.array(ProductSchema),
  totalAmount: z.number(),
});

async function extractInvoiceData(data: string): Promise<z.infer<typeof InvoiceSchema>> {
  const response = await client.chat.completions.create({
    messages: [{ role: "user", content: data }],
    model: "gpt-4",
    response_model: { name: "Invoice", schema: InvoiceSchema },
  });

  return response;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    let file = files.pdf as File | File[];
    if (Array.isArray(file)) {
      file = file[0];
    }
    if (!file || !file.filepath) {
      return res.status(400).json({ error: 'No PDF file uploaded or invalid file' });
    }

    try {
      const pdfText = await extractTextFromFile(file.filepath);
      const invoiceData = await extractInvoiceData(pdfText);

      res.status(200).json({ response: invoiceData });
    } catch (error) {
      console.error('Error in API handler:', error);
      res.status(500).json({ error: 'An error occurred while processing the request' });
    } finally {
      // Clean up the temporary file
      fs.unlink(file.filepath, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });
    }
  });
}