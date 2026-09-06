import "./App.css";
import SimpleNavbar from "./components/SimpleNavbar";
import { Sidebar } from "./components/Sidebar";
import { SlideContent } from "./slide/SlideContent";
import { ModalPortal, ModalProvider } from "./hooks/useModal";

const App = () => {
  return (
    <ModalProvider>
      <AppLayout />
      <div id="modal-root" />
      <ModalPortal />
    </ModalProvider>
  );
};

const AppLayout = () => {
  return (
    <div className="flex max-h-screen w-screen flex-col">
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
