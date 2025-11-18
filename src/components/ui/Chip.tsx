import React from "react";
import clsx from "clsx";

export type ChipProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
  children: React.ReactNode;
  selected?: boolean;
  className?: string;
};

export function Chip({
  icon,
  children,
  selected,
  className,
  ...props
}: ChipProps) {
  return (
    <button
      {...props}
      type="button"
      className={clsx(
        "btn-touch inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border transition-all focus-visible:ring-2 focus-visible:ring-primary",
        selected
          ? "bg-primary text-primary-foreground border-transparent shadow"
          : "bg-white/80 border-black/10 hover:bg-white shadow-sm",
        className
      )}
      aria-pressed={selected ? "true" : "false"}
    >
      {icon}
      {children}
    </button>
  );
}
