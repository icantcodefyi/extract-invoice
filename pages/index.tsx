"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { InvoiceData } from '@/utils/types';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
  maxDuration: 30,
};

const InvoiceUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please select a PDF file');
      event.target.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first!');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('/api/invoice-extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setInvoiceData(data.response);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex justify-center items-center'>
      {!invoiceData && (
        <Card className="w-[350px] m-2 bg-inherit border-zinc-700">
          <CardHeader>
            <CardTitle>Invoice Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="pdf">Upload PDF</Label>
                <Input id="pdf" type="file" accept=".pdf" onChange={handleFileChange} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleUpload} disabled={!file || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Process Invoice
            </Button>
          </CardFooter>
        </Card>
      )}
      {invoiceData && <InvoiceCard invoiceData={invoiceData} />}
    </div>
  );
};

const InvoiceCard = ({ invoiceData }: { invoiceData: InvoiceData }) => {
  return (
    <Card className="w-[600px] m-2 bg-inherit border-zinc-700">
      <CardHeader>
        <CardTitle>Invoice Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Customer Information</h3>
            <p>Name: {invoiceData.customerName}</p>
            {invoiceData.customerAddress && <p>Address: {invoiceData.customerAddress}</p>}
            {invoiceData.customerEmail && <p>Email: {invoiceData.customerEmail}</p>}
          </div>
          <div>
            <h3 className="font-semibold">Products</h3>
            <ul className="list-disc list-inside">
              {invoiceData.products.map((product, index) => (
                <li key={index}>
                  {product.name} - Quantity: {product.quantity}, Price: ${product.price.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Total Amount</h3>
            <p>${invoiceData.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceUpload;