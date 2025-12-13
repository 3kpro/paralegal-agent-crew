"use client";

import React from "react";

export const LumaSpin = () => {
  return (
    <div className="relative w-[65px] aspect-square">
      <span className="absolute rounded-full animate-loaderAnim shadow-[inset_0_0_0_3px] shadow-coral-500" />
      <span 
        className="absolute rounded-full animate-loaderAnim shadow-[inset_0_0_0_3px] shadow-coral-500" 
        style={{ animationDelay: '-1.25s' }}
      />
    </div>
  );
};
