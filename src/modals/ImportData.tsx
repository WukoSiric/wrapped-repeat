import { Input } from "@headlessui/react";
import { useCallback, useMemo } from "react";
import Heading from "../components/Heading";
import { Icon } from "../components/Icon";
import { useStreamingHistory } from "../hooks/useStreamingHistory";
import { useFiles } from "../hooks/useFiles";
import { Pill } from "../components/Pill";
import { Modal } from "./Modal";
import { LoadingSpinner } from "../components/LoadingSpinner";

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

const UploadButton = ({
  handleFileUpload,
}: {
  handleFileUpload: (fileList: FileList | null) => void;
}) => {
  return (
    <label className="text-primary-text flex w-fit cursor-pointer flex-col items-center gap-2">
      <Icon
        className="border-primary-text flex aspect-square items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors hover:bg-black"
        name="upload"
        size={96}
      />
      <p>Drag And Drop or Browse</p>
      <Input
        type="file"
        accept=".json,application/json"
        multiple
        className="sr-only"
        onChange={(event) => handleFileUpload(event.currentTarget.files)}
      />
    </label>
  );
};

export const ImportData = () => {
  const { streamingHistory, years } = useStreamingHistory();
  const { files, setFiles } = useFiles();

  const handleFileUpload = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) {
        return;
      }
      setFiles(Array.from(fileList));
    },
    [setFiles],
  );

  const yearsSection = useMemo(() => {
    return (
      <div className="flex flex-row gap-2">
        <Heading variant="XL">Years: </Heading>
        <div className="flex flex-row flex-wrap gap-2">
          {years.map((year) => (
            <Pill
              key={year}
              enabled={true}
              allowToggle={false}
              className="cursor-default py-0"
            >
              {year}
            </Pill>
          ))}
        </div>
      </div>
    );
  }, [streamingHistory]);

  return (
    <Modal title="Import Data">
      <UploadButton handleFileUpload={handleFileUpload} />
      <div className="flex min-h-0 w-full flex-1 flex-col gap-2">
        {yearsSection}
        {streamingHistory.length > 0 && (
          <p className="text-primary-text text-md">
            Imported {streamingHistory.length} listening records
          </p>
        )}
        <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
          {files.map((file) => (
            <UploadedFile key={file.name} title={file.name} />
          ))}
        </div>
      </div>
    </Modal>
  );
};
