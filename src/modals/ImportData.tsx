import { Input } from "@headlessui/react";
import { useCallback, useMemo } from "react";
import { Card } from "../components/Card";
import Heading from "../components/Heading";
import { Icon } from "../components/Icon";
import { useModal } from "../hooks/useModal";
import { useStreamingHistory } from "../hooks/useStreamingHistory";
import { useFiles } from "../hooks/useFiles";
import { Pill } from "../components/Pill";
import { extractYears } from "../helpers/streamingHistoryHelper";
import { Button } from "../components/Button";

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
  const { streamingHistory, error } = useStreamingHistory();
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
    const years = extractYears(streamingHistory);

    return (
      <div className="flex flex-row gap-2">
        <Heading variant="XL">Years: </Heading>
        <div className="flex flex-row gap-2">
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

  const uploadButton = useMemo(
    () => (
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
    ),
    [handleFileUpload],
  );

  const heading = useMemo(() => {
    return (
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
    );
  }, [closeModal]);

  return (
    <Card className="h-full max-h-full overflow-hidden">
      <div className="flex h-full min-h-0 flex-col items-center gap-8 p-4">
        {heading}
        <div className="flex min-h-0 w-full flex-row gap-4">
          {uploadButton}
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

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
