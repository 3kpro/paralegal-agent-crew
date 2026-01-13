import React, { forwardRef } from "react";
import { InvoiceData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TemplateProps {
  data: InvoiceData;
}

// 1. Standard Template (Clean, Simple)
export const StandardTemplate = ({ data }: TemplateProps) => {
  const { subtotal, taxAmount, total } = calculateTotals(data);
  const color = data.accentColor || "#2563eb";

  return (
    <div className="p-10 bg-white min-h-[10in] text-slate-900 font-sans">
      <div className="flex justify-between items-start mb-12">
        <div className="flex flex-col gap-4">
           {data.logo && <img src={data.logo} alt="Logo" className="h-16 w-auto object-contain self-start" />}
           <div>
              <h1 className="text-4xl font-bold tracking-tight" style={{ color }}>INVOICE</h1>
              <p className="text-slate-500 mt-1">#{data.invoiceNumber}</p>
           </div>
        </div>
        <div className="text-right">
          <div className="text-slate-500 font-medium">Date Issued:</div>
          <div className="font-semibold">{data.dateIssued}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-16">
        <div>
          <h2 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Billed To</h2>
          <div className="font-semibold text-lg">{data.clientName || "Client Name"}</div>
          <p className="text-slate-600 whitespace-pre-line">{data.clientAddress || "Client Address"}</p>
          <p className="text-slate-600 mt-1">{data.clientEmail}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">From</h2>
          <div className="font-semibold text-lg">Your Business</div>
          {/* Add dynamic sender info later */}
        </div>
      </div>

      <table className="w-full mb-12 border-collapse">
        <thead>
          <tr className="border-b-2" style={{ borderColor: color }}>
            <th className="text-left font-bold pb-3 pl-2" style={{ color }}>Description</th>
            <th className="text-right font-bold pb-3 w-24" style={{ color }}>Qty</th>
            <th className="text-right font-bold pb-3 w-32" style={{ color }}>Price</th>
            <th className="text-right font-bold pb-3 w-32 pr-2" style={{ color }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-4 font-medium pl-2">{item.description}</td>
              <td className="text-right py-4 text-slate-600">{item.quantity}</td>
              <td className="text-right py-4 text-slate-600">${item.price.toFixed(2)}</td>
              <td className="text-right py-4 font-semibold pr-2">${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Tax ({data.taxRate}%)</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between items-center" style={{ borderColor: color }}>
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-xl" style={{ color }}>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Corporate Template (Boxed, Formal)
export const CorporateTemplate = ({ data }: TemplateProps) => {
  const { subtotal, taxAmount, total } = calculateTotals(data);
  const color = data.accentColor || "#0f172a";

  return (
    <div className="p-10 bg-white min-h-[10in] text-slate-900 font-serif">
      <div className="border-b-4 mb-8 pb-4 flex justify-between items-end" style={{ borderColor: color }}>
        <div className="flex items-center gap-4">
           {data.logo && <img src={data.logo} alt="Logo" className="h-20 w-auto object-contain" />}
           {!data.logo && <h1 className="text-3xl font-bold uppercase" style={{ color }}>INVOICE</h1>}
        </div>
        <div className="text-right">
           <h2 className="text-2xl font-bold" style={{ color }}>INVOICE</h2>
           <p>#{data.invoiceNumber}</p>
        </div>
      </div>

      <div className="flex justify-between mb-8">
        <div className="w-1/2">
           <h3 className="font-bold uppercase text-sm mb-1" style={{ color }}>Bill To:</h3>
           <div className="bg-slate-50 p-4 rounded border border-slate-200">
             <p className="font-bold">{data.clientName || "Client Name"}</p>
             <p>{data.clientAddress}</p>
             <p className="text-sm mt-2">{data.clientEmail}</p>
           </div>
        </div>
        <div className="text-right">
           <p className="font-bold">Date: {data.dateIssued}</p>
        </div>
      </div>

      <table className="w-full mb-8">
        <thead className="text-white" style={{ backgroundColor: color }}>
          <tr>
            <th className="text-left p-2">Item</th>
            <th className="text-right p-2">Qty</th>
            <th className="text-right p-2">Rate</th>
            <th className="text-right p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
             <tr key={item.id} className={i % 2 === 0 ? "bg-slate-50" : ""}>
               <td className="p-2 border-b border-slate-200">{item.description}</td>
               <td className="p-2 border-b border-slate-200 text-right">{item.quantity}</td>
               <td className="p-2 border-b border-slate-200 text-right">${item.price.toFixed(2)}</td>
               <td className="p-2 border-b border-slate-200 text-right">${(item.quantity * item.price).toFixed(2)}</td>
             </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
         <div className="w-1/2 border pt-4 p-4 bg-slate-50">
            <div className="flex justify-between mb-2">
               <span>Subtotal:</span>
               <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
               <span>Tax:</span>
               <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-slate-300 pt-2">
               <span>Total:</span>
               <span>${total.toFixed(2)}</span>
            </div>
         </div>
      </div>
    </div>
  );
};

// 3. Modern Template (Sidebar)
export const ModernTemplate = ({ data }: TemplateProps) => {
  const { subtotal, taxAmount, total } = calculateTotals(data);
  const color = data.accentColor || "#8b5cf6";

  return (
    <div className="flex min-h-[10in] bg-white">
      {/* Sidebar */}
      <div className="w-1/3 text-white p-10" style={{ backgroundColor: color }}>
          <div className="mb-10">
            {data.logo ? <img src={data.logo} className="mb-4 bg-white p-2 rounded h-20 w-auto object-contain" /> : <h1 className="text-4xl font-bold mb-4">INVOICE</h1>}
          </div>
          <div className="mb-8">
             <h3 className="uppercase text-white/70 text-sm font-bold mb-2">Billed To</h3>
             <p className="font-semibold text-xl">{data.clientName || "Client Name"}</p>
             <p className="text-white/80">{data.clientAddress}</p>
             <p className="text-white/80 mt-2">{data.clientEmail}</p>
          </div>
          <div className="mb-8">
             <h3 className="uppercase text-white/70 text-sm font-bold mb-2">Date Issued</h3>
             <p className="font-semibold text-xl">{data.dateIssued}</p>
          </div>
          <div>
             <h3 className="uppercase text-white/70 text-sm font-bold mb-2">Invoice No</h3>
             <p className="font-semibold text-xl">{data.invoiceNumber}</p>
          </div>
      </div>
      
      {/* Main Content */}
      <div className="w-2/3 p-10 text-slate-800">
         <h2 className="text-2xl font-bold mb-8 text-slate-800">Items Breakdown</h2>
         <table className="w-full mb-12">
            <thead>
               <tr className="border-b-2 border-slate-100">
                  <th className="text-left pb-4">Description</th>
                  <th className="text-right pb-4">Total</th>
               </tr>
            </thead>
            <tbody>
               {data.items.map(item => (
                  <tr key={item.id} className="border-b border-slate-50">
                     <td className="py-4">
                        <div className="font-bold">{item.description}</div>
                        <div className="text-sm text-slate-500">{item.quantity} x ${item.price.toFixed(2)}</div>
                     </td>
                     <td className="py-4 text-right font-semibold">
                        ${(item.quantity * item.price).toFixed(2)}
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>

         <div className="space-y-4 pt-4 border-t-2 border-slate-100">
            <div className="flex justify-between">
               <span className="text-slate-500">Subtotal</span>
               <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
               <span className="text-slate-500">Tax</span>
               <span className="font-semibold">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold" style={{ color }}>
               <span>Total Due</span>
               <span>${total.toFixed(2)}</span>
            </div>
         </div>
      </div>
    </div>
  );
};

// 4. Minimal Template (Centered, elegant)
export const MinimalTemplate = ({ data }: TemplateProps) => {
   const { subtotal, taxAmount, total } = calculateTotals(data);
   const color = data.accentColor || "#171717";

   return (
      <div className="p-16 bg-white min-h-[10in] text-center font-sans">
         <div className="mb-12 flex flex-col items-center">
            {data.logo && <img src={data.logo} alt="Logo" className="h-16 w-auto object-contain mb-6" />}
            <h1 className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-2">Invoice</h1>
            <h2 className="text-4xl font-light text-slate-900">{data.invoiceNumber}</h2>
            <p className="text-slate-500 mt-2">{data.dateIssued}</p>
         </div>

         <div className="border-y border-slate-100 py-8 mb-12">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 mb-4">Invoiced To</h3>
            <p className="text-xl font-medium text-slate-900">{data.clientName || "Client Name"}</p>
            <p className="text-slate-500 mt-1">{data.clientEmail}</p>
         </div>

         <div className="mb-12">
            {data.items.map(item => (
               <div key={item.id} className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
                  <div className="text-left">
                     <p className="font-medium text-slate-900">{item.description}</p>
                     <p className="text-xs text-slate-400">{item.quantity} @ ${item.price}</p>
                  </div>
                  <div className="font-medium">${(item.quantity * item.price).toFixed(2)}</div>
               </div>
            ))}
         </div>

         <div className="flex flex-col items-center gap-2">
            <div className="w-full flex justify-between max-w-xs text-sm text-slate-500">
               <span>Subtotal</span>
               <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="w-full flex justify-between max-w-xs text-sm text-slate-500">
               <span>Tax</span>
               <span>${taxAmount.toFixed(2)}</span>
            </div>
             <div className="w-full flex justify-between max-w-xs text-lg font-medium text-slate-900 mt-4 pt-4 border-t border-slate-100">
               <span>Total</span>
               <span>${total.toFixed(2)}</span>
            </div>
         </div>
      </div>
   )
}

// 5. Bold Template (Heavy headers)
export const BoldTemplate = ({ data }: TemplateProps) => {
   const { subtotal, taxAmount, total } = calculateTotals(data);
   const color = data.accentColor || "#000000";

   return (
      <div className="min-h-[10in] bg-white">
         <div className="p-12 text-white" style={{ backgroundColor: color }}>
             <div className="flex justify-between items-center">
               <h1 className="text-6xl font-black tracking-tighter">INVOICE</h1>
               <div className="text-right">
                  <p className="text-xl opacity-80">#{data.invoiceNumber}</p>
                  <p className="opacity-60">{data.dateIssued}</p>
               </div>
             </div>
         </div>

         <div className="p-12">
            <div className="mb-16">
               <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Bill To</p>
               <h2 className="text-4xl font-bold text-slate-900 mb-2">{data.clientName || "Client Name"}</h2>
               <p className="text-xl text-slate-500">{data.clientAddress}</p>
            </div>

            <div className="mb-4 bg-slate-100 p-4 rounded-lg">
               {data.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b border-slate-200 last:border-0">
                     <span className="font-bold text-slate-700">{item.description} <span className="text-xs font-normal text-slate-400 ml-2">x{item.quantity}</span></span>
                     <span className="font-bold text-slate-900">${(item.quantity * item.price).toFixed(2)}</span>
                  </div>
               ))}
            </div>

            <div className="flex justify-end mt-8">
               <div className="text-right">
                  <p className="text-slate-500">Subtotal <span className="text-slate-900 font-bold ml-4">${subtotal.toFixed(2)}</span></p>
                  <p className="text-slate-500">Tax <span className="text-slate-900 font-bold ml-4">${taxAmount.toFixed(2)}</span></p>
                  <p className="text-4xl font-black mt-4" style={{ color }}>${total.toFixed(2)}</p>
               </div>
            </div>
         </div>
         
         {data.logo && (
             <div className="absolute bottom-12 left-12">
                <img src={data.logo} className="h-12 w-auto opacity-50 grayscale" />
             </div>
         )}
      </div>
   )
}

// Utility to verify totals
function calculateTotals(data: InvoiceData) {
  const subtotal = data.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const taxAmount = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
}
