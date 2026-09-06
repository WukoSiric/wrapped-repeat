import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

type ModalContextValue = {
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
  isOpen: boolean;
  modal: ReactNode | null;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<ReactNode | null>(null);

  const openModal = useCallback((content: ReactNode) => setModal(content), []);

  const closeModal = useCallback(() => setModal(null), []);

  const value = useMemo(
    () => ({ openModal, closeModal, isOpen: modal !== null, modal }),
    [closeModal, modal, openModal],
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal must be used inside a ModalProvider");
  }

  return context;
};

export const ModalPortal = () => {
  const context = useContext(ModalContext);
  const modalRoot = document.getElementById("modal-root");

  if (!context || !modalRoot) {
    return null;
  }

  return createPortal(context.modal, modalRoot);
};
