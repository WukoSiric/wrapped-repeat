import React from "react";

import { Icon } from "./Icon";
import Heading from "./Heading";
import { Pill } from "./Pill";
import { twMerge } from "tailwind-merge";

interface SlideProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  slideType: "award" | "transition";
  active?: boolean;
  onClick?: () => void;
}

export const Slide = ({
  title,
  description,
  slideType,
  active,
}: SlideProps) => {
  return (
    <div
      className={twMerge(
        "bg-primary-surface hover:bg-secondary-surface border-secondary-surface text-primary-text flex w-full cursor-pointer flex-row items-center justify-between rounded-lg border px-4 py-2 select-none",
        active && "bg-secondary-surface border-secondary-accent",
      )}
      onClick={() => {
        // TODO: Handle click event
      }}
    >
      <div className="flex flex-col gap-1">
        <Heading className="flex-1">{title}</Heading>
        <div className="flex flex-row items-center gap-1">
          {slideType === "award" ? (
            <Pill className="py-0" enabled={true} allowToggle={false}>
              Award
            </Pill>
          ) : (
            <Pill
              className="bg-primary-surface py-0"
              enabled={true}
              allowToggle={false}
            >
              Transition
            </Pill>
          )}
          <p className="min-w-0 flex-1 truncate">{description}</p>
        </div>
      </div>
      <Icon name="reorder_horizontal" className="h-6 w-6 p-1" />
    </div>
  );
};
