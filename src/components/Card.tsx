import { type PropsWithChildren } from "react";

export const Card = ({ children }: PropsWithChildren) => {
  return (
    <div className="bg-primary-surface border-primary-surface-highlight h-fit w-full rounded-xl border p-8">
      {children}
    </div>
  );
};
