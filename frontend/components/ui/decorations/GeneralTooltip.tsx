"use client";

import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useState } from "react";

interface Props {
  children: React.ReactElement;
  content: string;
  centered?: boolean;
}
export default function GeneralTooltip({ children, content, centered }: Props) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [offset(8), flip(), shift()],
    whileElementsMounted: autoUpdate,
    placement: "bottom",
  });

  const hover = useHover(context, {
    move: false,
    delay: { open: 300, close: 100 },
  });

  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    role,
  ]);

  return (
    <>
      <span
        ref={refs.setReference}
        {...getReferenceProps()}
        className={centered ? "flex items-center justify-center" : ""}
      >
        {children}
      </span>
      {open && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps}
          className="p-1 bg-tooltip-bg rounded-md text-foreground text-xs z-50"
        >
          {content}
        </div>
      )}
    </>
  );
}
