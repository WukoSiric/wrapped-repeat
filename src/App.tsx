import { type PropsWithChildren } from "react";
import "./App.css";
import { Textarea } from "@headlessui/react";
import { Editor } from "@monaco-editor/react";
import SimpleNavbar from "./components/SimpleNavbar";
import Heading from "./components/Heading";
import { Button } from "./components/Button";

const Card = ({ children }: PropsWithChildren) => {
  return (
    <div className="h-fit w-full rounded-xl bg-primary-surface p-8 drop-shadow-lg">
      {children}
    </div>
  );
};

const Sidebar = () => {
  return <></>;
};

const NavigationBar = () => {
  return <></>;
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
      <div className="flex h-screen w-screen justify-center bg-background pt-14">
        {/* Container */}
        <div className="flex w-full max-w-1/2 flex-col gap-10 py-10">
          <Button>My button </Button>

          <StreamingHistoryData />
          <Card>
            <Heading variant="4XL">Track of the Year</Heading>
            <Heading variant="XL">Description</Heading>
            <Textarea className="outline-tertiary-highlight w-full rounded-lg border-primary-surface-highlight bg-secondary-surface p-2 text-primary-text outline-1 outline-primary-surface-highlight" />
            <Heading variant="XL">JSON Transformation</Heading>
            <div className="flex flex-col gap-0.5">
              <div className="grid grid-cols-2 gap-1">
                <div className="col-span-1 flex flex-col">
                  <Heading variant="L">Formula</Heading>
                  <Editor
                    theme="vs-dark"
                    className="outline-tertiary-highlight h-40 rounded-l bg-primary-surface p-2"
                    options={{
                      minimap: { enabled: false },
                    }}
                  />
                </div>
                <div className="col-span-1">
                  <Heading variant="L">Result</Heading>
                  <Editor
                    theme="vs-dark"
                    className="outline-tertiary-highlight h-40 rounded-l bg-primary-surface p-2"
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
    </>
  );
};

export default App;
