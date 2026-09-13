import type { GlobalVariableBuilderResult } from "../helpers/GlobalVariableBuilder";
import type { StreamingHistory } from "./StreamingHistory";

export type ResultRequest = {
  code: string;
  globalVariables: GlobalVariableBuilderResult;
  streamingHistory: StreamingHistory[];
};

export type ResultResponse = MessageEvent<{ result: string }>;

export type StreamingHistoryRequest = MessageEvent<{ files: File[] }>;

export type StreamingHistoryResponse = {
  streamingHistory: StreamingHistory[];
  years: number[];
  globalVariables: GlobalVariableBuilderResult;
};
