import React, { createContext, useContext, useMemo, useState } from "react";
import type {
  SlideConfiguration,
  SlideId,
} from "../types/PresentationConfiguration";

type AwardConfigurationContextValue = {
  slideId: SlideId;
  slideConfiguration: SlideConfiguration;
};

type AwardConfigurationProviderProps = React.PropsWithChildren<{
  slideConfigurationContext: AwardConfigurationContextValue;
}>;

const AwardConfigurationContext = createContext<AwardConfigurationContextValue>(
  undefined!,
);

export const SlideConfigurationProvider = ({
  children,
  slideConfigurationContext: initialValue,
}: AwardConfigurationProviderProps) => {
  const [slideId, setSlideId] = useState<SlideId>(initialValue.slideId);
  const [slideConfiguration, setSlideConfiguration] =
    useState<SlideConfiguration>(initialValue.slideConfiguration);

  const value = useMemo(
    () => ({
      slideId,
      slideConfiguration,
    }),
    [slideId, slideConfiguration],
  );

  return (
    <AwardConfigurationContext.Provider value={value}>
      {children}
    </AwardConfigurationContext.Provider>
  );
};

export const useSlideConfiguration = () => {
  return useContext(AwardConfigurationContext);
};
