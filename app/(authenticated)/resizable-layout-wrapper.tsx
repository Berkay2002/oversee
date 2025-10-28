"use client";

import { type ReactNode, useEffect, useState, useRef } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface ResizableLayoutWrapperProps {
  children: ReactNode;
}

const SIDEBAR_WIDTH_STORAGE_KEY = "sidebar-custom-width";
const DEFAULT_SIDEBAR_WIDTH = 256; // 16rem in pixels
const MIN_SIDEBAR_WIDTH = 200; // Minimum width
const MAX_SIDEBAR_WIDTH = 400; // Maximum width

export function ResizableLayoutWrapper({ children }: ResizableLayoutWrapperProps) {
  const { state, isMobile } = useSidebar();
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load saved sidebar width from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    if (saved) {
      const parsedWidth = parseFloat(saved);
      if (!isNaN(parsedWidth) && parsedWidth >= MIN_SIDEBAR_WIDTH && parsedWidth <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(parsedWidth);
      }
    }
  }, []);

  // Update CSS variable when width changes - find the parent sidebar-wrapper
  useEffect(() => {
    if (state === "expanded" && !isMobile) {
      // Find the closest parent with data-slot="sidebar-wrapper"
      const findSidebarWrapper = () => {
        let element = containerRef.current?.parentElement;
        while (element) {
          if (element.hasAttribute('data-slot') && element.getAttribute('data-slot') === 'sidebar-wrapper') {
            return element as HTMLElement;
          }
          element = element.parentElement;
        }
        return null;
      };

      const sidebarWrapper = findSidebarWrapper();
      if (sidebarWrapper) {
        sidebarWrapper.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
      }
    }
  }, [sidebarWidth, state, isMobile]);

  // Handle mouse down on resize handle
  const handleMouseDown = (e: React.MouseEvent) => {
    if (state !== "expanded" || isMobile) return;

    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = sidebarWidth;
    let currentWidth = startWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      const newWidth = Math.min(
        Math.max(startWidth + delta, MIN_SIDEBAR_WIDTH),
        MAX_SIDEBAR_WIDTH
      );
      currentWidth = newWidth;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // Save the final width to localStorage
      localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, currentWidth.toString());
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // On mobile or when sidebar is collapsed, use simple flex layout without resize handle
  if (isMobile || state === "collapsed") {
    return <>{children}</>;
  }

  // Extract sidebar and content from children
  const childArray = Array.isArray(children) ? children : [children];
  const sidebar = childArray[0];
  const content = childArray[1];

  return (
    <div ref={containerRef} className="flex h-full w-full">
      {sidebar}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "group relative w-1 cursor-col-resize hover:bg-border transition-colors z-20",
          isResizing && "bg-border"
        )}
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px] group-hover:bg-primary/20 transition-colors" />
      </div>
      {content}
    </div>
  );
}
