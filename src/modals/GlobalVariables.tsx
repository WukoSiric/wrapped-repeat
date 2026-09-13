import { useStreamingHistory } from "../hooks/useStreamingHistory";
import { Modal } from "./Modal";
import { useMemo } from "react";
import { openJsonInNewTab } from "../helpers/jsonHelper";
import { truncateGlobalVariables } from "../helpers/globalVariableHelper";
import Heading from "../components/Heading";
import { Button } from "../components/Button";
import ReactJson from "@microlink/react-json-view";

export const GlobalVariables = () => {
  const { streamingHistory, globalVariables } = useStreamingHistory();

  const globalVariablesDisplay = useMemo(() => {
    const globalVariablesDisplay = truncateGlobalVariables(globalVariables, 10);
    return globalVariablesDisplay;
  }, [streamingHistory, globalVariables]);

  const slicedStreamingHistory = useMemo(() => {
    return streamingHistory.slice(0, 50);
  }, []);

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
          <ReactJson
            quotesOnKeys={false}
            indentWidth={2}
            src={slicedStreamingHistory}
            theme={"summerfruit"}
            name="streamingHistory"
            collapsed={1}
            style={{
              backgroundColor: "var(--color-primary-surface)",
            }}
          />
        </div>
      </div>
    </Modal>
  );
};
