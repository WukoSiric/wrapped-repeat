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
import { importStreamingHistory } from "../helpers/streamingHistoryHelper";
import type { StreamingHistoryJson } from "../types/StreamingHistory";
import { useFiles } from "./useFiles";

type StreamingHistoryContextValue = {
  streamingHistory: StreamingHistory[];
  setStreamingHistory: Dispatch<SetStateAction<StreamingHistory[]>>;
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);
  const { files } = useFiles();

  useEffect(() => {
    let cancelled = false;

    const parseFiles = async () => {
      try {
        const parsedHistory = await Promise.all(
          files.map(async (file) => {
            const json = JSON.parse(
              await file.text(),
            ) as StreamingHistoryJson[];

            if (!Array.isArray(json)) {
              throw new Error(`${file.name} does not contain a JSON array.`);
            }

            return importStreamingHistory(json);
          }),
        );

        if (!cancelled) {
          setStreamingHistory(parsedHistory.flat());
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("One or more files could not be imported.");
        }
      }
    };

    void parseFiles();

    return () => {
      cancelled = true;
    };
  }, [files]);

  const value = useMemo(
    () => ({ streamingHistory, setStreamingHistory, error }),
    [error, streamingHistory],
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
