import { Input } from "@headlessui/react";

interface SearchProps {
  onChange?: (searchTerm: string) => void;
}

export const Search = ({ onChange }: SearchProps) => {
  return (
    <Input
      name="slide-search"
      placeholder="Search slides..."
      className="text-primary-text placeholder:text-primary-surface-accent border-primary-surface-highlight bg-primary-surface w-full rounded-xl border px-4 py-2 focus:outline-none"
      onChange={(e) => {
        onChange?.(e.currentTarget.value);
      }}
    />
  );
};
