import { Editor } from "@monaco-editor/react";
import { useStreamingHistory } from "../hooks/useStreamingHistory";
import { Modal } from "./Modal";
import { useMemo } from "react";
import { openJsonInNewTab, stringifyJson } from "../helpers/jsonHelper";
import { truncateGlobalVariables } from "../helpers/globalVariableHelper";
import Heading from "../components/Heading";
import { Button } from "../components/Button";

export const GlobalVariables = () => {
  const { streamingHistory, globalVariables } = useStreamingHistory();

  const globalVariablesDisplay = useMemo(() => {
    const globalVariablesDisplay = {
      global: truncateGlobalVariables(globalVariables, 10),
    };
    return stringifyJson(globalVariablesDisplay);
  }, [streamingHistory, globalVariables]);

  const slicedStreamingHistory = useMemo(() => {
    return stringifyJson(streamingHistory.slice(0, 50));
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
        <Editor
          theme="vs-dark"
          className="outline-tertiary-highlight bg-primary-surface absolute h-full rounded-l"
          defaultLanguage="javascript"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            automaticLayout: true,
          }}
          value={globalVariablesDisplay}
        />
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
        <Editor
          theme="vs-dark"
          className="outline-tertiary-highlight bg-primary-surface absolute h-full rounded-l"
          defaultLanguage="javascript"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            automaticLayout: true,
          }}
          value={slicedStreamingHistory}
        />
      </div>
    </Modal>
  );
};
