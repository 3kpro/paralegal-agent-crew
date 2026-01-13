import InvoiceForm from "@/components/InvoiceForm";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground py-10 selection:bg-blue-500/30">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
      </div>
      
      <InvoiceForm />
    </main>
  );
}
