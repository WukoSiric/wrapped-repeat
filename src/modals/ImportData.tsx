import { Input } from "@headlessui/react";
import { useState } from "react";
import { Card } from "../components/Card";
import Heading from "../components/Heading";
import { Icon } from "../components/Icon";
import { useModal } from "../hooks/useModal";
import { Pill } from "../components/Pill";
import { importStreamingHistory } from "../helpers/streamingHistoryHelper";
import type {
  StreamingHistory,
  StreamingHistoryJson,
} from "../types/StreamingHistory";
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [history, setHistory] = useState<StreamingHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    try {
      const selectedFiles = Array.from(files);
      const parsedHistory = await Promise.all(
        selectedFiles.map(async (file) => {
          const json = JSON.parse(await file.text()) as StreamingHistoryJson[];

          if (!Array.isArray(json)) {
            throw new Error(`${file.name} does not contain a JSON array.`);
          }

          return importStreamingHistory(json);
        }),
      );

      setUploadedFiles(selectedFiles);
      setHistory(parsedHistory.flat());
      setError(null);
    } catch {
      setError("One or more files could not be imported.");
    }
  };

  return (
    <Card className="h-full max-h-full min-h-0 overflow-hidden">
      <div className="flex h-full min-h-0 flex-col items-center gap-8 p-4">
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

        <div className="flex min-h-0 w-full flex-1 flex-row gap-4">
          {/*  Upload Button */}
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
          {/* Uploaded Files */}
          <div className="flex min-h-0 w-full flex-1 flex-col gap-2">
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
                <Button
                  onClick={() => {
                    console.log(history);
                  }}
                >
                  Log history
                </Button>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
              {uploadedFiles.map((file) => (
                <UploadedFile key={file.name} title={file.name} />
              ))}
              {history.length > 0 && (
                <p className="text-primary-text text-sm">
                  Imported {history.length} listening records
                </p>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
