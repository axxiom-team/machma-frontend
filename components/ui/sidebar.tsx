"use client";

import React, { ReactNode } from "react";
import clsx from "clsx";

interface SidebarProps {
  children: ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <aside className="w-64 flex flex-col bg-white border-r border-gray-200 h-full">
      <div className="flex-1 flex flex-col">{children}</div>
    </aside>
  );
};

interface SidebarItemProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  active?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  expandable?: boolean;
  expanded?: boolean;
  small?: boolean;
  className?: string;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  title,
  icon: Icon,
  active = false,
  onClick,
  children,
  expandable = false,
  expanded = false,
  small = false,
  className,
}) => {
  return (
    <div>
      <button
        onClick={onClick}
        className={clsx(
          "w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-colors",
          active ? "bg-gray-100 font-medium" : "font-normal",
          small ? "text-sm" : "text-base",
          className
        )}
      >
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="h-4 w-4" />}
          <span>{title}</span>
        </div>
        {expandable && <span>{expanded ? "▼" : "▶"}</span>}
      </button>
      {children}
    </div>
  );
};
