"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LaunchpadGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      
      // TODO: Replace with your actual admin email
      const ADMIN_EMAILS = ['mark@3kpro.services', 'mark@contentcascade.ai', 'owner@example.com', 'james.lawson@gmail.com'];
      
      if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
        router.push('/dashboard'); // Redirect unauthorized users
        return;
      }
      
      setAuthorized(true);
      setLoading(false);
    }
    
    checkAccess();
  }, [router, supabase]);

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Verifying clearance...</div>;
  
  if (!authorized) return null;

  return <>{children}</>;
}
