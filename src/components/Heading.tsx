import React, { useCallback } from "react";

export interface HeadingProps {
  variant?: "4XL" | "3XL" | "2XL" | "XL" | "L" | "R";
  children: React.ReactNode;
  props?: React.HTMLAttributes<HTMLHeadingElement>;
}

const Heading = ({ variant = "XL", children, ...props }: HeadingProps) => {
  const renderHeading = useCallback(() => {
    switch (variant) {
      case "4XL":
        return (
          <h1 className="text-4xl font-bold text-primary-text" {...props}>
            {children}
          </h1>
        );
      case "3XL":
        return (
          <h1 className="text-3xl font-bold text-primary-text" {...props}>
            {children}
          </h1>
        );
      case "2XL":
        return (
          <h1 className="text-2xl font-bold text-primary-text" {...props}>
            {children}
          </h1>
        );
      case "XL":
        return (
          <h1 className="text-xl font-bold text-primary-text" {...props}>
            {children}
          </h1>
        );
      case "L":
        return (
          <h2
            className="text-l font-regular font-sans text-primary-text"
            {...props}
          >
            {children}
          </h2>
        );
      case "R":
        return (
          <h3
            className="text-m font-regular font-sans text-primary-text"
            {...props}
          >
            {children}
          </h3>
        );
      default:
        return (
          <h1 className="text-2xl font-bold text-primary-text" {...props}>
            {children}
          </h1>
        );
    }
  }, [variant, children, props]);

  return <>{renderHeading()}</>;
};

export default Heading;
