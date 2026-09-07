import "./App.css";
import SimpleNavbar from "./components/SimpleNavbar";
import { Sidebar } from "./components/Sidebar";
import { SlideContent } from "./slide/SlideContent";
import { ModalPortal, ModalProvider } from "./hooks/useModal";
import { StreamingHistoryProvider } from "./hooks/useStreamingHistory";
import { FileProvider } from "./hooks/useFiles";

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
    <div className="flex h-screen w-screen flex-col">
      <SimpleNavbar />
      <div className="flex min-h-0 flex-1 flex-row">
        <Sidebar />
        <div className="bg-background flex-1 p-16">
          <SlideContent
            title="Track of the Year"
            description="The best track of the year"
            editorContent=""
          />
        </div>
      </div>
    </div>
  );
};

export default App;
