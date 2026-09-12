import { Textarea } from "@headlessui/react";
import Heading from "../components/Heading";
import { Editor } from "@monaco-editor/react";
import { Card } from "../components/Card";
import { useEffect, useMemo, useState } from "react";
import { useStreamingHistory } from "../hooks/useStreamingHistory";
import { debounce } from "lodash";
import { MONACO_TRANSFORM_TYPES } from "../helpers/monacoTransformTypes";

interface SlideContentProps {
  title: string;
  description: string;
  editorContent: string;
}

export const SlideContent = ({
  title,
  description,
  editorContent,
}: SlideContentProps) => {
  const [slideConfiguration, setSlideConfiguration] = useState("");

  const { globalVariables, streamingHistory } = useStreamingHistory();
  const [result, setResult] = useState("");

  const debouncedSetSlideConfiguration = useMemo(
    () =>
      debounce((value: string) => {
        setSlideConfiguration(value);
      }, 1000),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedSetSlideConfiguration.cancel();
    };
  }, [debouncedSetSlideConfiguration]);

  useEffect(() => {
    if (!slideConfiguration) {
      setResult("");
      return;
    }

    const worker = new Worker(
      new URL("../workers/transformWorker.ts", import.meta.url),
      {
        type: "module",
      },
    );

    const handleMessage = (event: MessageEvent<{ result?: string }>) => {
      setResult(event.data.result ?? "");
    };

    const handleError = () => {
      setResult("");
    };

    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleError);
    worker.postMessage({
      code: slideConfiguration,
      globalVariables,
      streamingHistory,
    });

    return () => {
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleError);
      worker.terminate();
    };
  }, [slideConfiguration, globalVariables, streamingHistory]);

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <Heading variant="4XL">{title}</Heading>
        <div className="flex flex-col">
          <Heading variant="XL">Description</Heading>
          <Textarea
            className="outline-tertiary-highlight border-primary-surface-highlight bg-secondary-surface text-primary-text outline-primary-surface-highlight w-full rounded-lg p-2 outline-1"
            defaultValue={description}
          />
        </div>
        <Heading className="w-full" variant="XL">
          Transformation
        </Heading>
        <div className="flex min-h-0 flex-1 flex-col gap-0.5">
          <div className="flex min-h-0 flex-1 flex-row gap-1">
            <div className="col-span-1 flex min-h-0 w-full flex-1 flex-col">
              <Heading variant="L">Input</Heading>
              <Editor
                theme="vs-dark"
                className="outline-tertiary-highlight bg-primary-surface absolute h-full rounded-l p-2"
                options={{
                  minimap: { enabled: false },
                  automaticLayout: true,
                }}
                defaultValue={editorContent}
                defaultLanguage="javascript"
                beforeMount={(monaco) => {
                  monaco.languages.typescript.javascriptDefaults.addExtraLib(
                    MONACO_TRANSFORM_TYPES,
                    "file:///transform-types.d.ts",
                  );
                }}
                onChange={(value) => {
                  if (!value) {
                    debouncedSetSlideConfiguration("");
                    return;
                  }

                  debouncedSetSlideConfiguration(value);
                }}
              />
            </div>
            <div className="col-span-1 flex min-h-0 w-full flex-1 flex-col">
              <Heading variant="L">Result</Heading>
              <Editor
                theme="vs-dark"
                className="outline-tertiary-highlight bg-primary-surface absolute h-full rounded-l p-2"
                defaultLanguage="javascript"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  automaticLayout: true,
                }}
                value={result}
              />
            </div>
          </div>
        </div>

        <Heading variant="XL">Columns to showcase: </Heading>
      </div>
    </Card>
  );
};
