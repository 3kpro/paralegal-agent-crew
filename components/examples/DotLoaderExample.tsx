"use client";

import { DotLoader } from "@/components/ui";
import { useState } from "react";

/**
 * DotLoaderExample Component
 * 
 * Demonstrates various ways to use the DotLoader component
 * with different frame patterns and configurations
 */

// Simple loading animation pattern
const loadingPattern = [
    [24],           // Center
    [17, 31],       // Vertical line
    [10, 24, 38],   // Expanding vertical
    [3, 17, 31, 45],// Full vertical column
];

// Pulsing effect
const pulsingPattern = [
    [24],                                              // Center
    [17, 24, 31],                                      // Ring 1
    [10, 17, 24, 31, 38],                              // Ring 2
    [3, 10, 17, 24, 31, 38, 45],                       // Ring 3
    [10, 17, 24, 31, 38],                              // Ring 2
    [17, 24, 31],                                      // Ring 1
];

// Corner moving pattern
const cornerPattern = [
    [0],
    [1],
    [2],
    [9],
    [16],
    [23],
    [30],
    [37],
    [44],
    [45],
    [46],
    [39],
    [32],
    [25],
    [18],
    [11],
    [4],
];

export function DotLoaderExample() {
    const [isPlaying, setIsPlaying] = useState(true);

    return (
        <div className="space-y-12 p-8 bg-gradient-to-br from-slate-900 to-slate-800">
            <div>
                <h1 className="text-3xl font-bold text-white mb-8">DotLoader Examples</h1>

                {/* Controls */}
                <div className="mb-8">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
                    >
                        {isPlaying ? "Pause All" : "Play All"}
                    </button>
                </div>

                {/* Example 1: Simple Loading Animation */}
                <div className="mb-12 p-6 bg-slate-800 rounded-lg border border-slate-700">
                    <h2 className="text-xl font-semibold text-white mb-6">Simple Loading Animation</h2>
                    <div className="flex items-center gap-6">
                        <DotLoader
                            frames={loadingPattern}
                            isPlaying={isPlaying}
                            duration={150}
                            dotClassName="bg-white/20 [&.active]:bg-cyan-400 size-2"
                            className="gap-1"
                        />
                        <p className="text-slate-300">Loading content...</p>
                    </div>
                </div>

                {/* Example 2: Pulsing Effect */}
                <div className="mb-12 p-6 bg-slate-800 rounded-lg border border-slate-700">
                    <h2 className="text-xl font-semibold text-white mb-6">Pulsing Effect</h2>
                    <div className="flex items-center gap-6">
                        <DotLoader
                            frames={pulsingPattern}
                            isPlaying={isPlaying}
                            duration={100}
                            dotClassName="bg-gray-600 [&.active]:bg-magenta-400 size-2 rounded"
                            className="gap-1"
                        />
                        <p className="text-slate-300">Processing...</p>
                    </div>
                </div>

                {/* Example 3: Corner Moving Pattern */}
                <div className="mb-12 p-6 bg-slate-800 rounded-lg border border-slate-700">
                    <h2 className="text-xl font-semibold text-white mb-6">Corner Pattern</h2>
                    <div className="flex items-center gap-6">
                        <DotLoader
                            frames={cornerPattern}
                            isPlaying={isPlaying}
                            duration={50}
                            dotClassName="bg-yellow-600 [&.active]:bg-yellow-300 size-1.5"
                            className="gap-2"
                        />
                        <p className="text-slate-300">Animating...</p>
                    </div>
                </div>

                {/* Example 4: Game of Life */}
                <div className="mb-12 p-6 bg-slate-800 rounded-lg border border-slate-700">
                    <h2 className="text-xl font-semibold text-white mb-6">Game of Life Style</h2>
                    <div className="flex items-center gap-6">
                        <DotLoader
                            frames={[
                                [14, 7, 0, 8, 6, 13, 20],
                                [14, 7, 13, 20, 16, 27, 21],
                                [14, 20, 27, 21, 34, 24, 28],
                                [27, 21, 34, 28, 41, 32, 35],
                            ]}
                            isPlaying={isPlaying}
                            duration={100}
                            dotClassName="bg-white/15 [&.active]:bg-white size-1.5"
                            className="gap-0.5"
                        />
                        <p className="text-slate-300">Game running...</p>
                    </div>
                </div>

                {/* Example 5: Limited Repetitions */}
                <div className="mb-12 p-6 bg-slate-800 rounded-lg border border-slate-700">
                    <h2 className="text-xl font-semibold text-white mb-6">Limited Repetitions (3x)</h2>
                    <div className="flex items-center gap-6">
                        <DotLoader
                            frames={loadingPattern}
                            isPlaying={isPlaying}
                            duration={150}
                            repeatCount={3}
                            onComplete={() => console.log("Animation complete!")}
                            dotClassName="bg-red-600 [&.active]:bg-red-300 size-2"
                            className="gap-1"
                        />
                        <p className="text-slate-300">Limited animation...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DotLoaderExample;