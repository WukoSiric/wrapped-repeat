import { Button as HeadlessUIButton } from "@headlessui/react";

export const Button = ({ children, ...props }: React.PropsWithChildren) => {
  return (
    <HeadlessUIButton
      className="w-fit cursor-pointer rounded-xl border-2 border-primary-surface-accent bg-primary-surface px-4 py-1 text-xl font-medium text-primary-text transition-all ease-in-out hover:scale-105"
      {...props}
    >
      <div>{children}</div>
    </HeadlessUIButton>
  );
};
