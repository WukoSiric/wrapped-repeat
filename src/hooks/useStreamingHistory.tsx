import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { StreamingHistory } from "../types/StreamingHistory";
import { useFiles } from "./useFiles";
import {
  GlobalVariableBuilder,
  type GlobalVariableBuilderResult,
} from "../helpers/GlobalVariableBuilder";
import { truncateGlobalVariables } from "../helpers/globalVariableHelper";
import type { StreamingHistoryResponse } from "../types/WorkerMessage";

type StreamingHistoryContextValue = {
  streamingHistory: StreamingHistory[];
  globalVariables: GlobalVariableBuilderResult;
  globalVariablesDisplay: GlobalVariableBuilderResult;
  setStreamingHistory: Dispatch<SetStateAction<StreamingHistory[]>>;
  years: number[];
};

const StreamingHistoryContext =
  createContext<StreamingHistoryContextValue | null>(null);

export const StreamingHistoryProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [streamingHistory, setStreamingHistory] = useState<StreamingHistory[]>(
    [],
  );

  const [years, setYears] = useState<number[]>([]);
  const { files } = useFiles();

  // Import and parse files to StreamingHistory[] in streamingHistoryWorker.ts
  useEffect(() => {
    if (!files.length) {
      setStreamingHistory([]);
      return;
    }

    const worker = new Worker(
      new URL("../workers/streamingHistoryWorker.ts", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = (event: MessageEvent<StreamingHistoryResponse>) => {
      setStreamingHistory(event.data.streamingHistory);
      setYears(event.data.years);
      worker.terminate();
    };

    worker.onerror = () => {
      worker.terminate();
    };

    worker.postMessage({ files });

    return () => {
      worker.terminate();
    };
  }, [files]);

  const globalVariables = useMemo(() => {
    const globalVariableBuilder = new GlobalVariableBuilder(streamingHistory);

    const globalVariables = globalVariableBuilder
      .addYearlyAggregate()
      .addHalfAggregate()
      .addQuarterlyAggregate()
      .addYearOverYearAggregate()
      .build();

    return globalVariables;
  }, [streamingHistory]);

  // const globalVariables = {};

  const globalVariablesDisplay = useMemo(
    () => truncateGlobalVariables(globalVariables, 10),
    [globalVariables],
  );

  const value = useMemo(
    () => ({
      streamingHistory,
      globalVariables,
      globalVariablesDisplay,
      setStreamingHistory,
      years,
    }),
    [globalVariables, globalVariablesDisplay, streamingHistory, years],
  );

  return (
    <StreamingHistoryContext.Provider value={value}>
      {children}
    </StreamingHistoryContext.Provider>
  );
};

export const useStreamingHistory = () => {
  const context = useContext(StreamingHistoryContext);

  if (!context) {
    throw new Error(
      "useStreamingHistory must be used inside a StreamingHistoryProvider",
    );
  }

  return context;
};
