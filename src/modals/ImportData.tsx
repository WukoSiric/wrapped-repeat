import { Input } from "@headlessui/react";
import { Card } from "../components/Card";
import Heading from "../components/Heading";
import { Icon } from "../components/Icon";
import { useModal } from "../hooks/useModal";

export const ImportData = () => {
  const { closeModal } = useModal();

  return (
    <Card className="h-full">
      <div className="flex flex-col items-center p-4">
        <div className="flex w-full flex-row justify-between">
          <Heading variant="4XL">Import Data</Heading>
          <Icon
            name="close"
            className="text-primary-text cursor-pointer"
            onClick={() => {
              closeModal();
            }}
            size={36}
          />
        </div>

        <label className="text-primary-text flex w-fit cursor-pointer flex-col items-center gap-2">
          <Icon
            className="border-primary-text flex aspect-square items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors hover:bg-black"
            name="upload"
            size={96}
          />
          <p>Drag And Drop or Browse</p>
          <Input type="file" className="sr-only" />
        </label>
      </div>
    </Card>
  );
};
