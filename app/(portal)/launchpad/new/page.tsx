"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Rocket } from "lucide-react";
import Link from "next/link";

export default function NewCampaignPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    product_name: "",
    product_url: "",
    product_description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("launch_campaigns").insert({
        user_id: user.id,
        name: formData.name,
        product_name: formData.product_name,
        product_url: formData.product_url,
        product_description: formData.product_description,
        status: "active",
      });

      if (error) throw error;

      router.push("/launchpad");
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/launchpad"
          className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Command Center
        </Link>
        <h1 className="text-3xl font-bold text-white">Initialize Mission</h1>
        <p className="text-gray-400 mt-2">
          Define your product details to start the launch sequence.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6 bg-gray-800/50 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-sm"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Campaign Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. TrendPulse V1 Launch"
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-coral-500 focus:border-transparent outline-none transition-all"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Product Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. TrendPulse"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-coral-500 focus:border-transparent outline-none transition-all"
              value={formData.product_name}
              onChange={(e) =>
                setFormData({ ...formData, product_name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Product URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-coral-500 focus:border-transparent outline-none transition-all"
              value={formData.product_url}
              onChange={(e) =>
                setFormData({ ...formData, product_url: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            The Story (Problem/Solution)
          </label>
          <textarea
            required
            rows={6}
            placeholder="Describe your product, the problem it solves, and why people should care. This will be used by the AI to generate content."
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-coral-500 focus:border-transparent outline-none transition-all resize-none"
            value={formData.product_description}
            onChange={(e) =>
              setFormData({ ...formData, product_description: e.target.value })
            }
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-coral-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Initializing..."
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Launch Mission
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
