"use client";

import React from "react";

export const LumaSpin = () => {
  return (
    <div className="relative w-[65px] aspect-square">
      <span className="absolute rounded-[50px] animate-loaderAnim shadow-[inset_0_0_0_3px] shadow-gray-800 dark:shadow-gray-100" />
      <span 
        className="absolute rounded-[50px] animate-loaderAnim shadow-[inset_0_0_0_3px] shadow-gray-800 dark:shadow-gray-100" 
        style={{ animationDelay: '-1.25s' }}
      />
    </div>
  );
};
