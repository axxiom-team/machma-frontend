"use client";

import React from "react";
import { cn } from "@/lib/utils"; // optional: utility for classNames
import { LucideIcon } from "lucide-react";
import { ChevronDown, ChevronRight } from "lucide-react";


interface SidebarItemProps {
  title: string;
  icon?: LucideIcon;
  onClick?: () => void;
  active?: boolean;
  small?: boolean; // for submenu items
  expandable?: boolean; // parent with submenu
  expanded?: boolean; // if submenu is open
  children?: React.ReactNode;
  className?: string;
}

export function SidebarItem({
  title,
  icon: Icon,
  onClick,
  active = false,
  small = false,
  expandable = false,
  expanded = false,
  children,
  className,
}: SidebarItemProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-md text-left hover:bg-gray-100 transition-colors",
          active ? "bg-gray-200 font-semibold" : "font-normal",
          small ? "text-sm" : "text-base"
        )}
      >
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="h-4 w-4" />}
          <span>{title}</span>
        </div>
        {expandable && (
          <span>{expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>
        )}
      </button>
      {children}
    </div>
  );
}
