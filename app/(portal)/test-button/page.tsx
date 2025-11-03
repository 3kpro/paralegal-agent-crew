"use client";

import { InteractiveHoverButton } from "@/components/ui";

export default function TestButtonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-tron-dark via-tron-grid to-tron-dark p-8 flex flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold text-tron-text mb-8">
        Interactive Button Test
      </h1>

      <div className="space-y-6 w-full max-w-2xl">
        <div className="bg-tron-dark/50 p-8 rounded-3xl border-2 border-tron-cyan/30">
          <h2 className="text-xl font-semibold text-tron-cyan mb-4">
            Primary Variant
          </h2>
          <InteractiveHoverButton
            text="Generate Content"
            variant="primary"
            className="w-full"
          />
        </div>

        <div className="bg-tron-dark/50 p-8 rounded-3xl border-2 border-tron-cyan/30">
          <h2 className="text-xl font-semibold text-tron-cyan mb-4">
            Secondary Variant
          </h2>
          <InteractiveHoverButton
            text="Save for Later"
            variant="secondary"
            className="w-full"
          />
        </div>

        <div className="bg-tron-dark/50 p-8 rounded-3xl border-2 border-tron-cyan/30">
          <h2 className="text-xl font-semibold text-tron-cyan mb-4">
            Outline Variant
          </h2>
          <InteractiveHoverButton
            text="Learn More"
            variant="outline"
            className="w-full"
          />
        </div>

        <div className="bg-tron-dark/50 p-8 rounded-3xl border-2 border-tron-cyan/30">
          <h2 className="text-xl font-semibold text-tron-cyan mb-4">
            Hover over any button above to see the effect:
          </h2>
          <ul className="text-tron-text-muted space-y-2 list-disc list-inside">
            <li>Text slides out to the right</li>
            <li>New text + arrow slides in from the right</li>
            <li>Background expands from a small dot to fill the button</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
