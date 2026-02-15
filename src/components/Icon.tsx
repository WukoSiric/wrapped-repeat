interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  defaultStylingOverrides?: string;
}

export const Icon = ({
  name,
  defaultStylingOverrides,
  className,
  ...rest
}: IconProps) => {
  return (
    <span
      className={`material-icons ${defaultStylingOverrides !== undefined ? defaultStylingOverrides : "text-9xl text-primary-surface-accent"} select-none ${className}`}
      {...rest}
    >
      {name}
    </span>
  );
};
