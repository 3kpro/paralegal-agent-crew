"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  date_issued: string;
  total: number;
  status: 'draft' | 'sent' | 'paid';
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Check auth
    supabase.auth.getUser().then(({ data: { user } }) => {
       setUser(user);
       if (user) {
         fetchInvoices(user.id);
       } else {
         setLoading(false);
       }
    });

    const fetchInvoices = async (userId: string) => {
       const { data, error } = await supabase
         .from('invoices')
         .select('*')
         .eq('user_id', userId)
         .order('created_at', { ascending: false });
       
       if (error) {
         toast.error("Failed to load invoices");
         console.error(error);
       } else {
         setInvoices(data || []);
       }
       setLoading(false);
    };
  }, []);

  const filteredInvoices = invoices.filter(inv => 
    inv.client_name?.toLowerCase().includes(search.toLowerCase()) || 
    inv.invoice_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
     return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!user) {
     return (
        <div className="container max-w-5xl mx-auto p-6 text-center">
           <Card>
              <CardContent className="pt-6">
                 <p className="mb-4">Please sign in to view your invoice history.</p>
                 <Button onClick={() => window.location.href = '/login'}>
                    Sign In
                 </Button>
              </CardContent>
           </Card>
        </div>
     )
  }

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold">Invoice History</h1>
           <p className="text-muted-foreground">Manage your generated invoices</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search clients or #" 
                className="pl-8" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
           </Button>
        </div>
      </div>

      <div className="grid gap-4">
         {filteredInvoices.length === 0 ? (
            <Card>
               <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-20" />
                  <p>No invoices found matching your criteria.</p>
                  {invoices.length === 0 && (
                     <Button className="mt-4" variant="secondary" onClick={() => window.location.href = '/'}>
                        Create your first invoice
                     </Button>
                  )}
               </CardContent>
            </Card>
         ) : (
            filteredInvoices.map((invoice) => (
               <Card key={invoice.id} className="hover:bg-muted/50 transition-colors">
                  <div className="p-4 flex items-center justify-between">
                     <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="font-mono font-semibold text-primary">{invoice.invoice_number}</span>
                           <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                              invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                           }`}>
                              {invoice.status}
                           </span>
                        </div>
                        <h3 className="font-semibold">{invoice.client_name || "Unknown Client"}</h3>
                        <p className="text-xs text-muted-foreground">Issued: {new Date(invoice.date_issued).toLocaleDateString()}</p>
                     </div>
                     <div className="text-right flex items-center gap-4">
                        <div className="font-bold text-lg">${Number(invoice.total).toFixed(2)}</div>
                        <Button variant="ghost" size="icon">
                           <Download className="h-4 w-4" />
                        </Button>
                     </div>
                  </div>
               </Card>
            ))
         )}
      </div>
    </div>
  );
}
