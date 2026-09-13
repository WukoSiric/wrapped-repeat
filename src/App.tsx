import "./App.css";
import "./assets/css/AppLayout.css";
import SimpleNavbar from "./components/SimpleNavbar";
import { Sidebar } from "./components/Sidebar";
import { SlideContent } from "./slide/SlideContent";
import { ModalPortal, ModalProvider } from "./hooks/useModal";
import { StreamingHistoryProvider } from "./hooks/useStreamingHistory";
import { FileProvider } from "./hooks/useFiles";
import { VariablePanel } from "./components/VariablePanel";
import { DEFAULT_SLIDE_INPUT } from "./helpers/slideHelper";

const App = () => {
  return (
    <ModalProvider>
      <FileProvider>
        <StreamingHistoryProvider>
          <AppLayout />
          <div id="modal-root" />
          <ModalPortal />
        </StreamingHistoryProvider>
      </FileProvider>
    </ModalProvider>
  );
};

const AppLayout = () => {
  return (
    <div className="appLayout h-screen w-screen">
      <SimpleNavbar />
      <Sidebar />
      <div className="pageContent bg-background relative flex-1 overflow-auto p-16">
        <VariablePanel />
        <SlideContent
          title="Track of the Year"
          description="The best track of the year"
          editorContent={DEFAULT_SLIDE_INPUT}
        />
      </div>
    </div>
  );
};

export default App;
