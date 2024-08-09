export interface Product {
    name: string;
    quantity: number;
    price: number;
}

export interface InvoiceData {
    customerName: string;
    customerAddress?: string;
    customerEmail?: string;
    products: Product[];
    totalAmount: number;
    currency: string;
}