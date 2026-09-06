import { type PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export const Card = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return (
    <div
      className={twMerge(
        "bg-primary-surface border-primary-surface-highlight h-fit w-full rounded-xl border p-8",
        className,
      )}
    >
      {children}
    </div>
  );
};
