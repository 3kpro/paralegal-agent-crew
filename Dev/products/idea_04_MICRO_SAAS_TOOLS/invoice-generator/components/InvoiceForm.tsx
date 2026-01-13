"use client";

import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { Plus, Trash2, Save, Download, Send, RefreshCw, Loader2, Upload, Layout, X, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import InvoicePreview from "@/components/InvoicePreview";
import { InvoiceItem, TemplateId } from "@/lib/types";
import { createClient } from "@/lib/supabase";

export default function InvoiceForm() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailMessage, setEmailMessage] = useState("Please find attached your invoice.");
  const [emailSubject, setEmailSubject] = useState("Invoice from Your Business");

  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "Web Development Services", quantity: 1, price: 1000 },
  ]);
  const [taxRate, setTaxRate] = useState(0);
  
  // Branding State
  const [logo, setLogo] = useState<string>("");
  const [accentColor, setAccentColor] = useState("#2563eb");
  const [templateId, setTemplateId] = useState<TemplateId>("standard");

  const [pdfUrl, setPdfUrl] = useState<string>("");

  // Auto-generate invoice number
  const generateInvoiceNumber = () => {
    const random = Math.floor(Math.random() * 9000) + 1000;
    setInvoiceNumber(`INV-${random}`);
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  // Live PDF Preview Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      generatePreviewPdf();
    }, 1000); // Debounce to allow typing

    return () => clearTimeout(timer);
  }, [invoiceNumber, clientName, clientEmail, clientAddress, items, taxRate, logo, accentColor, templateId]);

  const generatePreviewPdf = async () => {
    if (!previewRef.current) return;
    
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 816,
        height: 1056,
        ignoreElements: (element) => {
          // Skip elements that might be injected by extensions or lack standard methods
          return !element || typeof element.getAttribute !== 'function';
        },
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('pdf-preview');
          if (el) {
            el.style.position = 'static';
            el.style.left = '0';
            el.style.top = '0';
          }
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      
      // Revoke old URL to prevent memory leaks
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(url);
    } catch (error) {
      console.error("Preview PDF gen failed", error);
    }
  };

  // Handlers
  const addItem = () => {
    setItems([
      ...items,
      { id: Math.random().toString(36).substr(2, 9), description: "", quantity: 1, price: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };


  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    
    setIsGenerating(true);
    try {
      // Small delay to ensure render
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: true,
        width: 816,
        height: 1056,
        ignoreElements: (element) => !element || typeof element.getAttribute !== 'function',
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('pdf-preview');
          if (el) {
            el.style.position = 'static';
            el.style.left = '0';
            el.style.top = '0';
          }
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceNumber || "invoice"}.pdf`);
    } catch (error) {
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!previewRef.current) return;
    if (!clientEmail) {
      toast.error("Please add a client email address.");
      return;
    }

    setIsSending(true);
    try {
      // 1. Generate PDF Blob
      await new Promise(resolve => setTimeout(resolve, 100)); // Render wait
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: true,
        width: 816,
        height: 1056,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('pdf-preview');
          if (el) {
            el.style.position = 'static';
            el.style.left = '0';
            el.style.top = '0';
          }
        }
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const pdfDataUri = pdf.output('datauristring'); // data:application/pdf;base64,...
      const pdfBase64 = pdfDataUri.split(',')[1];

      // 2. Send to API
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: clientEmail,
          subject: emailSubject,
          message: emailMessage,
          pdfBuffer: pdfBase64,
          fileName: `${invoiceNumber}.pdf`
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      toast.success("Invoice sent successfully!");
      setShowEmailModal(false);
    } catch (error) {
      console.error("Email failed", error);
      toast.error("Failed to send email. Check your API key.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSave = async () => {
    const supabase = createClient();
    
    // Check auth (assuming anonymous or authenticated)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        toast.error("You must be logged in to save invoices.");
        // For MVP demo without auth, we could store in localstorage, but let's stick to Supabase structure.
        return; 
    }

    try {
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                user_id: user.id,
                invoice_number: invoiceNumber,
                client_name: clientName,
                client_email: clientEmail,
                client_address: clientAddress,
                date_issued: new Date().toISOString(),
                tax_rate: taxRate,
                tax_amount: (items.reduce((acc, item) => acc + item.quantity * item.price, 0) * (taxRate / 100)),
                subtotal: items.reduce((acc, item) => acc + item.quantity * item.price, 0),
                total: (items.reduce((acc, item) => acc + item.quantity * item.price, 0) * (1 + taxRate / 100)),
                template_id: templateId,
                status: 'draft'
            })
            .select()
            .single();

        if (invoiceError) throw invoiceError;

        if (invoice) {
            const invoiceItems = items.map(item => ({
                invoice_id: invoice.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.price
            }));

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(invoiceItems);

            if (itemsError) throw itemsError;

            toast.success("Invoice saved successfully!");
        }
    } catch (error: any) {
        console.error("Save error:", error);
        toast.error(`Failed to save: ${error.message}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-8 relative">
      {/* Modal removed for brevity in this chunk, assuming it stays above */}


      {/* Hidden Preview for PDF Generation */}
      <div className="absolute left-[-9999px] top-0">
        <div id="pdf-preview">
          <InvoicePreview 
            ref={previewRef} 
            data={{
              invoiceNumber,
              dateIssued: new Date().toISOString().split('T')[0], // Using current date for preview
              clientName,
              clientEmail,
              clientAddress,
              items,
              taxRate,
              logo,
              accentColor,
              templateId
            }} 
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
            Invoice Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Create professional invoices in seconds.
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={generateInvoiceNumber}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate #
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Editor Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Design</CardTitle>
              <CardDescription>Customize the look of your invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <div className="flex items-center gap-4">
                     {logo && (
                       <div className="relative w-16 h-16 border rounded overflow-hidden">
                         <img src={logo} alt="Logo" className="object-contain w-full h-full" />
                         <button onClick={() => setLogo("")} className="absolute inset-0 bg-black/50 text-white opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     )}
                     <div className="flex-1">
                       <Input type="file" accept="image/*" onChange={handleLogoUpload} className="cursor-pointer" />
                     </div>
                  </div>
                </div>

                <div className="space-y-2">
                   <Label>Accent Color</Label>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border shadow-sm" style={{ backgroundColor: accentColor }} />
                      <Input 
                        type="color" 
                        value={accentColor} 
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-full h-10 p-1 cursor-pointer" 
                      />
                   </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Choose Template</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                   {(['standard', 'corporate', 'modern', 'minimal', 'bold'] as TemplateId[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTemplateId(t)}
                        className={`
                          relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:bg-secondary/50
                          ${templateId === t ? 'border-primary bg-primary/5' : 'border-transparent bg-secondary/30'}
                        `}
                      >
                         <div className={`w-full aspect-[3/4] rounded shadow-sm border ${templateId === t ? 'border-primary/20' : 'border-border'}`} style={{ backgroundColor: '#fff' }}>
                            <div className="h-full w-full p-2 flex flex-col gap-1 opacity-50">
                               <div className="h-2 w-1/2 bg-slate-200 rounded-sm" style={{ backgroundColor: templateId === t ? accentColor : undefined }} />
                               <div className="h-full w-full bg-slate-50 rounded-sm" />
                            </div>
                         </div>
                         <span className="text-xs font-medium capitalize">{t}</span>
                      </button>
                   ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
              <CardDescription>Who is this invoice for?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Number</Label>
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date Issued</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input
                  placeholder="e.g. Acme Corp"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Email</Label>
                  <Input
                    type="email"
                    placeholder="billing@acme.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Address</Label>
                  <Input
                    placeholder="123 Business St, City"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>What represent the charges?</CardDescription>
              </div>
              <Button size="sm" onClick={addItem} variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="group relative grid grid-cols-12 gap-4 items-start p-4 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors border border-transparent hover:border-border">
                   <div className="col-span-12 md:col-span-6 space-y-1">
                      <Label className="md:hidden">Description</Label>
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        className="bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0 focus:border-primary placeholder:text-muted-foreground/50"
                      />
                   </div>
                   <div className="col-span-4 md:col-span-2 space-y-1">
                      <Label className="md:hidden">Qty</Label>
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                         className="bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0 focus:border-primary text-right"
                      />
                   </div>
                   <div className="col-span-4 md:col-span-2 space-y-1">
                      <Label className="md:hidden">Price</Label>
                      <Input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                        className="bg-transparent border-0 border-b rounded-none px-0 focus-visible:ring-0 focus:border-primary text-right"
                      />
                   </div>
                   <div className="col-span-4 md:col-span-2 flex items-center justify-end gap-2 h-10">
                      <span className="font-mono font-medium opacity-70">
                        ${(item.quantity * item.price).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 p-2 rounded-md"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Preview Column */}
        <div className="space-y-6">
           <Card className="sticky top-6 border-blue-500/20 shadow-2xl overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-3">
                 <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                       <FileText className="w-5 h-5 text-blue-500" />
                       Embedded PDF
                    </CardTitle>
                    <CardDescription>Official output view</CardDescription>
                 </div>
                 <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleDownloadPDF} disabled={isGenerating}>
                       {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                       <span className="hidden sm:inline ml-2">{isGenerating ? "Preparing..." : "Download"}</span>
                    </Button>
                 </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 bg-slate-200/50 flex flex-col">
                 {pdfUrl ? (
                    <iframe 
                      src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`} 
                      className="w-full h-full border-none"
                      title="Invoice PDF Preview"
                    />
                 ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
                       <Loader2 className="w-8 h-8 animate-spin" />
                       <p>Generating PDF preview...</p>
                    </div>
                 )}
              </CardContent>
              <CardFooter className="border-t bg-muted/30 py-4">
                 <div className="w-full flex justify-between items-center">
                    <div>
                       <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Due</p>
                       <p className="text-2xl font-black text-primary">${total.toFixed(2)}</p>
                    </div>
                    <Button variant="secondary" onClick={() => setShowEmailModal(true)}>
                       <Send className="w-4 h-4 mr-2" />
                       Send via Email
                    </Button>
                 </div>
              </CardFooter>
           </Card>
        </div>
      </div>
    </div>
  );
}
