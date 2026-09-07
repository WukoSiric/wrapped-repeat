import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
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

  if (!context) {
    return null;
  }

  const { closeModal, modal } = context;

  useEffect(() => {
    if (modal === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal, modal]);

  const modalRoot = document.getElementById("modal-root");

  if (!modalRoot || modal === null) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex h-screen min-w-36 items-center justify-center overflow-hidden px-44 py-12 backdrop-blur-lg 2xl:px-81">
      {modal}
    </div>,
    modalRoot,
  );
};
