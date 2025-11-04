"use client"

import React, { useState } from "react"
import { ChevronDown } from "lucide-react"

interface MenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "left" | "right"
  showChevron?: boolean
}

export function Menu({ trigger, children, align = "left", showChevron = true }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block text-left">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer inline-flex items-center"
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen ? "true" : "false"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        {trigger}
        {showChevron && (
          <ChevronDown className="ml-2 -mr-1 h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
        )}
      </div>

      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2 w-56 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-9 focus:outline-none z-50`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface MenuItemProps {
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  icon?: React.ReactNode
  isActive?: boolean
  label?: string
}

export function MenuItem({ children, onClick, disabled = false, icon, isActive = false, label }: MenuItemProps) {
  return (
    <button
      className={`relative block w-full h-full text-center group
        ${disabled ? "text-gray-400 cursor-not-allowed" : "text-coral-400"}
        ${isActive ? "bg-white/10" : ""}
      `}
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="flex items-center justify-center h-full w-full">
        {icon && (
          <span className="transition-all duration-200 group-hover:scale-110">
            {icon}
          </span>
        )}
        {children}
      </span>
      
      {/* Hover Tooltip */}
      {label && (
        <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#2b2b2b]/95 backdrop-blur-sm border-2 border-coral-500/50 rounded-lg text-coral-400 font-semibold text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg shadow-coral-500/20 pointer-events-none z-[60]">
          {label}
          {/* Arrow pointing left */}
          <span className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-coral-500/50"></span>
        </span>
      )}
    </button>
  )
}

export function MenuContainer({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const childrenArray = React.Children.toArray(children)

  const handleToggle = () => {
    if (isExpanded) {
      setIsExpanded(false)
    } else {
      setIsExpanded(true)
    }
  }

  return (
    <div className="relative w-[72px]" data-expanded={isExpanded}>
      {/* Container for all items */}
      <div className="relative">
        {/* First item - always visible */}
        <div 
          className="relative w-[72px] h-[72px] bg-[#2b2b2b]/80 backdrop-blur-sm border-2 border-gray-700/50 cursor-pointer rounded-lg group will-change-transform z-50 hover:border-coral-500/50 transition-all shadow-lg shadow-coral-500/20"
          onClick={handleToggle}
        >
          {childrenArray[0]}
        </div>

        {/* Other items */}
        {childrenArray.slice(1).map((child, index) => (
          <div 
            key={index} 
            className="absolute top-0 left-0 w-[72px] h-[72px] bg-[#2b2b2b]/80 backdrop-blur-sm border-2 border-gray-700/50 rounded-lg will-change-transform hover:border-coral-500/50 transition-colors shadow-lg shadow-coral-500/20"
            style={{
              transform: `translateY(${isExpanded ? (index + 1) * 78 : 0}px)`,
              opacity: isExpanded ? 1 : 0,
              zIndex: 40 - index,
              transition: `transform ${isExpanded ? '300ms' : '300ms'} cubic-bezier(0.4, 0, 0.2, 1),
                         opacity ${isExpanded ? '300ms' : '350ms'}`,
              backfaceVisibility: 'hidden',
              perspective: 1000,
              WebkitFontSmoothing: 'antialiased'
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
