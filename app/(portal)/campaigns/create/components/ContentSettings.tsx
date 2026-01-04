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

    const focuses = useMemo<ControlOption[]>(
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

    const callToActions = useMemo<ControlOption[]>(
      () => [
        { id: "engage", label: "Engage" },
        { id: "share", label: "Share" },
        { id: "comment", label: "Comment" },
        { id: "follow", label: "Follow" },
        { id: "learn", label: "Learn" },
        { id: "none", label: "None" },
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
      <div className="space-y-3 p-4 bg-tron-dark/30 backdrop-blur-xl border-2 border-tron-grid rounded-2xl">
        {/* Header */}
        <h3 className="text-base font-semibold text-tron-text flex items-center gap-2 mb-2">
          <Settings className="w-4 h-4 text-tron-cyan" weight="duotone" />
          Content Settings
        </h3>

        {/* Compact Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Left Column: Creativity + Length */}
          <div className="space-y-2">
            {/* Creativity Slider */}
            <CreativitySlider
              value={controls.temperature}
              onChange={handleTemperatureChange}
            />

            {/* Content Length - Compact */}
            <fieldset className="p-2 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border border-tron-cyan/20 rounded-lg hover:border-tron-cyan/40 transition-all">
              <legend className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-tron-text">
                <Settings2 className="w-3.5 h-3.5 text-tron-cyan" weight="duotone" />
                Content Length
              </legend>
              <div className="grid grid-cols-3 gap-1.5">
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
          <fieldset className="p-2 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border border-tron-cyan/20 rounded-lg hover:border-tron-cyan/40 transition-all">
            <legend className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-tron-text">
              <MagicWand className="w-3.5 h-3.5 text-tron-cyan" weight="duotone" />
              Content Tone
            </legend>
            <div className="grid grid-cols-3 gap-1.5">
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
          <fieldset className="p-2 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border border-tron-cyan/20 rounded-lg lg:col-span-2 hover:border-tron-cyan/40 transition-all">
            <legend className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-tron-text">
              <Users className="w-3.5 h-3.5 text-tron-cyan" weight="duotone" />
              Target Audience
            </legend>
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-1.5">
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
          <fieldset className="p-2 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border border-tron-cyan/20 rounded-lg lg:col-span-2 hover:border-tron-cyan/40 transition-all">
            <legend className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-tron-text">
              <MessageSquare className="w-3.5 h-3.5 text-tron-cyan" weight="duotone" />
              Content Focus
            </legend>
            <div className="grid grid-cols-4 lg:grid-cols-7 gap-1.5">
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
          <fieldset className="p-2 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border border-tron-cyan/20 rounded-lg lg:col-span-2 hover:border-tron-cyan/40 transition-all">
            <legend className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-tron-text">
              <Target className="w-3.5 h-3.5 text-tron-cyan" weight="duotone" />
              Call to Action
            </legend>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-1.5">
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