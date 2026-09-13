import { Button } from "./Button";
import { Divider } from "./Divider";
import Heading from "./Heading";
import { Pill } from "./Pill";
import { Search } from "./Search";
import { Slide } from "../slide/Slide";
import { useModal } from "../hooks/useModal";
import { ImportData } from "../modals/ImportData";
import { GlobalVariables } from "../modals/GlobalVariables";
import { DynamicSpacer } from "./DynamicSpacer";

const Slides = () => {
  return (
    <>
      <Slide
        title="Sample Slide"
        description="This is a sample slide"
        slideType="award"
      />
      <DynamicSpacer>
        <Button leftIcon="add">Add</Button>
      </DynamicSpacer>
      <Slide
        title="Sample Slide"
        description="This is a sample slide"
        slideType="award"
      />
      <DynamicSpacer>
        <Button leftIcon="add">Add</Button>
      </DynamicSpacer>
      <Slide
        title="Sample Slide"
        description="This is a sample slide"
        slideType="award"
      />
      <DynamicSpacer>
        <Button leftIcon="add">Add</Button>
      </DynamicSpacer>
    </>
  );
};

export const Sidebar = () => {
  const { openModal } = useModal();

  return (
    <div className="bg-primary-surface border-primary-surface-highlight flex max-h-full w-1/5 min-w-96 flex-col border-r">
      {/* Variables & Import Data */}
      <div className="flex w-full flex-row justify-center gap-2 p-6">
        <Button
          className="bg-primary-global hover:bg-primary-global-hover"
          leftIcon="data_array"
          onClick={() => openModal(<GlobalVariables />)}
        >
          Variables
        </Button>
        <Button leftIcon="code_json" onClick={() => openModal(<ImportData />)}>
          Import Data
        </Button>
      </div>
      <Divider />
      {/* Slide Controls */}
      <div className="flex w-full flex-col gap-2 px-6 py-3">
        <Heading variant="4XL">Slides</Heading>
        <div className="flex flex-row gap-2">
          <Pill>Award</Pill>
          <Pill>Transitions</Pill>
        </div>
        <Search />
      </div>
      <Divider />
      {/* Slides */}
      <div className="flex max-h-full min-h-0 max-w-full flex-1 flex-col items-center overflow-x-hidden overflow-y-scroll p-6">
        <Slides />
      </div>
    </div>
  );
};
