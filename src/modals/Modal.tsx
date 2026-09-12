import type React from "react";
import { Card } from "../components/Card";
import { useModal } from "../hooks/useModal";
import { useMemo } from "react";
import Heading from "../components/Heading";
import { Icon } from "../components/Icon";

interface ModalProps {
  title: string;
}

export const Modal = ({
  title,
  children,
}: React.PropsWithChildren<ModalProps>) => {
  const { closeModal } = useModal();

  const heading = useMemo(() => {
    return (
      <div className="flex w-full flex-row justify-between">
        <Heading variant="4XL">{title}</Heading>
        <Icon
          name="close"
          className="text-primary-text cursor-pointer"
          onClick={() => {
            closeModal();
          }}
          size={36}
        />
      </div>
    );
  }, [closeModal, title]);

  return (
    <Card className="h-full max-h-full overflow-hidden">
      <div className="flex h-full min-h-0 flex-col items-center gap-8 p-4">
        {heading}
        <div className="flex min-h-0 w-full flex-1 flex-row gap-4">
          {children}
        </div>
      </div>
    </Card>
  );
};
