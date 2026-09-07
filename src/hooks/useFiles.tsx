import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

type FilesContextValue = {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
};

const FilesContext = createContext<FilesContextValue | null>(null);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<File[]>([]);

  const value = useMemo(() => ({ files, setFiles }), [files]);

  return (
    <FilesContext.Provider value={value}>{children}</FilesContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FilesContext);

  if (!context) {
    throw new Error("useFiles must be used inside a FileProvider");
  }

  return context;
};
