import { useStreamingHistory } from "../hooks/useStreamingHistory";
import { Modal } from "./Modal";
import { useEffect, useMemo, useState } from "react";
import { openJsonInNewTab } from "../helpers/jsonHelper";
import Heading from "../components/Heading";
import { Button } from "../components/Button";
import ReactJson from "@microlink/react-json-view";

export const GlobalVariables = () => {
  const { streamingHistory, globalVariables, globalVariablesDisplay } =
    useStreamingHistory();
  const [shouldRenderJson, setShouldRenderJson] = useState(false);

  // Defer JSON rendering to allow the modal to render first
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setShouldRenderJson(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const slicedStreamingHistory = useMemo(() => {
    return streamingHistory.slice(0, 50);
  }, [streamingHistory]);

  return (
    <Modal title="Variables">
      <div className="flex flex-row"></div>
      <div className="flex w-full flex-col gap-1">
        <div className="flex flex-row justify-between">
          <Heading variant="2XL">Global</Heading>
          <Button
            leftIcon="open_in_new"
            className="bg-primary-global hover:bg-primary-global-hover"
            onClick={() => openJsonInNewTab(globalVariables)}
          >
            View Full
          </Button>
        </div>
        <div className="max-h-full overflow-y-scroll rounded-lg">
          {shouldRenderJson ? (
            <ReactJson
              quotesOnKeys={false}
              indentWidth={2}
              src={globalVariablesDisplay}
              theme={"summerfruit"}
              name="global"
              style={{
                backgroundColor: "var(--color-primary-surface)",
              }}
            />
          ) : null}
        </div>
      </div>
      <div className="flex w-full flex-col gap-1">
        <div className="flex flex-row justify-between">
          <Heading variant="2XL">Streaming History </Heading>
          <Button
            leftIcon="open_in_new"
            className="bg-primary-global hover:bg-primary-global-hover"
            onClick={() => openJsonInNewTab(streamingHistory)}
          >
            View Full
          </Button>
        </div>
        <div className="max-h-full overflow-y-scroll rounded-lg">
          {shouldRenderJson ? (
            <ReactJson
              quotesOnKeys={false}
              indentWidth={2}
              src={slicedStreamingHistory}
              theme={"summerfruit"}
              name="streamingHistory"
              collapsed={2}
              style={{
                backgroundColor: "var(--color-primary-surface)",
              }}
            />
          ) : null}
        </div>
      </div>
    </Modal>
  );
};
