import { useMemo, useState } from "react";
import { Card } from "./Card";
import Heading from "./Heading";
import { Icon } from "./Icon";
import { Editor } from "@monaco-editor/react";
import { useStreamingHistory } from "../hooks/useStreamingHistory";
import { stringifyJson } from "../helpers/jsonHelper";
import { cloneDeep } from "lodash";

export const VariablePanel = () => {
  const [collapsed, setCollapsed] = useState(true);

  const { globalVariables, streamingHistory } = useStreamingHistory();

  const globalVariablesPreview = useMemo(() => {
    const preview = cloneDeep(globalVariables);

    preview.yearlyAggregate = preview.yearlyAggregate?.slice(0, 1);
    preview.quarterlyAggregate = preview.quarterlyAggregate?.slice(0, 1);
    preview.yearOverYearAggregate = preview.yearOverYearAggregate?.slice(0, 1);
    preview.halfAggregate = preview.halfAggregate?.slice(0, 1);

    return {
      global: preview,
      streamingHistory: [streamingHistory.at(0)],
    };
  }, [globalVariables]);

  return (
    <div className="absolute right-8 bottom-8 z-1">
      <Card className="bg-primary-global flex max-h-full w-sm flex-col gap-2 px-0 py-2 2xl:w-lg">
        <Editor
          theme="vs-dark"
          options={{
            automaticLayout: true,
            lineNumbers: "off",
            fontSize: 12,
            minimap: { enabled: false },
          }}
          className={`${collapsed ? "hidden" : ""} outline-tertiary-highlight bg-primary-global h-full min-h-72 flex-1 rounded-l p-2`}
          value={stringifyJson(globalVariablesPreview)}
          defaultLanguage="json"
        />
        <div
          className="flex cursor-pointer flex-row justify-between p-4 select-none"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Heading>Variables</Heading>
          <Icon
            name={collapsed ? "keyboard_arrow_down" : "keyboard_arrow_up"}
            className="text-primary-text"
          />
        </div>
      </Card>
    </div>
  );
};
