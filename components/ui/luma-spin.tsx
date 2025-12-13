"use client";

import React from "react";

export const LumaSpin = () => {
  return (
    <div className="relative w-[65px] aspect-square">
      <span className="absolute rounded-[50px] animate-loaderAnim shadow-[inset_0_0_0_3px] shadow-coral-500 dark:shadow-cyan-400" />
      <span 
        className="absolute rounded-[50px] animate-loaderAnim shadow-[inset_0_0_0_3px] shadow-coral-500 dark:shadow-cyan-400" 
        style={{ animationDelay: '-1.25s' }}
      />
    </div>
  );
};
