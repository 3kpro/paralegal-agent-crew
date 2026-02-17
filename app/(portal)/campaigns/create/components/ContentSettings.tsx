/**
 * ContentSettings Component
 *
 * Comprehensive content settings panel for campaign generation.
 * Includes creativity slider and all content control options.
 * Memoized to prevent unnecessary re-renders.
 *
 * Supports two modes:
 * - "trending" (default): optimized for viral/trending content
 * - "promote": optimized for product/service promotion campaigns
 */

import React, { memo, useMemo, useCallback, useRef, useEffect, useState } from "react";
import { Gear as Settings, Faders as Settings2, MagicWand, Target, Users, Chat as MessageSquare, PaintBrush } from "@phosphor-icons/react";
import CreativitySlider from "./CreativitySlider";
import ControlOptionButton from "./ControlOptionButton";
import { ControlOption, ContentControls } from "../types";

interface ContentSettingsProps {
  controls: ContentControls;
  onControlsChange: (controls: ContentControls) => void;
  mode?: "trending" | "promote";
}

/**
 * ContentSettings - Memoized component for all content controls
 */
const ContentSettings = memo<ContentSettingsProps>(
  ({ controls, onControlsChange, mode = "trending" }) => {
    // Keep ref to current controls to avoid placing controls object in dependency arrays
    const controlsRef = useRef<ContentControls>(controls);

    // Tab state for compact layout
    const [activeTab, setActiveTab] = useState<"style" | "target">("style");

    useEffect(() => {
      controlsRef.current = controls;
    }, [controls]);

    // Memoize control options to prevent recreation on every render
    const lengths = useMemo<ControlOption[]>(
      () => [
        { id: "concise", label: "Concise" },
        { id: "standard", label: "Standard" },
        { id: "detailed", label: "Detailed" },
      ],
      []
    );

    const tones = useMemo<ControlOption[]>(
      () => [
        { id: "professional", label: "Professional" },
        { id: "casual", label: "Casual" },
        { id: "humorous", label: "Humorous" },
        { id: "inspirational", label: "Inspirational" },
        { id: "educational", label: "Educational" },
      ],
      []
    );

    const audiences = useMemo<ControlOption[]>(
      () => [
        { id: "general", label: "General" },
        { id: "professionals", label: "Professionals" },
        { id: "entrepreneurs", label: "Entrepreneurs" },
        { id: "creators", label: "Creators" },
        { id: "students", label: "Students" },
        { id: "techies", label: "Techies" },
        { id: "gamers", label: "Gamers" },
        { id: "hobbyists", label: "Hobbyists" },
      ],
      []
    );

    // Trending-specific: discussion, opinion, news, etc.
    const trendingFocuses = useMemo<ControlOption[]>(
      () => [
        { id: "informative", label: "Informative" },
        { id: "discussion", label: "Discussion" },
        { id: "opinion", label: "Opinion" },
        { id: "news", label: "News" },
        { id: "tips", label: "Tips" },
        { id: "story", label: "Story" },
        { id: "walkthrough", label: "Walkthrough" },
      ],
      []
    );

    // Promote-specific: conversion and positioning angles
    const promoteFocuses = useMemo<ControlOption[]>(
      () => [
        { id: "benefits", label: "Benefits" },
        { id: "problem-solution", label: "Problem → Solution" },
        { id: "social-proof", label: "Social Proof" },
        { id: "feature-highlight", label: "Feature Highlight" },
        { id: "urgency", label: "Urgency" },
        { id: "story", label: "Brand Story" },
        { id: "comparison", label: "Comparison" },
      ],
      []
    );

    // Trending-specific CTAs: engagement-focused
    const trendingCTAs = useMemo<ControlOption[]>(
      () => [
        { id: "engage", label: "Engage" },
        { id: "share", label: "Share" },
        { id: "comment", label: "Comment" },
        { id: "follow", label: "Follow" },
        { id: "learn", label: "Learn More" },
        { id: "none", label: "None" },
      ],
      []
    );

    // Promote-specific CTAs: conversion-focused
    const promoteCTAs = useMemo<ControlOption[]>(
      () => [
        { id: "signup", label: "Sign Up" },
        { id: "free-trial", label: "Free Trial" },
        { id: "shop-now", label: "Shop Now" },
        { id: "book-demo", label: "Book a Demo" },
        { id: "learn", label: "Learn More" },
        { id: "none", label: "None" },
      ],
      []
    );

    const focuses = mode === "promote" ? promoteFocuses : trendingFocuses;
    const callToActions = mode === "promote" ? promoteCTAs : trendingCTAs;

    // Memoized handlers
    const handleTemperatureChange = useCallback(
      (value: number) => {
        onControlsChange({ ...controlsRef.current, temperature: value });
      },
      [onControlsChange]
    );

    const handleLengthChange = useCallback(
      (id: string) => {
        onControlsChange({ ...controlsRef.current, length: id });
      },
      [onControlsChange]
    );

    const handleToneChange = useCallback(
      (id: string) => {
        onControlsChange({ ...controlsRef.current, tone: id });
      },
      [onControlsChange]
    );

    const handleAudienceChange = useCallback(
      (id: string) => {
        onControlsChange({ ...controlsRef.current, targetAudience: id });
      },
      [onControlsChange]
    );

    const handleFocusChange = useCallback(
      (id: string) => {
        onControlsChange({ ...controlsRef.current, contentFocus: id });
      },
      [onControlsChange]
    );

    const handleCtaChange = useCallback(
      (id: string) => {
        onControlsChange({ ...controlsRef.current, callToAction: id });
      },
      [onControlsChange]
    );

    return (
      <div className="space-y-3 p-4 bg-tron-dark/30 backdrop-blur-xl border-2 border-tron-grid rounded-2xl flex flex-col h-full">
        {/* Header & Tabs */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-tron-text flex items-center gap-2">
            <Settings className="w-4 h-4 text-tron-cyan" weight="duotone" />
            {mode === "promote" ? "Promotion Settings" : "Content Settings"}
          </h3>

          <div className="flex bg-tron-dark/50 p-1 rounded-lg border border-tron-grid">
            <button
              onClick={() => setActiveTab("style")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === "style"
                  ? "bg-tron-cyan/20 text-tron-cyan shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <PaintBrush className="w-3.5 h-3.5" weight={activeTab === "style" ? "duotone" : "regular"} />
              Style & Voice
            </button>
            <button
              onClick={() => setActiveTab("target")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === "target"
                  ? "bg-tron-magenta/20 text-tron-magenta shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Target className="w-3.5 h-3.5" weight={activeTab === "target" ? "duotone" : "regular"} />
              {mode === "promote" ? "Audience & CTA" : "Target & Goal"}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {activeTab === "style" ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {/* Creativity Slider */}
              <div className="bg-tron-dark/30 rounded-lg p-2 border border-tron-grid/50">
                <CreativitySlider
                  value={controls.temperature}
                  onChange={handleTemperatureChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Content Length */}
                <fieldset className="p-3 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border border-tron-cyan/20 rounded-lg hover:border-tron-cyan/40 transition-all h-full">
                  <legend className="flex items-center gap-2 mb-2 text-xs font-semibold text-tron-text">
                    <Settings2 className="w-3.5 h-3.5 text-tron-cyan" weight="duotone" />
                    Content Length
                  </legend>
                  <div className="grid grid-cols-1 gap-2">
                    {lengths.map((len) => (
                      <ControlOptionButton
                        key={len.id}
                        id={len.id}
                        label={len.label}
                        isSelected={controls.length === len.id}
                        onClick={handleLengthChange}
                        flex={true}
                      />
                    ))}
                  </div>
                </fieldset>

                {/* Content Tone */}
                <fieldset className="p-3 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border border-tron-cyan/20 rounded-lg hover:border-tron-cyan/40 transition-all h-full">
                  <legend className="flex items-center gap-2 mb-2 text-xs font-semibold text-tron-text">
                    <MagicWand className="w-3.5 h-3.5 text-tron-cyan" weight="duotone" />
                    Content Tone
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {tones.map((t) => (
                      <ControlOptionButton
                        key={t.id}
                        id={t.id}
                        label={t.label}
                        isSelected={controls.tone === t.id}
                        onClick={handleToneChange}
                        className={tones.length % 2 !== 0 && t.id === tones[tones.length-1].id ? "col-span-2" : ""}
                      />
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {/* Content Focus */}
              <fieldset className="p-3 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border border-tron-magenta/20 rounded-lg hover:border-tron-magenta/40 transition-all">
                <legend className="flex items-center gap-2 mb-2 text-xs font-semibold text-tron-text">
                  <MessageSquare className="w-3.5 h-3.5 text-tron-magenta" weight="duotone" />
                  {mode === "promote" ? "Content Angle" : "Content Focus"}
                </legend>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {focuses.map((focus) => (
                    <ControlOptionButton
                      key={focus.id}
                      id={focus.id}
                      label={focus.label}
                      isSelected={controls.contentFocus === focus.id}
                      onClick={handleFocusChange}
                    />
                  ))}
                </div>
              </fieldset>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Target Audience */}
                <fieldset className="p-3 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border border-tron-magenta/20 rounded-lg hover:border-tron-magenta/40 transition-all">
                  <legend className="flex items-center gap-2 mb-2 text-xs font-semibold text-tron-text">
                    <Users className="w-3.5 h-3.5 text-tron-magenta" weight="duotone" />
                    Target Audience
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {audiences.map((aud) => (
                      <ControlOptionButton
                        key={aud.id}
                        id={aud.id}
                        label={aud.label}
                        isSelected={controls.targetAudience === aud.id}
                        onClick={handleAudienceChange}
                      />
                    ))}
                  </div>
                </fieldset>

                {/* Call to Action */}
                <fieldset className="p-3 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border border-tron-magenta/20 rounded-lg hover:border-tron-magenta/40 transition-all">
                  <legend className="flex items-center gap-2 mb-2 text-xs font-semibold text-tron-text">
                    <Target className="w-3.5 h-3.5 text-tron-magenta" weight="duotone" />
                    {mode === "promote" ? "Conversion Goal" : "Call to Action"}
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {callToActions.map((cta) => (
                      <ControlOptionButton
                        key={cta.id}
                        id={cta.id}
                        label={cta.label}
                        isSelected={controls.callToAction === cta.id}
                        onClick={handleCtaChange}
                      />
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ContentSettings.displayName = "ContentSettings";

export default ContentSettings;
