"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Construction } from "lucide-react";

export default function EditCampaignPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push(`/campaigns/${params.id}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [params.id, router]);

  return (
    <div className="min-h-screen bg-tron-dark flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="bg-tron-grid border-2 border-tron-cyan/30 rounded-2xl p-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Construction className="w-16 h-16 text-tron-cyan" />
          </motion.div>

          <h1 className="text-2xl font-bold text-tron-text mb-4">
            Campaign Editing Coming Soon
          </h1>

          <p className="text-tron-text-muted mb-6">
            The campaign editor is under construction. For now, you can create a
            new campaign or view your existing campaigns.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/campaigns/${params.id}`)}
              className="w-full px-6 py-3 bg-gradient-to-r from-tron-cyan to-tron-magenta text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              View Campaign Details
            </button>

            <button
              onClick={() => router.push("/campaigns")}
              className="w-full px-6 py-3 bg-tron-grid border border-tron-cyan/30 text-tron-cyan font-semibold rounded-lg hover:border-tron-cyan transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Campaigns
            </button>
          </div>

          <p className="text-xs text-tron-text-muted mt-6">
            Redirecting automatically in 3 seconds...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
