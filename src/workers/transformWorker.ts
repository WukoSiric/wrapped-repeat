import type { ResultRequest } from "../types/WorkerMessage";

self.onmessage = (event: MessageEvent<ResultRequest>) => {
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
  } catch (error: unknown) {
    console.log(error);
    throw error;
  }
};
