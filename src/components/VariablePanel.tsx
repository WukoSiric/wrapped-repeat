import { useMemo, useState } from "react";
import { Card } from "./Card";
import Heading from "./Heading";
import { Icon } from "./Icon";
import { useStreamingHistory } from "../hooks/useStreamingHistory";
import { truncateGlobalVariables } from "../helpers/globalVariableHelper";
import ReactJson from "@microlink/react-json-view";

export const VariablePanel = () => {
  const [collapsed, setCollapsed] = useState(true);

  const { globalVariables, streamingHistory } = useStreamingHistory();

  const globalVariablesPreview = useMemo(() => {
    const preview = truncateGlobalVariables(globalVariables, 1);

    return {
      global: preview,
      streamingHistory: [streamingHistory.at(0)],
    };
  }, [globalVariables]);

  return (
    <div className="absolute right-8 bottom-8 z-1">
      <Card className="bg-primary-global flex max-h-96 w-sm flex-col gap-2 px-0 py-2 2xl:w-lg">
        <div
          className={`${collapsed ? "hidden" : ""} max-h-full overflow-y-scroll p-2`}
        >
          <ReactJson
            src={globalVariablesPreview}
            theme={"harmonic"}
            name="streamingHistory"
            collapsed={3}
            style={{
              backgroundColor: "var(--primary-global)",
              // L:25 max-h-96 is 24rem
              minHeight: "23rem",
            }}
            quotesOnKeys={false}
            collapseStringsAfterLength={0}
            showComma={false}
            indentWidth={2}
          />
        </div>
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
