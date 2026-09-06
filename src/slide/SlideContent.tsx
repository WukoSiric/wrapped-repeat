import { Textarea } from "@headlessui/react";
import Heading from "../components/Heading";
import { Editor } from "@monaco-editor/react";
import { Card } from "../components/Card";

interface SlideContentProps {
  title: string;
  description: string;
  editorContent: string;
}

export const SlideContent = ({
  title,
  description,
  editorContent,
}: SlideContentProps) => {
  return (
    <Card>
      <Heading variant="4XL">{title}</Heading>
      <Heading variant="XL">Description</Heading>
      <Textarea
        className="outline-tertiary-highlight border-primary-surface-highlight bg-secondary-surface text-primary-text outline-primary-surface-highlight w-full rounded-lg p-2 outline-1"
        value={description}
      />
      <Heading variant="XL">Transformation</Heading>
      <div className="flex flex-col gap-0.5">
        <div className="grid grid-cols-2 gap-1">
          <div className="col-span-1 flex flex-col">
            <Heading variant="L">Input</Heading>
            <Editor
              theme="vs-dark"
              className="outline-tertiary-highlight bg-primary-surface h-40 rounded-l p-2"
              options={{
                minimap: { enabled: false },
              }}
              defaultValue={editorContent}
            />
          </div>
          <div className="col-span-1">
            <Heading variant="L">Result</Heading>
            <Editor
              theme="vs-dark"
              className="outline-tertiary-highlight bg-primary-surface h-40 rounded-l p-2"
              options={{
                readOnly: true,
                minimap: { enabled: false },
              }}
            />
          </div>
        </div>
      </div>

      <Heading variant="XL">Columns to showcase: </Heading>
    </Card>
  );
};
