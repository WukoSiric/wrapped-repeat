import { twMerge } from "tailwind-merge";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  className?: string;
}

export const Icon = ({ name, className, ...rest }: IconProps) => {
  return (
    <span
      className={twMerge(
        "material-icons",
        "text-primary-surface-accent w-full text-9xl",
        "select-none",
        className,
      )}
      {...rest}
    >
      {name}
    </span>
  );
};
