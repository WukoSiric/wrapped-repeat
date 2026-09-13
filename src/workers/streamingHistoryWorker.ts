import type {
  StreamingHistoryRequest,
  StreamingHistoryResponse,
} from "../types/WorkerMessage";
import {
  extractYears,
  importStreamingHistory,
} from "../helpers/streamingHistoryHelper";
import type { StreamingHistoryJson } from "../types/StreamingHistory";
import { GlobalVariableBuilder } from "../helpers/GlobalVariableBuilder";

/*
 * Takes in files, and parses them into StreamingHistory[]
 */
self.onmessage = async (event: StreamingHistoryRequest) => {
  const { files } = event.data;

  try {
    // Parse streamingHistoryFiles into JSON
    const parsedHistory = await Promise.all(
      files.map(async (file) => {
        const json = JSON.parse(await file.text()) as StreamingHistoryJson[];

        if (!Array.isArray(json)) {
          throw new Error(`${file.name} does not contain a JSON array.`);
        }

        return importStreamingHistory(json);
      }),
    );

    //Build response
    const streamingHistory = parsedHistory.flat();
    const years = extractYears(streamingHistory);

    const globalVariableBuilder = new GlobalVariableBuilder(streamingHistory);
    const globalVariables = globalVariableBuilder
      .addYearlyAggregate()
      .addHalfAggregate()
      .addQuarterlyAggregate()
      .addYearOverYearAggregate()
      .build();

    const response: StreamingHistoryResponse = {
      streamingHistory: streamingHistory,
      years: years,
      globalVariables: globalVariables,
    };

    self.postMessage(response);
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : "Import failed",
    });
  }
};
