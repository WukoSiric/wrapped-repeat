import type { GlobalVariableBuilderResult } from "../helpers/GlobalVariableBuilder";
import type { StreamingHistory } from "../types/StreamingHistory";

self.onmessage = (
  event: MessageEvent<{
    code: string;
    globalVariables: GlobalVariableBuilderResult;
    streamingHistory: StreamingHistory[];
  }>,
) => {
  const { code, globalVariables, streamingHistory } = event.data;

  try {
    const transform = new Function(
      "global",
      "streamingHistory",
      `
        "use strict";
        ${code}
      `,
    );

    const result = transform(globalVariables, streamingHistory);

    self.postMessage({
      result: JSON.stringify(result, null, 2),
    });
  } catch {
    self.postMessage({ result: "" });
  }
};
