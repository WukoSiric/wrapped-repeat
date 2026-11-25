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
import { PresentationConfigurationProvider } from "./hooks/usePresentationConfiguration";
import type { PresentationConfiguration } from "./types/PresentationConfiguration";

const initialConfiguration: PresentationConfiguration = {
  id: "2026-wrapped",
  slides: [
    {
      id: "track-of-the-year",
      type: "song",
      title: "Track of the Year",
      description: "The best track of the year",
    },
    {
      id: "artist-of-the-year",
      type: "artist",
      title: "Artist of the Year",
      description: "The top artist of the year",
    },
  ],
  excludedTracks: ["Skippable Song__Example Artist", "Test Track__Demo Artist"],
};

const App = () => {
  return (
    <ModalProvider>
      <FileProvider>
        <StreamingHistoryProvider>
          <PresentationConfigurationProvider
            initialConfiguration={initialConfiguration}
          >
            <AppLayout />
            <div id="modal-root" />
            <ModalPortal />
          </PresentationConfigurationProvider>
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
