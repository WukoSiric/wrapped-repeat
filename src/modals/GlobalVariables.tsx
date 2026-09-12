import { Editor } from "@monaco-editor/react";
import { useStreamingHistory } from "../hooks/useStreamingHistory";
import { Modal } from "./Modal";
import { useMemo } from "react";

export const GlobalVariables = () => {
  const { streamingHistory, globalVariables } = useStreamingHistory();

  const globalVariablesDisplay = useMemo(() => {
    const globalVariablesDisplay = {
      global: globalVariables,
    };
    return JSON.stringify(globalVariablesDisplay, null, 2);
  }, [streamingHistory, globalVariables]);

  return (
    <Modal title="Global Variables">
      <Editor
        theme="vs-dark"
        className="outline-tertiary-highlight bg-primary-surface absolute h-full rounded-l p-2"
        defaultLanguage="javascript"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
        value={globalVariablesDisplay}
      />
    </Modal>
  );
};
