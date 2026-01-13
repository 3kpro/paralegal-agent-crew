import React, { forwardRef } from "react";
import { InvoiceData } from "@/lib/types";
import { 
  StandardTemplate, 
  CorporateTemplate, 
  ModernTemplate, 
  MinimalTemplate, 
  BoldTemplate 
} from "@/components/InvoiceTemplates";

interface InvoicePreviewProps {
  data: InvoiceData;
}

const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(({ data }, ref) => {
  const renderTemplate = () => {
    switch (data.templateId) {
      case 'corporate': return <CorporateTemplate data={data} />;
      case 'modern': return <ModernTemplate data={data} />;
      case 'minimal': return <MinimalTemplate data={data} />;
      case 'bold': return <BoldTemplate data={data} />;
      case 'standard':
      default: return <StandardTemplate data={data} />;
    }
  };

  return (
    <div ref={ref} className="bg-white text-black mx-auto shadow-lg relative min-h-[10in] w-[8.5in] overflow-hidden">
      {renderTemplate()}
    </div>
  );
});

InvoicePreview.displayName = "InvoicePreview";

export default InvoicePreview;
