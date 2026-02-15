import React, { useCallback } from "react";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  variant?: "4XL" | "3XL" | "2XL" | "XL" | "L" | "R";
  children: React.ReactNode;
}

const Heading = ({
  variant = "XL",
  className,
  children,
  ...rest
}: HeadingProps) => {
  const renderHeading = useCallback(() => {
    switch (variant) {
      case "4XL":
        return (
          <h1
            className={`text-4xl font-bold ${className} text-primary-text`}
            {...rest}
          >
            {children}
          </h1>
        );
      case "3XL":
        return (
          <h1
            className={`text-3xl font-bold ${className} text-primary-text`}
            {...rest}
          >
            {children}
          </h1>
        );
      case "2XL":
        return (
          <h1
            className={`text-2xl font-bold ${className} text-primary-text`}
            {...rest}
          >
            {children}
          </h1>
        );
      case "XL":
        return (
          <h1
            className={`text-xl font-bold ${className} text-primary-text`}
            {...rest}
          >
            {children}
          </h1>
        );
      case "L":
        return (
          <h2
            className={`text-l font-regular ${className} font-sans text-primary-text`}
            {...rest}
          >
            {children}
          </h2>
        );
      case "R":
        return (
          <h3
            className={`text-m font-regular ${className} font-sans text-primary-text`}
            {...rest}
          >
            {children}
          </h3>
        );
      default:
        return (
          <h1
            className={`text-2xl font-bold ${className} text-primary-text`}
            {...rest}
          >
            {children}
          </h1>
        );
    }
  }, [variant, children, rest, className]);

  return <>{renderHeading()}</>;
};

export default Heading;
