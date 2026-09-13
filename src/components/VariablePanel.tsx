import { useEffect, useMemo, useState } from "react";
import { Card } from "./Card";
import Heading from "./Heading";
import { Icon } from "./Icon";
import { useStreamingHistory } from "../hooks/useStreamingHistory";
import { truncateGlobalVariables } from "../helpers/globalVariableHelper";
import ReactJson from "@microlink/react-json-view";

export const VariablePanel = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [shouldRenderJson, setShouldRenderJson] = useState(false);

  const { globalVariables, streamingHistory } = useStreamingHistory();

  useEffect(() => {
    if (collapsed) {
      setShouldRenderJson(false);
      return;
    }

    const frame = requestAnimationFrame(() => {
      setShouldRenderJson(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [collapsed]);

  const globalVariablesPreview = useMemo(() => {
    const preview = truncateGlobalVariables(globalVariables, 1);

    return {
      global: preview,
      streamingHistory: [streamingHistory.at(0)],
    };
  }, [globalVariables, streamingHistory]);

  return (
    <div className="absolute right-8 bottom-8 z-1">
      <Card className="bg-primary-global flex max-h-96 w-sm flex-col gap-2 px-0 py-2 2xl:w-lg">
        <div
          className={`${collapsed ? "hidden" : ""} max-h-full overflow-y-scroll p-2`}
        >
          {shouldRenderJson ? (
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
          ) : null}
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
