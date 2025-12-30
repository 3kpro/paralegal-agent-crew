/**
 * ContentSettings Component
 * 
 * Comprehensive content settings panel for campaign generation.
 * Includes creativity slider and all content control options.
 * Memoized to prevent unnecessary re-renders.
 */

import React, { memo, useMemo, useCallback, useRef, useEffect } from "react";
import { Gear as Settings, Faders as Settings2, MagicWand, Target, Users, Chat as MessageSquare } from "@phosphor-icons/react";
import CreativitySlider from "./CreativitySlider";
import ControlOptionButton from "./ControlOptionButton";
import { ControlOption, ContentControls } from "../types";

interface ContentSettingsProps {
  controls: ContentControls;
  onControlsChange: (controls: ContentControls) => void;
}

/**
 * ContentSettings - Memoized component for all content controls
 */
const ContentSettings = memo<ContentSettingsProps>(
  ({ controls, onControlsChange }) => {
    // Keep ref to current controls to avoid placing controls object in dependency arrays
    // This allows handlers to remain stable while still accessing current state
    const controlsRef = useRef<ContentControls>(controls);

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
        { id: "general", label: "General Audience" },
        { id: "professionals", label: "Professionals" },
        { id: "entrepreneurs", label: "Entrepreneurs" },
        { id: "creators", label: "Content Creators" },
        { id: "students", label: "Students" },
        { id: "techies", label: "Tech Enthusiasts" },
        { id: "gamers", label: "Gamers" },
        { id: "hobbyists", label: "Hobbyists" },
      ],
      []
    );

    const focuses = useMemo<ControlOption[]>(
      () => [
        { id: "informative", label: "Share Information" },
        { id: "discussion", label: "Start Discussion" },
        { id: "opinion", label: "Share Opinion/Take" },
        { id: "news", label: "News/Update" },
        { id: "tips", label: "Tips & Advice" },
        { id: "story", label: "Tell a Story" },
        { id: "walkthrough", label: "Walk Through" },
      ],
      []
    );

    const callToActions = useMemo<ControlOption[]>(
      () => [
        { id: "engage", label: "Ask for Engagement" },
        { id: "share", label: "Encourage Sharing" },
        { id: "comment", label: "Ask for Comments" },
        { id: "follow", label: "Ask to Follow" },
        { id: "learn", label: "Learn More" },
        { id: "none", label: "No Specific CTA" },
      ],
      []
    );

    // Memoized handlers - use controlsRef to avoid controls in dependency array
    // This keeps handlers stable across renders and preserves child memoization
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
      <div className="space-y-5 p-6 bg-tron-dark/30 backdrop-blur-xl border-2 border-tron-grid rounded-3xl">
        {/* Header */}
        <h3 className="text-lg font-semibold text-tron-text flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-tron-cyan" weight="duotone" />
          Content Settings
        </h3>

        {/* Compact Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column: Creativity + Length */}
          <div className="space-y-4">
            {/* Creativity Slider */}
            <CreativitySlider
              value={controls.temperature}
              onChange={handleTemperatureChange}
            />

            {/* Content Length - Compact */}
            <fieldset className="p-4 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border border-tron-cyan/20 rounded-xl hover:border-tron-cyan/40 transition-all">
              <legend className="flex items-center gap-2 mb-3 text-sm font-semibold text-tron-text">
                <Settings2 className="w-4 h-4 text-tron-cyan" weight="duotone" />
                Content Length
              </legend>
              <div className="grid grid-cols-3 gap-2">
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
          </div>

          {/* Right Column: Tone */}
          <fieldset className="p-4 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border border-tron-cyan/20 rounded-xl hover:border-tron-cyan/40 transition-all">
            <legend className="flex items-center gap-2 mb-3 text-sm font-semibold text-tron-text">
              <MagicWand className="w-4 h-4 text-tron-cyan" weight="duotone" />
              Content Tone
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {tones.map((t) => (
                <ControlOptionButton
                  key={t.id}
                  id={t.id}
                  label={t.label}
                  isSelected={controls.tone === t.id}
                  onClick={handleToneChange}
                />
              ))}
            </div>
          </fieldset>

          {/* Target Audience - Full Width, Compact */}
          <fieldset className="p-4 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border border-tron-cyan/20 rounded-xl lg:col-span-2 hover:border-tron-cyan/40 transition-all">
            <legend className="flex items-center gap-2 mb-3 text-sm font-semibold text-tron-text">
              <Users className="w-4 h-4 text-tron-cyan" weight="duotone" />
              Target Audience
            </legend>
            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2">
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

          {/* Content Focus - Full Width, Compact */}
          <fieldset className="p-4 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border border-tron-cyan/20 rounded-xl lg:col-span-2 hover:border-tron-cyan/40 transition-all">
            <legend className="flex items-center gap-2 mb-3 text-sm font-semibold text-tron-text">
              <MessageSquare className="w-4 h-4 text-tron-cyan" weight="duotone" />
              Content Focus
            </legend>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
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

          {/* Call to Action - Full Width, Compact */}
          <fieldset className="p-4 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border border-tron-cyan/20 rounded-xl lg:col-span-2 hover:border-tron-cyan/40 transition-all">
            <legend className="flex items-center gap-2 mb-3 text-sm font-semibold text-tron-text">
              <Target className="w-4 h-4 text-tron-cyan" weight="duotone" />
              Call to Action
            </legend>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
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
    );
  }
);

ContentSettings.displayName = "ContentSettings";

export default ContentSettings;