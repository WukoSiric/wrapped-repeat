export const DynamicSpacer = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="group flex w-1/3 justify-center py-2 transition-[padding] duration-300 hover:py-4">
      <div className="hidden opacity-0 transition-opacity duration-300 group-hover:block group-hover:opacity-100">
        {children}
      </div>
    </div>
  );
};
