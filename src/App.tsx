import React from "react";
import "./App.css";
import { Textarea } from "@headlessui/react";
import { Editor } from "@monaco-editor/react";
import SimpleNavbar from "./components/SimpleNavbar";
import Heading from "./components/Heading";
import { Button } from "./components/Button";

const Card = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="h-fit w-full rounded-2xl bg-primary-surface p-8 drop-shadow-lg">
      {children}
    </div>
  );
};

const StreamingHistoryData = () => {
  return (
    <Card>
      <Heading variant="4XL">Streaming History Data</Heading>
    </Card>
  );
};

const App = () => {
  return (
    <>
      <SimpleNavbar />
      <div className="flex h-screen w-screen justify-center bg-green-500 pt-14">
        {/* Container */}
        <div className="flex w-full max-w-1/2 flex-col gap-10 py-10">
          <Button>My button </Button>

          <StreamingHistoryData />
          <Card>
            <Heading variant="4XL">Track of the Year</Heading>
            <Heading variant="XL">Description</Heading>
            <Textarea className="w-full rounded-l border-secondary-surface bg-secondary-surface p-2 text-primary-text outline-2 outline-tertiary-highlight hover:border-accent-surface focus:outline-2" />
            <Heading variant="XL">JSON Transformation</Heading>
            <div className="grid grid-cols-2 gap-2 p-2">
              <div className="col-span-1 flex flex-col">
                <Heading variant="L">Formula</Heading>
                <Editor
                  theme="vs-dark"
                  className="h-40 rounded-l bg-primary-surface p-2 outline-tertiary-highlight"
                  options={{
                    minimap: { enabled: false },
                  }}
                />
              </div>
              <div className="col-span-1">
                <Heading variant="L">Result</Heading>
                <Editor
                  theme="vs-dark"
                  className="col-span-1 h-40 rounded-l bg-primary-surface p-2 outline-tertiary-highlight"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default App;
