import { type PropsWithChildren } from "react";
import "./App.css";
import { Textarea } from "@headlessui/react";
import { Editor } from "@monaco-editor/react";
import SimpleNavbar from "./components/SimpleNavbar";
import Heading from "./components/Heading";
import { Button } from "./components/Button";
import { Divider } from "./components/Divider";

const Card = ({ children }: PropsWithChildren) => {
  return (
    <div className="h-fit w-full rounded-xl bg-primary-surface p-8 border border-primary-surface-highlight">
      {children}
    </div>
  );
};



export const Sidebar = () => {
  return (
    <>
      <div className="h-screen min-w-96 w-1/5 bg-primary-surface border-r border-primary-surface-highlight flex-row">
        <div className="w-full flex flex-row gap-2 p-6">
          <Button color="004687" leftIcon="data_array">Global Variables</Button>
          <Button leftIcon="code_json">Streaming Data</Button>
        </div>
        <Divider />
      </div>
    </>
  );
};

export const NavigationBar = () => {
  return <></>;
};

const App = () => {
  return (
    <div className="h-screen w-screen">
      <SimpleNavbar />
      <div className="flex h-full flex-row col-span-2">
        <Sidebar />
        {/* Content */}
        <div className="bg-background w-full h-full p-16">
          {/* Container */}
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
    </div>
  );
};

export default App;
