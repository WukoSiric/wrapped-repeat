import { Button as HeadlessUIButton } from "@headlessui/react";
import { Icon } from "./Icon";
import { twMerge } from "tailwind-merge";
import type { HTMLAttributes } from "react";

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  leftIcon?: string;
  className?: string;
}

export const Button = ({
  leftIcon,
  className,
  children,
  ...props
}: React.PropsWithChildren<ButtonProps>) => {
  return (
    <HeadlessUIButton
      className={twMerge(
        "hover:bg-primary-accent-hover bg-primary-accent text-l text-primary-text flex w-fit cursor-pointer items-center gap-2 rounded-lg px-4 py-1 font-medium outline-0 transition-all ease-in-out select-none",
        className,
      )}
      {...props}
    >
      {leftIcon && <Icon name={leftIcon} className="h-5 w-5 shrink-0" />}
      <span className="flex-1">{children}</span>
    </HeadlessUIButton>
  );
};
