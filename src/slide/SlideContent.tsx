import { Textarea } from "@headlessui/react";
import Heading from "../components/Heading";
import { Editor } from "@monaco-editor/react";
import { Card } from "../components/Card";
import { useEffect, useMemo, useState } from "react";
import { useStreamingHistory } from "../hooks/useStreamingHistory";
import { debounce } from "lodash";
import { registerMonacoTransformTypes } from "../helpers/monacoTransformTypes";
import { Pill } from "../components/Pill";
import "../assets/css/SlideContent.css";
import ReactJson from "@microlink/react-json-view";
import type { ResultRequest, ResultResponse } from "../types/WorkerMessage";

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
  const [slideConfiguration, setSlideConfiguration] = useState(editorContent);

  const { globalVariables, streamingHistory } = useStreamingHistory();
  const [result, setResult] = useState({});

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

    worker.onmessage = (event: ResultResponse) => {
      setResult(event.data.result ?? "");
      worker.terminate();
    };

    worker.onerror = (event: ErrorEvent) => {
      event.stopPropagation();
      setResult({ error: event.message });
      worker.terminate();
    };

    const resultRequest: ResultRequest = {
      code: slideConfiguration,
      globalVariables,
      streamingHistory,
    };

    worker.postMessage(resultRequest);

    return () => {
      worker.terminate();
    };
  }, [slideConfiguration, globalVariables, streamingHistory]);

  const columnsToShowcase = useMemo(() => {
    if (!Array.isArray(result)) {
      return;
    }

    if (!result?.[0]) {
      return;
    }

    const columns = Object.keys(result[0]);

    return columns.map((columnName) => {
      return (
        <Pill key={columnName} className="py-0">
          {columnName}
        </Pill>
      );
    });
  }, [result]);

  return (
    <Card className="slideContent flex h-full flex-col">
      <Heading className="header" variant="4XL">
        {title}
      </Heading>
      <div className="description flex flex-col gap-1">
        <Heading variant="XL">Description</Heading>
        <Textarea
          className="outline-tertiary-highlight border-primary-surface-highlight bg-secondary-surface text-primary-text outline-primary-surface-highlight w-full rounded-lg p-2 outline-1"
          defaultValue={description}
        />
      </div>
      <div className="input flex min-h-0 w-full flex-col">
        <Heading variant="L">Input</Heading>
        <Editor
          theme="vs-dark"
          className="outline-tertiary-highlight bg-primary-surface absolute h-full rounded-l"
          options={{
            minimap: { enabled: false },
            automaticLayout: true,
            fontSize: 13,
          }}
          defaultValue={editorContent}
          defaultLanguage="javascript"
          beforeMount={(monaco) => {
            registerMonacoTransformTypes(monaco);
          }}
          onChange={(value) => {
            if (!value) {
              return;
            }

            debouncedSetSlideConfiguration(value);
          }}
        />
      </div>
      <div className="result flex w-full flex-col overflow-auto">
        <Heading variant="L">Result</Heading>
        <div className="max-h-full overflow-y-scroll rounded-lg">
          <ReactJson
            quotesOnKeys={false}
            indentWidth={2}
            src={result}
            theme={"eighties"}
            name={false}
            collapsed={2}
            displayArrayKey={false}
            style={{
              backgroundColor: "var(--color-primary-surface)",
            }}
          />
        </div>
      </div>
      <div className="columns flow-row flex gap-2">
        <Heading className="min-w-fit" variant="XL">
          Columns to showcase:
        </Heading>
        <div className="flex flex-row flex-wrap gap-2">{columnsToShowcase}</div>
      </div>
    </Card>
  );
};
