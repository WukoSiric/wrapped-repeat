import type {
  StreamingHistoryRequest,
  StreamingHistoryResponse,
} from "../types/WorkerMessage";
import {
  extractYears,
  importStreamingHistory,
} from "../helpers/streamingHistoryHelper";
import type { StreamingHistoryJson } from "../types/StreamingHistory";

/*
 * Takes in files, and parses them into StreamingHistory[]
 */
self.onmessage = async (event: StreamingHistoryRequest) => {
  const { files } = event.data;

  try {
    const parsedHistory = await Promise.all(
      files.map(async (file) => {
        const json = JSON.parse(await file.text()) as StreamingHistoryJson[];

        if (!Array.isArray(json)) {
          throw new Error(`${file.name} does not contain a JSON array.`);
        }

        return importStreamingHistory(json);
      }),
    );

    const years = extractYears(parsedHistory.flat());

    const response: StreamingHistoryResponse = {
      streamingHistory: parsedHistory.flat(),
      years: years,
    };

    self.postMessage(response);
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : "Import failed",
    });
  }
};
