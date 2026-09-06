import { type PropsWithChildren } from "react";
import "./App.css";
import { Textarea } from "@headlessui/react";
import { Editor } from "@monaco-editor/react";
import SimpleNavbar from "./components/SimpleNavbar";
import Heading from "./components/Heading";
import { Button } from "./components/Button";
import { Divider } from "./components/Divider";
import { Pill } from "./components/Pill";
import { Slide } from "./components/Slide";

const Card = ({ children }: PropsWithChildren) => {
  return (
    <div className="bg-primary-surface border-primary-surface-highlight h-fit w-full rounded-xl border p-8">
      {children}
    </div>
  );
};

export const Sidebar = () => {
  return (
    <>
      <div className="bg-primary-surface border-primary-surface-highlight max-h-full w-1/5 min-w-96 flex-row border-r">
        <div className="flex w-full flex-row gap-2 p-6">
          <Button
            className="bg-primary-global hover:bg-primary-global-hover"
            leftIcon="data_array"
          >
            Global Variables
          </Button>
          <Button leftIcon="code_json">Streaming Data</Button>
        </div>
        <Divider />
        <div className="flex w-full flex-col gap-2 px-6 py-3">
          <Heading variant="4XL">Slides</Heading>
          <div className="flex flex-row gap-2">
            <Pill>Award</Pill>
            <Pill>Transitions</Pill>
          </div>
        </div>
        <Divider />

        <div className="flex flex-col gap-2 p-6">
          <Slide
            title="Sample Slide"
            description="This is a sample slide"
            slideType="award"
          />
        </div>
      </div>
    </>
  );
};

const App = () => {
  return (
    <div className="flex h-screen w-screen flex-col">
      <SimpleNavbar />
      <div className="flex h-full flex-1 flex-row">
        <Sidebar />
        {/* Content */}
        <div className="bg-background flex-1 p-16">
          {/* Container */}
          <Card>
            <Heading variant="4XL">Track of the Year</Heading>
            <Heading variant="XL">Description</Heading>
            <Textarea className="outline-tertiary-highlight border-primary-surface-highlight bg-secondary-surface text-primary-text outline-primary-surface-highlight w-full rounded-lg p-2 outline-1" />
            <Heading variant="XL">JSON Transformation</Heading>
            <div className="flex flex-col gap-0.5">
              <div className="grid grid-cols-2 gap-1">
                <div className="col-span-1 flex flex-col">
                  <Heading variant="L">Formula</Heading>
                  <Editor
                    theme="vs-dark"
                    className="outline-tertiary-highlight bg-primary-surface h-40 rounded-l p-2"
                    options={{
                      minimap: { enabled: false },
                    }}
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
        </div>
      </div>
    </div>
  );
};

export default App;
