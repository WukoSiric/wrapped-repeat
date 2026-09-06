import { Input } from "@headlessui/react";
import { Card } from "../components/Card";
import Heading from "../components/Heading";
import { Icon } from "../components/Icon";
import { useModal } from "../hooks/useModal";
import { Pill } from "../components/Pill";

const UploadedFile = ({ title }: { title: string }) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <Icon name="audio_file" className="text-primary-accent" size={24} />
      <div className="bg-secondary-surface border-secondary-surface w-full rounded-xl border px-2 py-1">
        <p className="text-primary-text text-s select-none">{title}</p>
      </div>
    </div>
  );
};

export const ImportData = () => {
  const { closeModal } = useModal();

  return (
    <Card className="h-full">
      <div className="flex flex-col items-center gap-8 p-4">
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

        <div className="flex w-full flex-row gap-4">
          {/*  Upload Button */}
          <label className="text-primary-text flex w-fit cursor-pointer flex-col items-center gap-2">
            <Icon
              className="border-primary-text flex aspect-square items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors hover:bg-black"
              name="upload"
              size={96}
            />
            <p>Drag And Drop or Browse</p>
            <Input type="file" className="sr-only" />
          </label>
          {/* Uploaded Files */}
          <div className="flex w-full flex-col gap-2">
            <div className="flex flex-row gap-2">
              <Heading variant="XL">Years: </Heading>
              <div className="flex flex-row gap-2">
                <Pill
                  enabled={true}
                  allowToggle={false}
                  className="cursor-default py-0"
                >
                  2020
                </Pill>
                <Pill
                  enabled={true}
                  allowToggle={false}
                  className="cursor-default py-0"
                >
                  2021
                </Pill>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <UploadedFile title="File 1" />
              <UploadedFile title="File 2" />
              <UploadedFile title="File 3" />
              <UploadedFile title="File 4" />
              <UploadedFile title="File 5" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
