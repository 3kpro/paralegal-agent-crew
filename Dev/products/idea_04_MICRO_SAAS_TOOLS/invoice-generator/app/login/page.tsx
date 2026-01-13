"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        // In local dev, this might just log to console or need InBucket
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email for the login link!");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
           <CardTitle>Sign In</CardTitle>
           <CardDescription>Enter your email to sign in or sign up</CardDescription>
        </CardHeader>
        <CardContent>
           <form onSubmit={handleLogin} className="space-y-4">
              <Input 
                type="email" 
                placeholder="your@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                 {loading ? "Sending..." : "Send Magic Link"}
              </Button>
           </form>
        </CardContent>
      </Card>
    </div>
  );
}
