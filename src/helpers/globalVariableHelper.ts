import type { GlobalVariableBuilderResult } from "./GlobalVariableBuilder";
import { cloneDeep } from "lodash";

export const truncateGlobalVariables = (
  globalVariables: GlobalVariableBuilderResult,
  toSize: number = 1,
): GlobalVariableBuilderResult => {
  const truncatedVariables = cloneDeep(globalVariables);

  truncatedVariables.yearlyAggregate =
    truncatedVariables.yearlyAggregate?.slice(0, toSize);

  truncatedVariables.quarterlyAggregate =
    truncatedVariables.quarterlyAggregate?.slice(0, toSize);

  truncatedVariables.yearOverYearAggregate =
    truncatedVariables.yearOverYearAggregate?.slice(0, toSize);

  truncatedVariables.halfAggregate = truncatedVariables.halfAggregate?.slice(
    0,
    toSize,
  );

  return truncatedVariables;
};
