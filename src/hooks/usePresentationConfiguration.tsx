import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";

import type { PresentationConfiguration } from "../types/PresentationConfiguration";

type PresentationConfigurationContextValue = {
  presentationConfiguration: PresentationConfiguration;
  patchConfiguration: (path: string, value: unknown) => void;
};

const PresentationConfigurationContext = createContext<
  PresentationConfigurationContextValue | undefined
>(undefined);

export const PresentationConfigurationProvider = ({
  children,
  initialConfiguration,
}: PropsWithChildren<{
  initialConfiguration: PresentationConfiguration;
}>) => {
  const [presentationConfiguration, setPresentationConfiguration] =
    useState(initialConfiguration);

  const patchConfiguration = useCallback((path: string, value: unknown) => {
    setPresentationConfiguration((currentConfiguration) => {
      const nextConfiguration = cloneDeep(currentConfiguration);
      set(nextConfiguration, path, value);
      return nextConfiguration;
    });
  }, []);

  return (
    <PresentationConfigurationContext.Provider
      value={{ presentationConfiguration, patchConfiguration }}
    >
      {children}
    </PresentationConfigurationContext.Provider>
  );
};

export const usePresentationConfiguration = () => {
  const context = useContext(PresentationConfigurationContext);

  if (!context) {
    throw new Error(
      "usePresentationConfiguration must be used within a PresentationConfigurationProvider",
    );
  }

  return context;
};
