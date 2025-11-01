/**
 * ContentSettings Component
 * 
 * Comprehensive content settings panel for campaign generation.
 * Includes creativity slider and all content control options.
 * Memoized to prevent unnecessary re-renders.
 */

import React, { memo, useMemo, useCallback, useRef, useEffect } from "react";
import { Settings, Settings2, Sparkles, Target, Users, MessageSquare } from "lucide-react";
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
      <div className="space-y-6 p-8 bg-tron-dark/30 backdrop-blur-xl border-2 border-tron-grid rounded-3xl">
        {/* Header */}
        <h3 className="text-lg font-semibold text-tron-text flex items-center gap-2">
          <Settings className="w-5 h-5 text-tron-cyan" />
          Content Settings
        </h3>

        {/* Main Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Creativity Slider */}
          <CreativitySlider
            value={controls.temperature}
            onChange={handleTemperatureChange}
          />

          {/* Content Length */}
          <fieldset className="p-6 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl hover:border-tron-cyan/50 transition-all">
            <legend className="flex items-center gap-2 mb-4 font-semibold text-tron-text">
              <Settings2 className="w-5 h-5 text-tron-cyan" />
              Content Length
            </legend>
            <div className="flex gap-2">
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
          <fieldset className="p-6 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl md:col-span-2 hover:border-tron-cyan/50 transition-all">
            <legend className="flex items-center gap-2 mb-4 font-semibold text-tron-text">
              <Sparkles className="w-5 h-5 text-tron-cyan" />
              Content Tone
            </legend>
            <div className="flex flex-wrap gap-3">
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

          {/* Target Audience */}
          <fieldset className="p-6 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl md:col-span-2 hover:border-tron-cyan/50 transition-all">
            <legend className="flex items-center gap-2 mb-4 font-semibold text-tron-text">
              <Users className="w-5 h-5 text-tron-cyan" />
              Target Audience
            </legend>
            <div className="flex flex-wrap gap-3">
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

          {/* Content Focus */}
          <fieldset className="p-6 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl md:col-span-2 hover:border-tron-cyan/50 transition-all">
            <legend className="flex items-center gap-2 mb-4 font-semibold text-tron-text">
              <MessageSquare className="w-5 h-5 text-tron-cyan" />
              Content Focus
            </legend>
            <div className="flex flex-wrap gap-3">
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

          {/* Call to Action */}
          <fieldset className="p-6 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl md:col-span-2 hover:border-tron-cyan/50 transition-all">
            <legend className="flex items-center gap-2 mb-4 font-semibold text-tron-text">
              <Target className="w-5 h-5 text-tron-cyan" />
              Call to Action
            </legend>
            <div className="flex flex-wrap gap-3">
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