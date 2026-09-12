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

    let result = transform(globalVariables, streamingHistory);

    if (Array.isArray(result)) {
      result = result.slice(0, 50);
    }

    self.postMessage({
      result,
    });
  } catch {
    self.postMessage({});
  }
};
