"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "@/app/(portal)/campaigns/new/components/Toast";
import { 
  ArrowLeft, 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  MessageSquare, 
  Sparkles, 
  ChevronRight, 
  EyeOff,
  Eye
} from "lucide-react";
import Link from "next/link";
import { LAUNCH_TEMPLATES } from "@/lib/data/launch-templates";

// ... imports

// Helper to fill templates
const fillTemplate = (template: any, campaign: Campaign) => {
  if (!template) return null;
  const content = { ...template };
  
  const replacements: Record<string, string> = {
    "{{product_name}}": campaign.product_name || "Our Product",
    "{{product_description}}": campaign.product_description || "A revolutionary tool.",
    "{{problem_statement}}": "solving complex problems", // Default fallback
    "{{target_audience}}": "users",
    "{{core_benefit}}": "save time and money",
    "{{key_feature}}": "AI automation",
    "{{url}}": "https://example.com" // Should ideally come from campaign data if available
  };

  // Simple string replacement for all string properties
  const replaceInString = (str: string) => {
    let newStr = str;
    Object.entries(replacements).forEach(([key, value]) => {
      newStr = newStr.replace(new RegExp(key, 'g'), value);
    });
    return newStr;
  };

  if (content.title) content.title = replaceInString(content.title);
  if (content.body) content.body = replaceInString(content.body);
  if (content.text) content.text = replaceInString(content.text);
  if (content.caption) content.caption = replaceInString(content.caption);
  if (content.tagline) content.tagline = replaceInString(content.tagline);
  if (content.description) content.description = replaceInString(content.description);
  if (content.first_comment) content.first_comment = replaceInString(content.first_comment);
  if (content.thread) content.thread = content.thread.map(replaceInString);
  if (content.image_prompt) content.image_prompt = replaceInString(content.image_prompt);

  return content;
};

// ... inside component

  // Group targets by platform
  const groupedTargets = targets.reduce((acc, target) => {
    // Only show targets for current day
    const template = LAUNCH_TEMPLATES.find((ct: any) => ct.platform === target.platform && ct.community_name === target.community_name);
    const targetDay = template?.day || 1;
    
    if (targetDay !== currentDay) return acc;
    
    // Filter out posted if hidden
    if (!showPosted && target.status === 'posted') return acc;

    if (!acc[target.platform]) {
      acc[target.platform] = [];
    }
    acc[target.platform].push(target);
    return acc;
  }, {} as Record<string, LaunchTarget[]>);

// ... inside render loop

                        {(() => {
                          // Use DB content if valid, otherwise fallback to DYNAMIC template content
                          let content = (target.content && !target.content.error) 
                            ? target.content 
                            : null;
                          
                          if (!content) {
                             const template = LAUNCH_TEMPLATES.find((t: any) => t.platform === target.platform && t.community_name === target.community_name)?.content;
                             content = fillTemplate(template, campaign);
                          }

                          if (content) {
                            return (
                              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700/50 text-gray-300 text-sm whitespace-pre-wrap font-mono">
                                {content.title && <div className="font-bold mb-2">{content.title}</div>}
                                {content.text || content.body || content.caption || (content.thread && content.thread.join('\n\n---\n\n')) || content.tagline}
                                {content.image_prompt && (
                                  <div className="mt-4 pt-4 border-t border-gray-800 flex items-start justify-between gap-4">
                                    <div>
                                      <span className="text-xs text-purple-400 uppercase font-bold block mb-1">Image Prompt</span>
                                      <span className="text-purple-200">{content.image_prompt}</span>
                                    </div>
                                    <CopyButton 
                                      text={content.image_prompt} 
                                      label="Copy Prompt" 
                                      className="shrink-0 !px-3 !py-1 !text-xs" 
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            return <div className="text-gray-500 italic text-sm">No content available.</div>;
                          }
                        })()}

// ... inside CopyButton logic

                        {(() => {
                          let content = (target.content && !target.content.error) 
                            ? target.content 
                            : null;
                            
                          if (!content) {
                             const template = LAUNCH_TEMPLATES.find((t: any) => t.platform === target.platform && t.community_name === target.community_name)?.content;
                             content = fillTemplate(template, campaign);
                          }

                          if (!content) return null;

                          if (content.title) {
                            return (
                              <>
                                <CopyButton text={content.title} label="Copy Title" />
                                <CopyButton text={content.body} label="Copy Body" />
                              </>
                            );
                          }

                          return (
                            <CopyButton 
                              text={content.text || content.caption || content.thread?.join('\n\n') || content.tagline}
                            />
                          );
                        })()}
