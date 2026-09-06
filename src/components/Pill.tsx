import React, { useState } from "react";
import { twMerge } from "tailwind-merge";

interface PillProps {
  className?: string;
  enabled?: boolean;
  onClick?: () => void;
  allowToggle?: boolean;
}

export const Pill = ({
  className,
  enabled: isActive,
  onClick,
  allowToggle = true,
  children,
}: React.PropsWithChildren<PillProps>) => {
  const [active, setActive] = useState(isActive ?? false);
  return (
    <div
      className={twMerge(
        "text-primary-text border-secondary-surface bg-primary-surface flex max-w-fit cursor-pointer items-center rounded-xl border-2 px-2 py-1 font-medium transition-all ease-in-out select-none",
        active && "bg-secondary-accent border-secondary-accent",
        className,
      )}
      onClick={() => {
        onClick?.();
        if (allowToggle) {
          setActive(!active);
        }
      }}
    >
      {children}
    </div>
  );
};
