"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

export const useResizePanel = ({
  defaultSize,
  minSize,
  maxSize,
  direction,
  inverted = false,
  storageId,
}: {
  defaultSize: number;
  minSize: number;
  maxSize: number;
  direction: "horizontal" | "vertical";
  inverted?: boolean;
  storageId: string;
}) => {
  const [size, setSize] = useLocalStorage<number>(storageId, defaultSize);
  const [isResizing, setIsResizing] = useState(false);

  const clientXRef = useRef<number | null>(null);
  const clientYRef = useRef<number | null>(null);

  useEffect(() => {
    if (size <= maxSize) return;
    setSize(maxSize);
  }, [size, maxSize, setSize]);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (clientXRef === null || clientYRef === null) return;

      const deltaX = event.clientX - clientXRef.current!;
      const deltaY = event.clientY - clientYRef.current!;
      const delta = direction === "horizontal" ? deltaX : deltaY;

      let newSize = inverted ? size - delta : size + delta;
      if (newSize < minSize) newSize = minSize;
      if (newSize > maxSize) newSize = maxSize;
      setSize(newSize);
    },
    [direction, inverted, maxSize, minSize, setSize, size]
  );

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      clientXRef.current = null;
      clientYRef.current = null;
      setIsResizing(false);

      document.body.style.cursor = "default";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    },
    [handleMouseMove]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      clientXRef.current = event.clientX;
      clientYRef.current = event.clientY;
      setIsResizing(true);

      document.body.style.cursor = direction === "horizontal" ? "ew-resize" : "ns-resize";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [direction, handleMouseMove, handleMouseUp]
  );

  return {
    size,
    isResizing,
    resizeHandleProps: {
      onMouseDown: handleMouseDown,
    },
  };
};
