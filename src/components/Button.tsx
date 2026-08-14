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
      className="w-full flex gap-2 cursor-pointer hover:bg-primary-accent-hover rounded-lg bg-primary-accent px-4 py-1 text-l font-medium text-primary-text transition-all ease-in-out select-none "
      {...props}
    >

        {leftIcon && (
          <Icon
            name={leftIcon}
            defaultStylingOverrides="h-5 w-5 shrink-0"
          />
        )}
        <span className="flex-1">{children}</span>

    </HeadlessUIButton>
  );
};
