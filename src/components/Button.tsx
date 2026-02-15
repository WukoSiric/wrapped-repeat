import { Button as HeadlessUIButton } from "@headlessui/react";
import { Icon } from "./Icon";
import type { HTMLAttributes } from "react";

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  leftIcon?: string;
}

export const Button = ({
  leftIcon,
  children,
  ...props
}: React.PropsWithChildren<ButtonProps>) => {
  return (
    <HeadlessUIButton
      className="group w-fit cursor-pointer rounded-xl border border-primary-surface-accent bg-primary-surface px-4 py-1 text-xl font-medium text-primary-text transition-all ease-in-out select-none hover:border-accent-surface"
      {...props}
    >
      <div className="flex items-center gap-2">
        {leftIcon && (
          <Icon
            name={leftIcon}
            className="group-hover:text-accent-surface"
            defaultStylingOverrides=""
          />
        )}
        <span className="group-hover:text-accent-surface">{children}</span>
      </div>
    </HeadlessUIButton>
  );
};
