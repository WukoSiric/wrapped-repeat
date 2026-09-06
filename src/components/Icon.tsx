import { twMerge } from "tailwind-merge";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: number;
  className?: string;
}

export const Icon = ({ name, size, className, style, ...rest }: IconProps) => {
  return (
    <span
      className={twMerge(
        "material-icons",
        "text-primary-surface-accent text-9xl",
        "select-none",
        className,
      )}
      {...rest}
      style={{ ...style, ...(size ? { fontSize: `${size}px` } : {}) }}
    >
      {name}
    </span>
  );
};
