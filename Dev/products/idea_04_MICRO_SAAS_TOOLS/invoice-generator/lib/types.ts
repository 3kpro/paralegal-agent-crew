export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export type TemplateId = 'standard' | 'corporate' | 'modern' | 'minimal' | 'bold';

export interface InvoiceData {
  invoiceNumber: string;
  dateIssued: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  taxRate: number;
  logo?: string; // base64 or url
  accentColor?: string; // hex
  templateId?: TemplateId;
}
